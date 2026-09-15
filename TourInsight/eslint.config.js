import globals from 'globals';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
export default [{
  files: ['src/**/*.{js,jsx}', 'backend/**/*.js'],
  ...js.configs.recommended,
  languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaVersion: 2022, sourceType:'module', ecmaFeatures:{jsx:true} } },
  settings: { react:{version:'detect'} },
  plugins: { react, 'react-hooks':hooks },
  rules: { 'no-unused-vars':['warn',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}], 'react/prop-types':'off', 'react/react-in-jsx-scope':'off', 'react-hooks/rules-of-hooks':'error', 'react-hooks/exhaustive-deps':'warn' }
}];
