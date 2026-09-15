import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { mutateDb, readDb, publicUser } from './lib/store.js';
import { COOKIE_NAME, clearSession, issueToken, otpCode, otpHash, optionalUser, randomToken, requireUser, safeReturnTo, setSession, tokenHash, verifyToken } from './lib/auth.js';
import { canCreate, canDelete, canRead, canUpdate, ENTITY_NAMES, id, makeRecord, matches, now, sortRows } from './lib/entities.js';
import { sendMail } from './lib/mail.js';
import { chatAssistant } from './functions/chatAssistant.js';
import { destinationImageLookup } from './functions/destinationImageLookup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 8787);
const APP_ORIGIN = process.env.APP_ORIGIN || `http://localhost:5173`;
const JWT_SECRET = process.env.JWT_SECRET || 'development-only-change-me';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/api/health', (req,res) => res.json({ ok:true, app:'TourInsight' }));
app.get('/api/app/settings', (req,res) => res.json({ app_name:'TourInsight', auth_required:false, google_oauth_configured:!!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) }));

function normalizeEmail(v) { return String(v || '').trim().toLowerCase(); }
function authPayload(res, user) {
  const token = issueToken(user); setSession(res, token); return { user:publicUser(user), access_token:token };
}
async function sendOtpEmail(user, code) {
  await sendMail({ to:user.email, subject:'Your TourInsight verification code', text:`Your TourInsight verification code is ${code}. It expires in 15 minutes.`, html:`<p>Your TourInsight verification code is <strong>${code}</strong>.</p><p>It expires in 15 minutes.</p>` });
}

app.post('/api/auth/register', async (req,res) => {
  const email = normalizeEmail(req.body?.email), password = String(req.body?.password || '');
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error:'Enter a valid email address' });
  if (password.length < 6) return res.status(400).json({ error:'Password must be at least 6 characters' });
  const code = otpCode();
  let user;
  try {
    user = await mutateDb(async (db) => {
      const existing = db.User.find((u) => u.email === email);
      if (existing?.verified) throw Object.assign(new Error('An account with this email already exists'), { status:409 });
      const password_hash = await bcrypt.hash(password, 10);
      if (existing) {
        Object.assign(existing, { password_hash, otp_code_hash:otpHash(code), otp_expires_at:new Date(Date.now()+15*60*1000).toISOString(), updated_date:now() });
        return existing;
      }
      const record = { id:id(), email, role:'user', verified:false, password_hash, otp_code_hash:otpHash(code), otp_expires_at:new Date(Date.now()+15*60*1000).toISOString(), created_date:now(), updated_date:now() };
      db.User.push(record); return record;
    });
  } catch (e) { return res.status(e.status || 500).json({ error:e.message || 'Registration failed' }); }
  await sendOtpEmail(user, code);
  res.status(201).json({ ok:true, verification_required:true });
});

app.post('/api/auth/verify-otp', async (req,res) => {
  const email = normalizeEmail(req.body?.email), code = String(req.body?.otpCode || '');
  try {
    const user = await mutateDb((db) => {
      const u = db.User.find((x) => x.email === email);
      if (!u || u.otp_code_hash !== otpHash(code) || !u.otp_expires_at || new Date(u.otp_expires_at) < new Date()) throw Object.assign(new Error('Invalid or expired verification code'), { status:400 });
      u.verified = true; u.otp_code_hash = null; u.otp_expires_at = null; u.updated_date = now(); return u;
    });
    res.json(authPayload(res, user));
  } catch (e) { res.status(e.status || 500).json({ error:e.message }); }
});

app.post('/api/auth/resend-otp', async (req,res) => {
  const email = normalizeEmail(req.body?.email), code = otpCode(); let user = null;
  await mutateDb((db) => { const u = db.User.find((x)=>x.email===email && !x.verified); if (!u) return; u.otp_code_hash=otpHash(code); u.otp_expires_at=new Date(Date.now()+15*60*1000).toISOString(); u.updated_date=now(); user=u; });
  if (user) await sendOtpEmail(user, code);
  res.json({ ok:true });
});

app.post('/api/auth/login', async (req,res) => {
  const email = normalizeEmail(req.body?.email), password = String(req.body?.password || '');
  const db = await readDb(); const user = db.User.find((u)=>u.email===email);
  if (!user || !user.verified || !(await bcrypt.compare(password, user.password_hash || ''))) return res.status(401).json({ error:'Invalid email or password' });
  res.json(authPayload(res, user));
});
app.get('/api/auth/me', async (req,res) => { const user = await optionalUser(req); if (!user) return res.status(401).json({ error:'Authentication required', reason:'auth_required' }); res.json(publicUser(user)); });
app.post('/api/auth/logout', (req,res) => { clearSession(res); res.json({ ok:true }); });

app.post('/api/auth/request-password-reset', async (req,res) => {
  const email = normalizeEmail(req.body?.email); const db = await readDb(); const user = db.User.find((u)=>u.email===email && u.verified);
  if (user) {
    const raw = randomToken(24); const expires = new Date(Date.now()+30*60*1000).toISOString();
    await mutateDb((state)=>{ state.PasswordReset = state.PasswordReset.filter((x)=>x.user_id!==user.id); state.PasswordReset.push({ id:id(), user_id:user.id, token_hash:tokenHash(raw), expires_at:expires, created_date:now() }); });
    const link = `${APP_ORIGIN}/reset-password?token=${encodeURIComponent(raw)}`;
    await sendMail({ to:user.email, subject:'Reset your TourInsight password', text:`Reset your password: ${link}\nThis link expires in 30 minutes.`, html:`<p><a href="${link}">Reset your TourInsight password</a></p><p>This link expires in 30 minutes.</p>` });
  }
  res.json({ ok:true });
});
app.post('/api/auth/reset-password', async (req,res) => {
  const resetToken = String(req.body?.resetToken || ''), newPassword = String(req.body?.newPassword || '');
  if (newPassword.length < 6) return res.status(400).json({ error:'Password must be at least 6 characters' });
  try {
    const hash = tokenHash(resetToken); const password_hash = await bcrypt.hash(newPassword,10);
    await mutateDb((db)=>{ const row=db.PasswordReset.find((x)=>x.token_hash===hash && new Date(x.expires_at)>new Date()); if(!row) throw Object.assign(new Error('Invalid or expired reset link'),{status:400}); const user=db.User.find((u)=>u.id===row.user_id); if(!user) throw Object.assign(new Error('Account not found'),{status:404}); user.password_hash=password_hash; user.updated_date=now(); db.PasswordReset=db.PasswordReset.filter((x)=>x.id!==row.id); });
    res.json({ ok:true });
  } catch (e) { res.status(e.status||500).json({ error:e.message }); }
});

// Optional Google OAuth. The app remains fully usable with email/password when these env vars are absent.
app.get('/api/auth/google', (req,res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(501).send('Google sign-in is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.');
  const returnTo = safeReturnTo(req.query.returnTo); const callback = process.env.GOOGLE_CALLBACK_URL || `${APP_ORIGIN.replace(/\/$/,'')}/api/auth/google/callback`;
  const state = jwt.sign({ returnTo }, JWT_SECRET, { expiresIn:'10m' });
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID); url.searchParams.set('redirect_uri', callback); url.searchParams.set('response_type','code'); url.searchParams.set('scope','openid email profile'); url.searchParams.set('state',state); url.searchParams.set('prompt','select_account');
  res.redirect(url.toString());
});
app.get('/api/auth/google/callback', async (req,res) => {
  try {
    const state = verifyToken(String(req.query.state||'')); if(!state) throw new Error('Invalid OAuth state');
    const callback = process.env.GOOGLE_CALLBACK_URL || `${APP_ORIGIN.replace(/\/$/,'')}/api/auth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code:String(req.query.code||''),client_id:process.env.GOOGLE_CLIENT_ID,client_secret:process.env.GOOGLE_CLIENT_SECRET,redirect_uri:callback,grant_type:'authorization_code'})});
    const tokenData = await tokenRes.json(); if(!tokenRes.ok) throw new Error(tokenData.error_description||'Google token exchange failed');
    const profileRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{Authorization:`Bearer ${tokenData.access_token}`}}); const profile=await profileRes.json(); if(!profileRes.ok||!profile.email) throw new Error('Google profile unavailable');
    const user = await mutateDb(async (db)=>{ let u=db.User.find((x)=>x.email===normalizeEmail(profile.email)); if(!u){u={id:id(),email:normalizeEmail(profile.email),name:profile.name||'',picture:profile.picture||'',role:'user',verified:true,google_sub:profile.sub,password_hash:await bcrypt.hash(randomToken(24),10),created_date:now(),updated_date:now()};db.User.push(u);}else{u.verified=true;u.google_sub=profile.sub;u.name=u.name||profile.name||'';u.picture=u.picture||profile.picture||'';u.updated_date=now();}return u;});
    const token=issueToken(user); setSession(res,token); res.redirect(safeReturnTo(state.returnTo));
  } catch (e) { res.status(400).send(`Google sign-in failed: ${e.message}`); }
});

// Entity API
app.use('/api/entities', async (req,res,next) => { req.user = await optionalUser(req); next(); });
function entityOr404(req,res) { const entity=req.params.entity; if(!ENTITY_NAMES.has(entity)){res.status(404).json({error:'Unknown entity'});return null;} return entity; }
app.get('/api/entities/:entity', async (req,res) => {
  const entity=entityOr404(req,res); if(!entity)return; const db=await readDb(); let filter={}; try{filter=req.query.filter?JSON.parse(req.query.filter):{};}catch{return res.status(400).json({error:'Invalid filter'});} let rows=(db[entity]||[]).filter((r)=>canRead(entity,r,req.user)&&matches(r,filter)); rows=sortRows(rows,String(req.query.sort||'')); rows=rows.slice(0,Math.min(500,Math.max(1,Number(req.query.limit||50)))); res.json(rows);
});
app.post('/api/entities/:entity/bulk', requireUser, async (req,res) => {
  const entity=entityOr404(req,res); if(!entity)return; if(!canCreate(entity,req.user))return res.status(403).json({error:'Forbidden'}); const records=Array.isArray(req.body?.records)?req.body.records.slice(0,100):[]; const created=await mutateDb((db)=>records.map((data)=>{const r=makeRecord(data,req.user);db[entity].push(r);return r;})); res.status(201).json(created);
});
app.patch('/api/entities/:entity/bulk-update', requireUser, async (req,res) => {
  const entity=entityOr404(req,res); if(!entity)return; const records=Array.isArray(req.body?.records)?req.body.records.slice(0,100):[]; try{const updated=await mutateDb((db)=>records.map((patch)=>{const r=db[entity].find((x)=>x.id===patch.id);if(!r)throw Object.assign(new Error(`Record ${patch.id} not found`),{status:404});if(!canUpdate(entity,r,req.user))throw Object.assign(new Error('Forbidden'),{status:403});Object.assign(r,{...patch,id:r.id,created_by_id:r.created_by_id,created_date:r.created_date,updated_date:now()});return r;}));res.json(updated);}catch(e){res.status(e.status||500).json({error:e.message});}
});
app.post('/api/entities/:entity/delete-many', requireUser, async (req,res) => {
  const entity=entityOr404(req,res); if(!entity)return; const query=req.body?.query||{}; try{const count=await mutateDb((db)=>{let n=0;db[entity]=db[entity].filter((r)=>{if(matches(r,query)){if(!canDelete(entity,r,req.user))throw Object.assign(new Error('Forbidden'),{status:403});n++;return false;}return true;});return n;});res.json({deleted:count});}catch(e){res.status(e.status||500).json({error:e.message});}
});
app.get('/api/entities/:entity/:recordId', async (req,res) => { const entity=entityOr404(req,res);if(!entity)return;const db=await readDb();const r=db[entity].find((x)=>x.id===req.params.recordId);if(!r||!canRead(entity,r,req.user))return res.status(404).json({error:'Record not found'});res.json(r); });
app.post('/api/entities/:entity', requireUser, async (req,res) => {
  const entity=entityOr404(req,res);if(!entity)return;if(!canCreate(entity,req.user))return res.status(403).json({error:'Forbidden'});const r=await mutateDb((db)=>{const row=makeRecord(req.body||{},req.user);db[entity].push(row);return row;});
  if(entity==='GuideReview'){await mutateDb((db)=>{const rs=db.GuideReview.filter((x)=>x.guide_id===r.guide_id);const g=db.Guide.find((x)=>x.id===r.guide_id);if(g&&rs.length){g.rating=Math.round((rs.reduce((n,x)=>n+Number(x.rating||0),0)/rs.length)*10)/10;g.updated_date=now();}});}
  res.status(201).json(r);
});
app.patch('/api/entities/:entity/:recordId', requireUser, async (req,res) => {
  const entity=entityOr404(req,res);if(!entity)return;try{const r=await mutateDb((db)=>{const row=db[entity].find((x)=>x.id===req.params.recordId);if(!row)throw Object.assign(new Error('Record not found'),{status:404});if(!canUpdate(entity,row,req.user))throw Object.assign(new Error('Forbidden'),{status:403});Object.assign(row,{...req.body,id:row.id,created_by_id:row.created_by_id,created_date:row.created_date,updated_date:now()});return row;});res.json(r);}catch(e){res.status(e.status||500).json({error:e.message});}
});
app.delete('/api/entities/:entity/:recordId', requireUser, async (req,res) => {
  const entity=entityOr404(req,res);if(!entity)return;try{await mutateDb((db)=>{const i=db[entity].findIndex((x)=>x.id===req.params.recordId);if(i<0)throw Object.assign(new Error('Record not found'),{status:404});if(!canDelete(entity,db[entity][i],req.user))throw Object.assign(new Error('Forbidden'),{status:403});db[entity].splice(i,1);});res.json({ok:true});}catch(e){res.status(e.status||500).json({error:e.message});}
});

app.post('/api/functions/chatAssistant', requireUser, async (req,res)=>{ try{res.json(await chatAssistant(req.body||{}));}catch(e){res.status(e.status||500).json({error:e.message||'Assistant failed'});} });
app.post('/api/functions/destinationImageLookup', async (req,res)=>{ try{res.json(await destinationImageLookup(req.body||{}));}catch(e){res.status(500).json({error:e.message||'Image lookup failed'});} });

const dist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req,res,next)=>{ if(req.path.startsWith('/api/'))return next(); res.sendFile(path.join(dist,'index.html')); });
}

app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({error:'Internal server error'}); });
app.listen(PORT,()=>console.log(`TourInsight server listening on http://localhost:${PORT}`));
