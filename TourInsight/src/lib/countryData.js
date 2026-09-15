/* TourInsight destination dataset — ported from the uploaded single-file app.
   COUNTRY_DATA: top tourist places per country (clickable on the world map).
   WORLD_DESTINATION_DATA: researched places for specific destinations.
   CURATED: pilgrimage-town datasets matched by alias.
   TEMPLATES: generic fallback activities per interest. */

export const TEMPLATES = {
  history: [
    { a: "Walk the old town / historic quarter", n: "Wander the oldest streets and take in the architecture", dur: 110 },
    { a: "Visit the main temple or cathedral", n: "The city's best-known place of worship — arrive early to beat crowds", dur: 90 },
    { a: "Explore the old fort or castle", n: "Panoramic views and centuries of layered history", dur: 120 },
    { a: "Tour the local history museum", n: "A solid overview before exploring the sites themselves", dur: 100 },
    { a: "See the central monument or landmark", n: "The spot everyone photographs — worth seeing in person", dur: 60 },
  ],
  food: [
    { a: "Breakfast at a local market", n: "Try whatever the stalls are known for that morning", dur: 75 },
    { a: "Street food crawl in the old center", n: "Graze rather than sit — several small bites beat one big meal", dur: 100 },
    { a: "Sit-down lunch at a neighborhood favorite", n: "Ask a local for their go-to spot, not the tourist strip", dur: 90 },
    { a: "Cooking class or food tour", n: "Hands-on way to understand the local cuisine", dur: 150 },
    { a: "Dinner at a well-reviewed local restaurant", n: "Book ahead if it's a small place", dur: 110 },
  ],
  nature: [
    { a: "Morning hike on the nearest trail", n: "Go early for cooler temperatures and better light", dur: 150 },
    { a: "Visit the botanical garden or park", n: "A slower-paced stop to balance a busy day", dur: 90 },
    { a: "Scenic viewpoint or overlook", n: "Bring water and check the trailhead conditions first", dur: 80 },
    { a: "River, lake, or waterfront walk", n: "Good for photos and a break from the city center", dur: 70 },
  ],
  art: [
    { a: "Main art museum", n: "Check for a highlights tour if short on time", dur: 120 },
    { a: "Contemporary art gallery district", n: "Smaller independent galleries worth a slow wander", dur: 90 },
    { a: "Public art & mural walk", n: "Street art often clusters in one or two neighborhoods", dur: 70 },
  ],
  nightlife: [
    { a: "Rooftop bar at sunset", n: "Arrive right before sunset for the best light and views", dur: 100 },
    { a: "Live music venue", n: "Check listings that day — smaller venues post day-of", dur: 130 },
    { a: "Night market", n: "Food, crafts, and people-watching after dark", dur: 100 },
  ],
  shopping: [
    { a: "Browse the main market or bazaar", n: "Best for local crafts, textiles, and souvenirs", dur: 100 },
    { a: "Independent boutiques district", n: "Skip the chains, walk the side streets instead", dur: 90 },
    { a: "Design or concept store crawl", n: "Good for gifts that don't look like typical souvenirs", dur: 80 },
  ],
  beaches: [
    { a: "Morning at the main beach", n: "Go early to claim a spot before it fills up", dur: 180 },
    { a: "Coastal walk or boardwalk", n: "Easy, scenic, good for a slower afternoon", dur: 90 },
    { a: "Sunset by the water", n: "Bring a light layer — it cools fast after sunset", dur: 70 },
  ],
  offbeat: [
    { a: "Neighborhood locals actually live in", n: "Skip the checklist sights and just wander for an hour", dur: 100 },
    { a: "A small, lesser-known museum or collection", n: "Often quieter and more specific than the big-name museum", dur: 80 },
    { a: "Local-only café or bar", n: "Ask your accommodation host for their personal pick", dur: 70 },
  ],
};

export const CURATED = {
  tirupati: {
    aliases: ['tirupati', 'tirumala'],
    coords: { lat: 13.6288, lon: 79.4192 },
    places: {
      history: [
        { a: "Tirumala Venkateswara Temple", n: "The main shrine on the seventh peak — go for early darshan to avoid the biggest crowds", dur: 150, r: 4.7, tip: "Free & special (paid) darshan lines both exist — book special entry online in advance if short on time" },
        { a: "Govindaraja Temple", n: "One of the oldest, most architecturally rich temples right in the city centre", dur: 75, r: 4.6, tip: "Much shorter queues than Tirumala — good option if you're pressed for time" },
        { a: "Chandragiri Fort", n: "11th-century fort with a museum and an evening light-and-sound show", dur: 100, r: 4.3, tip: "Small entry fee; the evening sound-and-light show runs on a fixed schedule" },
        { a: "Sri Padmavathi Ammavari Temple, Tiruchanur", n: "Dedicated to Goddess Padmavathi, about 5km from the main city", dur: 70, r: 4.6, tip: "Tradition holds you visit her before Tirumala — worth timing it first" },
        { a: "Sri Kodandarama Swamy Temple", n: "Chola-era temple in the heart of Tirupati linked to the Ramayana", dur: 60, r: 4.5, tip: "Quiet and uncrowded, easy to combine with Govindaraja Temple nearby" },
      ],
      nature: [
        { a: "Kapila Theertham waterfall", n: "A waterfall temple at the base of the Tirumala hills — peaceful and shaded", dur: 90, r: 4.4, tip: "Best visited in the morning before it gets crowded and hot" },
        { a: "Talakona Waterfall", n: "The tallest waterfall in Andhra Pradesh, about 60km out — a full half-day trip", dur: 180, r: 4.5, tip: "Carries a small forest entry fee; swimming allowed in the pool at the base" },
        { a: "Tirumala Deer Park Reserve", n: "Easy, relaxed stop en route to Tirumala, good for families", dur: 60, r: 4.2, tip: "Free to enter, best combined with the Tirumala hill drive" },
        { a: "Akasaganga Theertham", n: "A small waterfall near the main temple, considered sacred for a pre-darshan dip", dur: 45, r: 4.3, tip: "Flow varies seasonally — stronger just after monsoon" },
      ],
      offbeat: [
        { a: "ISKCON Tirupati", n: "Vedic culture centre at the foothills of Tirumala, quieter than the main temple", dur: 75, r: 4.5, tip: "Evening aarti is a calmer alternative to the Tirumala crowds" },
        { a: "Sri Kalahasti Temple", n: "Major Shiva temple about 36km away, known for its Vayu Linga", dur: 120, r: 4.7, tip: "Famous for Rahu-Ketu pooja — book that in advance if you want it" },
        { a: "TTD Gardens (Lord Balaji Flower Garden)", n: "Quiet flower gardens near the main temple, good for a slow walk", dur: 60, r: 4.2, tip: "Free entry, pleasant early morning or late afternoon" },
      ],
      shopping: [
        { a: "Local market near Tirumala", n: "Souvenirs, prasadam, and religious keepsakes — expect it to be temple-focused, not a mall district", dur: 60, r: 4.0, tip: "Laddu prasadam counters have official TTD outlets — buy from those, not street resellers" },
      ],
    },
  },
  bhadrachalam: {
    aliases: ['bhadrachalam', 'badhrachalam', 'badrachalam'],
    coords: { lat: 17.6688, lon: 80.8895 },
    places: {
      history: [
        { a: "Sri Sita Ramachandra Swamy Temple", n: "17th-century temple on the Godavari, built by Bhakta Ramadasu — the town's centrepiece", dur: 120, r: 4.7, tip: "Kalyanam (celestial wedding) festival in Chaitra month draws huge crowds — plan around it either way" },
        { a: "Abhaya Anjaneya Temple", n: "A newer Hanuman temple, popular with both pilgrims and locals", dur: 60, r: 4.5, tip: "Quieter than the main temple, easy to combine on the same walk" },
      ],
      nature: [
        { a: "Godavari Ghat boat ride", n: "A calm boat ride on the river right by the temple", dur: 90, r: 4.4, tip: "Boats run informally — negotiate the fare before boarding" },
        { a: "Parnasala", n: "Believed site of Rama's forest hermitage, about 32km out, with Ramayana-themed displays", dur: 150, r: 4.3, tip: "Reachable by road or a river crossing — check which is running that day" },
        { a: "Bogatha Waterfall", n: "A roughly 70-foot waterfall about 120km away — a proper day-trip detour", dur: 240, r: 4.5, tip: "Best after monsoon season when flow is strongest; carries a small entry fee" },
        { a: "Papikondalu gorge", n: "Scenic river gorge, usually visited by boat as a longer excursion", dur: 240, r: 4.6, tip: "Full-day boat trip — book the morning departure to get the full route" },
      ],
      offbeat: [
        { a: "Kinnerasani Wildlife Sanctuary", n: "A quieter forest sanctuary in the district, good for a slower nature day", dur: 180, r: 4.2, tip: "Small entry fee; safaris depend on forest department availability that day" },
      ],
      food: [
        { a: "Eateries near the temple complex", n: "Bhadrachalam is small — most food options cluster right around the temple", dur: 75, r: 4.0, tip: "Simple vegetarian thalis are the local norm near the temple" },
      ],
    },
  },
  varanasi: {
    aliases: ['varanasi', 'kasi', 'kashi', 'banaras', 'benaras'],
    coords: { lat: 25.3176, lon: 82.9739 },
    places: {
      history: [
        { a: "Kashi Vishwanath Temple", n: "The most visited Jyotirlinga temple in the country — go early, expect security checks", dur: 90, r: 4.6, tip: "Phones and bags aren't allowed inside — use a locker near the entrance" },
        { a: "Sankat Mochan Hanuman Temple", n: "A calmer, well-loved temple near Banaras Hindu University", dur: 60, r: 4.6, tip: "Tuesdays and Saturdays are busiest — go on another day for a quieter visit" },
        { a: "Kaal Bhairav Mandir", n: "Dedicated to Varanasi's guardian deity, a shorter but significant stop", dur: 45, r: 4.5, tip: "Offering alcohol is a local custom here — sold just outside if you want to participate" },
        { a: "Ramnagar Fort", n: "18th-century fort across the river with a small museum of royal artefacts", dur: 100, r: 4.0, tip: "Small entry fee; combine with a boat crossing for the best experience" },
        { a: "New Vishwanath Temple, BHU", n: "On the university campus, less crowded, worth pairing with a campus walk", dur: 75, r: 4.6, tip: "Open to all faiths and much less crowded than the old-city temple" },
      ],
      nature: [
        { a: "Sunrise boat ride on the Ganges", n: "The classic Varanasi experience — priests, rituals, and the ghats waking up", dur: 90, r: 4.8, tip: "Negotiate the boat fare the evening before, or book through your stay to avoid haggling at dawn" },
        { a: "Assi Ghat at sunset", n: "Chai, a slower pace, and often a smaller evening aarti than Dashashwamedh", dur: 75, r: 4.5, tip: "Good alternative if Dashashwamedh feels too crowded" },
        { a: "Dashashwamedh Ghat Ganga Aarti", n: "The main evening ritual — arrive early for a clear view, it gets packed", dur: 75, r: 4.7, tip: "Arrive at least 45 minutes early, or watch from a boat on the river instead" },
        { a: "Manikarnika Ghat", n: "A cremation ghat of deep religious significance — visit respectfully and quietly", dur: 45, r: 4.3, tip: "Photography is discouraged here — be respectful and avoid unofficial 'guides' who approach uninvited" },
      ],
      food: [
        { a: "Kachori-sabzi breakfast in the old lanes", n: "A Banarasi morning staple, found in small stalls near Godowlia", dur: 60, r: 4.5, tip: "Go before 9am when it's freshest and least crowded" },
        { a: "Blue Lassi shop", n: "A tiny, decades-old lassi spot in the old city — expect a short queue", dur: 30, r: 4.4, tip: "Cash only, and it's easy to miss — look for the small blue-painted shopfront" },
        { a: "Tamatar chaat & street food crawl", n: "Wander the lanes behind the ghats for the city's best street snacks", dur: 100, r: 4.5, tip: "Go with an empty stomach — portions are small but plentiful along the route" },
        { a: "Banarasi paan after dinner", n: "A local ritual to end the evening — mild versions are easy to find", dur: 20, r: 4.2, tip: "Ask for a 'meetha paan' (sweet) if you want a milder, tobacco-free version" },
      ],
      offbeat: [
        { a: "Sarnath", n: "Where Buddha gave his first sermon — a calm, very different pace from the ghats, ~10km out", dur: 150, r: 4.5, tip: "Small entry fee for the museum; the Dhamek Stupa grounds themselves are free" },
        { a: "Bharat Kala Bhawan Museum, BHU", n: "A quiet museum of Indian art on the university campus", dur: 90, r: 4.3, tip: "Closed Sundays and university holidays — check before heading over" },
        { a: "Wander the old city galis", n: "Get gently lost in the narrow lanes behind the ghats — no fixed route needed", dur: 90, r: 4.4, tip: "Keep your phone away and just walk — it's easy to reorient back to any ghat" },
      ],
    },
  },
};

export const COUNTRY_DATA = {
  India: {
    emoji: '🇮🇳',
    places: [
      ['Goa', 'Beaches & nightlife', 'Baga, Calangute, Panaji, Old Goa and scenic coastal drives.'],
      ['Hyderabad', 'Heritage & food', 'Charminar, Golconda Fort, Hussain Sagar and famous local cuisine.'],
      ['Delhi', 'History & monuments', 'India Gate, Red Fort, Qutub Minar, Humayun\u2019s Tomb and museums.'],
      ['Jaipur', 'Forts & royal heritage', 'Amber Fort, City Palace, Hawa Mahal and colourful bazaars.'],
      ['Kerala', 'Backwaters & nature', 'Alleppey, Munnar, Kochi and peaceful backwater experiences.'],
      ['Kashmir', 'Mountains & lakes', 'Srinagar, Gulmarg, Pahalgam and Dal Lake.'],
      ['Agra', 'Iconic monuments', 'Taj Mahal, Agra Fort and nearby Mughal heritage sites.'],
      ['Varanasi', 'Spiritual & cultural', 'Kashi Vishwanath, Ganga ghats, sunrise boat rides and Sarnath.'],
    ],
  },
  Japan: {
    emoji: '🇯🇵',
    places: [
      ['Tokyo', 'Modern city', 'Shibuya, Asakusa, Tokyo Skytree and vibrant food districts.'],
      ['Kyoto', 'Temples & tradition', 'Fushimi Inari, Kiyomizu-dera, Arashiyama and Gion.'],
      ['Osaka', 'Food & entertainment', 'Dotonbori, Osaka Castle, Umeda and Universal Studios.'],
      ['Mount Fuji', 'Nature & scenery', 'Lake Kawaguchi, Fuji viewpoints and nearby mountain towns.'],
      ['Nara', 'Culture & temples', 'Todai-ji, Nara Park and historic shrines.'],
    ],
  },
  France: {
    emoji: '🇫🇷',
    places: [
      ['Paris', 'Art & landmarks', 'Eiffel Tower, Louvre, Notre-Dame area and Montmartre.'],
      ['Nice', 'Riviera coast', 'Promenade des Anglais, Old Town and Mediterranean beaches.'],
      ['Lyon', 'Food & heritage', 'Vieux Lyon, Roman sites and famous French cuisine.'],
      ['Bordeaux', 'Wine & architecture', 'Historic centre, riverfront and surrounding vineyards.'],
    ],
  },
  Italy: {
    emoji: '🇮🇹',
    places: [
      ['Rome', 'Ancient history', 'Colosseum, Roman Forum, Vatican City and Trevi Fountain.'],
      ['Venice', 'Canals & culture', 'Grand Canal, St Mark\u2019s Square, Rialto and island trips.'],
      ['Florence', 'Renaissance art', 'Uffizi, Duomo, Ponte Vecchio and historic centre.'],
      ['Amalfi Coast', 'Coastal scenery', 'Positano, Amalfi, Ravello and dramatic sea views.'],
    ],
  },
  'United States': {
    emoji: '🇺🇸',
    places: [
      ['New York City', 'City landmarks', 'Times Square, Central Park, Statue of Liberty and museums.'],
      ['Los Angeles', 'Entertainment', 'Hollywood, Santa Monica, Griffith Observatory and beaches.'],
      ['Grand Canyon', 'Nature', 'Iconic canyon viewpoints, trails and sunrise/sunset scenery.'],
      ['Las Vegas', 'Entertainment', 'The Strip, shows, restaurants and desert excursions.'],
    ],
  },
  Australia: {
    emoji: '🇦🇺',
    places: [
      ['Sydney', 'Harbour & beaches', 'Opera House, Harbour Bridge, Bondi Beach and coastal walks.'],
      ['Melbourne', 'Culture & food', 'Laneways, museums, markets and Great Ocean Road access.'],
      ['Cairns', 'Tropical nature', 'Great Barrier Reef, rainforest and adventure activities.'],
      ['Gold Coast', 'Beaches & theme parks', 'Surfers Paradise, beaches and family attractions.'],
    ],
  },
  Thailand: {
    emoji: '🇹🇭',
    places: [
      ['Bangkok', 'Temples & street food', 'Grand Palace, Wat Arun, markets and vibrant food streets.'],
      ['Phuket', 'Beaches', 'Island trips, beaches, viewpoints and coastal activities.'],
      ['Chiang Mai', 'Culture & mountains', 'Old City temples, night markets and mountain scenery.'],
      ['Krabi', 'Islands & nature', 'Railay Beach, limestone cliffs and island tours.'],
    ],
  },
  Singapore: {
    emoji: '🇸🇬',
    places: [
      ['Marina Bay', 'City landmarks', 'Gardens by the Bay, Marina Bay Sands area and waterfront views.'],
      ['Sentosa', 'Beaches & entertainment', 'Beaches, attractions, cable car and family activities.'],
      ['Chinatown', 'Culture & food', 'Heritage streets, temples and local food centres.'],
      ['Little India', 'Culture & shopping', 'Colourful temples, markets and Indian cuisine.'],
    ],
  },
  Switzerland: {
    emoji: '🇨🇭',
    places: [
      ['Interlaken', 'Alpine adventure', 'Lakes, mountain viewpoints and outdoor activities.'],
      ['Lucerne', 'Lakes & old town', 'Chapel Bridge, Lake Lucerne and nearby mountain trips.'],
      ['Zurich', 'City & culture', 'Old Town, Lake Zurich and museums.'],
      ['Zermatt', 'Mountains', 'Matterhorn views, alpine trails and scenic rail journeys.'],
    ],
  },
  Nepal: {
    emoji: '🇳🇵',
    places: [
      ['Kathmandu', 'Temples & heritage', 'Swayambhunath, Boudhanath, Pashupatinath and Durbar Square.'],
      ['Pokhara', 'Lakes & mountains', 'Phewa Lake, Sarangkot and Himalayan viewpoints.'],
      ['Chitwan', 'Wildlife', 'National park safaris, nature walks and local villages.'],
    ],
  },
  'United Arab Emirates': {
    emoji: '🇦🇪',
    places: [
      ['Dubai', 'Modern landmarks', 'Burj Khalifa, Dubai Marina, old souks and desert experiences.'],
      ['Abu Dhabi', 'Culture & architecture', 'Sheikh Zayed Grand Mosque, Louvre Abu Dhabi and Corniche.'],
      ['Sharjah', 'Arts & heritage', 'Museums, heritage districts and cultural attractions.'],
    ],
  },
  Spain: {
    emoji: '🇪🇸',
    places: [
      ['Barcelona', 'Architecture & coast', 'Sagrada Fam\u00edlia, Park G\u00fcell, Gothic Quarter and beaches.'],
      ['Madrid', 'Art & culture', 'Prado Museum, Royal Palace, Retiro Park and food districts.'],
      ['Seville', 'Historic Spain', 'Alc\u00e1zar, cathedral, Plaza de Espa\u00f1a and old streets.'],
    ],
  },
  Brazil: {
    emoji: '🇧🇷',
    places: [
      ['Rio de Janeiro', 'Beaches & landmarks', 'Christ the Redeemer, Sugarloaf Mountain, Copacabana and Ipanema.'],
      ['S\u00e3o Paulo', 'City & culture', 'Avenida Paulista, museums, markets and diverse food districts.'],
      ['Iguazu Falls', 'Nature', 'Spectacular waterfalls, rainforest trails and panoramic viewpoints.'],
      ['Salvador', 'Culture & heritage', 'Pelourinho, colourful colonial streets, music and coastal scenery.'],
    ],
  },
  Canada: {
    emoji: '🇨🇦',
    places: [
      ['Toronto', 'City & waterfront', 'CN Tower, Harbourfront, museums and diverse neighbourhoods.'],
      ['Vancouver', 'Mountains & coast', 'Stanley Park, Granville Island, waterfront and mountain views.'],
      ['Banff', 'Alpine nature', 'Lake Louise, mountain scenery, hiking and turquoise lakes.'],
      ['Montreal', 'Culture & food', 'Old Montreal, Notre-Dame Basilica, markets and local cuisine.'],
    ],
  },
  China: {
    emoji: '🇨🇳',
    places: [
      ['Beijing', 'History & landmarks', 'Great Wall, Forbidden City, Temple of Heaven and Summer Palace.'],
      ['Shanghai', 'Modern city', 'The Bund, Yu Garden, Pudong skyline and lively shopping streets.'],
      ['Xi\u2019an', 'Ancient history', 'Terracotta Army, ancient city wall and Muslim Quarter.'],
      ['Guilin', 'Nature & scenery', 'Li River cruises, karst mountains and Yangshuo landscapes.'],
    ],
  },
  Germany: {
    emoji: '🇩🇪',
    places: [
      ['Berlin', 'History & culture', 'Brandenburg Gate, Museum Island, Berlin Wall sites and Reichstag.'],
      ['Munich', 'Culture & Bavarian heritage', 'Marienplatz, palaces, museums and traditional food.'],
      ['Neuschwanstein Castle', 'Fairytale scenery', 'Famous hilltop castle surrounded by Bavarian Alps.'],
      ['Cologne', 'Architecture & river', 'Cologne Cathedral, Rhine waterfront and historic old town.'],
    ],
  },
  Indonesia: {
    emoji: '🇮🇩',
    places: [
      ['Bali', 'Beaches & culture', 'Ubud, Uluwatu, rice terraces, temples and beaches.'],
      ['Jakarta', 'City & culture', 'National Monument, Kota Tua, museums and food districts.'],
      ['Yogyakarta', 'Heritage & temples', 'Borobudur, Prambanan, Kraton and traditional arts.'],
      ['Komodo National Park', 'Nature & adventure', 'Komodo dragons, islands, viewpoints and marine experiences.'],
    ],
  },
  Kenya: {
    emoji: '🇰🇪',
    places: [
      ['Nairobi', 'City & wildlife', 'Nairobi National Park, museums and cultural attractions.'],
      ['Maasai Mara', 'Wildlife safari', 'Open savannah, wildlife viewing and seasonal migration experiences.'],
      ['Mombasa', 'Coast & history', 'Beaches, Fort Jesus, Old Town and Indian Ocean scenery.'],
      ['Lake Nakuru', 'Nature & wildlife', 'Rift Valley scenery, wildlife and bird-rich lake landscapes.'],
    ],
  },
  Mexico: {
    emoji: '🇲🇽',
    places: [
      ['Mexico City', 'History & culture', 'Z\u00f3calo, Chapultepec, museums and historic neighbourhoods.'],
      ['Canc\u00fan', 'Beaches & islands', 'Caribbean beaches, nearby cenotes and island excursions.'],
      ['Chich\u00e9n Itz\u00e1', 'Ancient history', 'Major Maya archaeological site and iconic pyramid.'],
      ['Tulum', 'Ruins & coast', 'Clifftop Maya ruins, beaches and nearby cenotes.'],
    ],
  },
  Netherlands: {
    emoji: '🇳🇱',
    places: [
      ['Amsterdam', 'Canals & culture', 'Canal belt, Rijksmuseum, Anne Frank House area and markets.'],
      ['Rotterdam', 'Modern architecture', 'Erasmus Bridge, Cube Houses, harbour and food halls.'],
      ['Keukenhof', 'Flowers & gardens', 'Seasonal flower gardens famous for colourful spring displays.'],
      ['The Hague', 'Coast & culture', 'Mauritshuis, Binnenhof area and Scheveningen beach.'],
    ],
  },
  'New Zealand': {
    emoji: '🇳🇿',
    places: [
      ['Queenstown', 'Adventure & mountains', 'Lake Wakatipu, mountain scenery and outdoor adventures.'],
      ['Auckland', 'City & coast', 'Sky Tower, harbour, islands and volcanic viewpoints.'],
      ['Rotorua', 'Geothermal & M\u0101ori culture', 'Geysers, geothermal valleys and cultural experiences.'],
      ['Milford Sound', 'Nature', 'Dramatic fjords, waterfalls and scenic cruises.'],
    ],
  },
  Norway: {
    emoji: '🇳🇴',
    places: [
      ['Oslo', 'City & culture', 'Opera House, museums, waterfront and green spaces.'],
      ['Bergen', 'Fjords & heritage', 'Bryggen, harbour, mountain viewpoints and fjord access.'],
      ['Troms\u00f8', 'Arctic adventure', 'Northern Lights opportunities, Arctic scenery and museums.'],
      ['Geirangerfjord', 'Fjord scenery', 'Dramatic cliffs, waterfalls and scenic viewpoints.'],
    ],
  },
  Pakistan: {
    emoji: '🇵🇰',
    places: [
      ['Lahore', 'History & food', 'Badshahi Mosque, Lahore Fort, Walled City and local cuisine.'],
      ['Islamabad', 'City & nature', 'Faisal Mosque, Daman-e-Koh and Margalla Hills.'],
      ['Hunza Valley', 'Mountains & scenery', 'High mountain valleys, forts, lakes and scenic drives.'],
      ['Skardu', 'Adventure & landscapes', 'Mountain lakes, valleys and dramatic Himalayan scenery.'],
    ],
  },
  Philippines: {
    emoji: '🇵🇭',
    places: [
      ['Manila', 'History & city life', 'Intramuros, Rizal Park, museums and waterfront areas.'],
      ['Boracay', 'Beaches', 'White Beach, water activities, sunsets and island experiences.'],
      ['Palawan', 'Islands & nature', 'El Nido, lagoons, limestone cliffs and clear waters.'],
      ['Cebu', 'Coast & adventure', 'Island trips, waterfalls, diving and historic landmarks.'],
    ],
  },
  Poland: {
    emoji: '🇵🇱',
    places: [
      ['Krak\u00f3w', 'Old town & history', 'Main Market Square, Wawel Castle and historic streets.'],
      ['Warsaw', 'History & culture', 'Old Town, Royal Castle, museums and riverside areas.'],
      ['Gda\u0144sk', 'Coast & heritage', 'Historic waterfront, old town and Baltic Sea atmosphere.'],
      ['Zakopane', 'Mountains', 'Tatra scenery, hiking, cable cars and mountain culture.'],
    ],
  },
  Russia: {
    emoji: '🇷🇺',
    places: [
      ['Moscow', 'Landmarks & history', 'Red Square, Kremlin area, St Basil\u2019s Cathedral and museums.'],
      ['Saint Petersburg', 'Art & architecture', 'Hermitage, canals, palaces and historic avenues.'],
      ['Kazan', 'Culture & heritage', 'Kazan Kremlin, waterfront and distinctive Tatar culture.'],
      ['Sochi', 'Coast & mountains', 'Black Sea coast, parks and nearby mountain landscapes.'],
    ],
  },
  'Saudi Arabia': {
    emoji: '🇸🇦',
    places: [
      ['Riyadh', 'Modern city & heritage', 'Kingdom Centre, Diriyah, museums and cultural districts.'],
      ['Jeddah', 'Coast & old town', 'Al-Balad, Red Sea waterfront and historic architecture.'],
      ['AlUla', 'Desert heritage', 'Hegra, sandstone landscapes, canyons and heritage sites.'],
      ['Abha', 'Mountains & nature', 'Mountain scenery, viewpoints and cooler highland landscapes.'],
    ],
  },
  'South Africa': {
    emoji: '🇿🇦',
    places: [
      ['Cape Town', 'Coast & mountains', 'Table Mountain, V&A Waterfront, beaches and Cape Peninsula.'],
      ['Johannesburg', 'City & history', 'Apartheid Museum, Constitution Hill and cultural districts.'],
      ['Kruger National Park', 'Wildlife safari', 'Big Five wildlife viewing and guided safari experiences.'],
      ['Garden Route', 'Coastal nature', 'Forests, beaches, lagoons and scenic coastal drives.'],
    ],
  },
  Sweden: {
    emoji: '🇸🇪',
    places: [
      ['Stockholm', 'Islands & culture', 'Gamla Stan, Vasa Museum, Royal Palace and waterfront views.'],
      ['Gothenburg', 'Coast & food', 'Canals, archipelago trips, seafood and city parks.'],
      ['Abisko', 'Arctic nature', 'Northern Lights, mountain trails and Lapland landscapes.'],
      ['Malm\u00f6', 'City & architecture', 'Old town, waterfront and Turning Torso area.'],
    ],
  },
  'United Kingdom': {
    emoji: '🇬🇧',
    places: [
      ['London', 'Landmarks & museums', 'Big Ben, Tower of London, British Museum and Hyde Park.'],
      ['Edinburgh', 'Castles & heritage', 'Edinburgh Castle, Royal Mile and Arthur\u2019s Seat.'],
      ['Bath', 'Roman heritage', 'Roman Baths, Georgian architecture and historic city centre.'],
      ['Lake District', 'Nature & hiking', 'Lakes, mountain scenery, villages and walking trails.'],
    ],
  },
  'Sri Lanka': {
    emoji: '🇱🇰',
    places: [
      ['Colombo', 'City & coast', 'Galle Face Green, markets, temples and waterfront areas.'],
      ['Kandy', 'Culture & hills', 'Temple of the Tooth, lake and surrounding hill country.'],
      ['Ella', 'Mountains & trains', 'Tea country, viewpoints, waterfalls and scenic railway journeys.'],
      ['Galle', 'Fort & coast', 'Galle Fort, colonial streets, caf\u00e9s and nearby beaches.'],
    ],
  },
  'South Korea': {
    emoji: '🇰🇷',
    places: [
      ['Seoul', 'City & culture', 'Gyeongbokgung, Bukchon, Myeongdong and N Seoul Tower.'],
      ['Busan', 'Coast & food', 'Haeundae Beach, Gamcheon Culture Village and seafood markets.'],
      ['Jeju Island', 'Nature & coast', 'Volcanic landscapes, waterfalls, beaches and hiking.'],
      ['Gyeongju', 'Ancient heritage', 'Historic tombs, temples and Silla-era landmarks.'],
    ],
  },
  Turkey: {
    emoji: '🇹🇷',
    places: [
      ['Istanbul', 'History & culture', 'Hagia Sophia area, Blue Mosque, Grand Bazaar and Bosphorus.'],
      ['Cappadocia', 'Hot-air balloons & valleys', 'Fairy chimneys, cave towns and sunrise balloon views.'],
      ['Antalya', 'Mediterranean coast', 'Old Town, beaches, waterfalls and coastal scenery.'],
      ['Pamukkale', 'Natural terraces', 'White travertine terraces and nearby ancient Hierapolis.'],
    ],
  },
  Egypt: {
    emoji: '🇪🇬',
    places: [
      ['Cairo', 'Ancient history', 'Giza Pyramids, Sphinx, Egyptian Museum and historic Cairo.'],
      ['Luxor', 'Temples & tombs', 'Karnak, Luxor Temple, Valley of the Kings and Nile views.'],
      ['Aswan', 'Nile & temples', 'Philae Temple, Nile cruises and Nubian culture.'],
      ['Sharm El Sheikh', 'Red Sea', 'Beaches, coral reefs, diving and desert excursions.'],
    ],
  },
  Greece: {
    emoji: '🇬🇷',
    places: [
      ['Athens', 'Ancient history', 'Acropolis, Parthenon, Plaka and ancient Agora.'],
      ['Santorini', 'Island scenery', 'Caldera views, Oia sunsets, villages and volcanic coast.'],
      ['Crete', 'Beaches & heritage', 'Heraklion, beaches, gorges and archaeological sites.'],
      ['Mykonos', 'Island life', 'Whitewashed streets, beaches, windmills and waterfront dining.'],
    ],
  },
  Portugal: {
    emoji: '🇵🇹',
    places: [
      ['Lisbon', 'City & viewpoints', 'Bel\u00e9m, Alfama, trams, viewpoints and waterfront districts.'],
      ['Porto', 'River & heritage', 'Ribeira, bridges, historic centre and Douro views.'],
      ['Algarve', 'Beaches & cliffs', 'Golden beaches, sea caves and dramatic coastal scenery.'],
      ['Sintra', 'Palaces & nature', 'Pena Palace, Moorish Castle and lush mountain landscapes.'],
    ],
  },
};

export const WORLD_DESTINATION_DATA = {
  Goa: { aliases: ['goa'], coords: { lat: 15.4909, lon: 73.8278 }, places: {
    beaches: [
      { a: 'Baga Beach', n: 'Popular North Goa beach with water activities and a lively shoreline.', dur: 120, r: 4.4 },
      { a: 'Calangute Beach', n: 'Long sandy beach close to many restaurants and shops.', dur: 120, r: 4.3 },
      { a: 'Anjuna Beach', n: 'Scenic beach known for rocky coastline, sunset views and nearby markets.', dur: 120, r: 4.4 },
      { a: 'Palolem Beach', n: 'Relaxed South Goa beach with a curved bay and quieter atmosphere.', dur: 150, r: 4.6 },
    ],
    history: [
      { a: 'Fort Aguada', n: 'Historic Portuguese fort overlooking the Arabian Sea.', dur: 100, r: 4.5 },
      { a: 'Basilica of Bom Jesus', n: 'Historic Old Goa church and major heritage landmark.', dur: 90, r: 4.6 },
      { a: 'Se Cathedral', n: 'Large historic cathedral in Old Goa, close to the Basilica.', dur: 75, r: 4.5 },
      { a: 'Chapora Fort', n: 'Hilltop fort with wide coastal views, especially around sunset.', dur: 100, r: 4.5 },
    ],
    nature: [
      { a: 'Dudhsagar Waterfalls', n: 'Major waterfall in the Western Ghats; allow substantial travel time.', dur: 240, r: 4.6 },
      { a: 'Salim Ali Bird Sanctuary', n: 'Mangrove sanctuary near Chorao island for a quieter nature experience.', dur: 120, r: 4.2 },
      { a: 'Fontainhas Heritage Walk', n: 'Colourful old Latin quarter with narrow lanes and heritage houses.', dur: 90, r: 4.5 },
    ],
    food: [
      { a: 'Panaji local food trail', n: 'Try Goan specialties such as fish curry, xacuti and bebinca.', dur: 100, r: 4.4 },
      { a: 'Mapusa Market', n: 'Local market for snacks, produce, spices and souvenirs.', dur: 90, r: 4.3 },
    ],
    shopping: [
      { a: 'Anjuna Flea Market', n: 'Browse clothing, handicrafts, jewellery and local souvenirs.', dur: 120, r: 4.2 },
    ],
  }},
  Hyderabad: { aliases: ['hyderabad'], coords: { lat: 17.385, lon: 78.4867 }, places: {
    history: [
      { a: 'Charminar', n: 'Iconic four-minaret monument at the heart of Hyderabad old city.', dur: 90, r: 4.5 },
      { a: 'Golconda Fort', n: 'Massive hill fort with panoramic city views and historic ruins.', dur: 150, r: 4.6 },
      { a: 'Chowmahalla Palace', n: 'Elegant palace complex showcasing Hyderabad royal heritage.', dur: 100, r: 4.5 },
      { a: 'Qutb Shahi Tombs', n: 'Historic tomb complex near Golconda with distinctive architecture.', dur: 90, r: 4.5 },
    ],
    food: [
      { a: 'Old City biryani trail', n: 'Explore Hyderabad\u2019s famous biryani and local street-food flavours.', dur: 100, r: 4.5 },
      { a: 'Laad Bazaar food & shopping walk', n: 'Combine local snacks with the colourful markets around Charminar.', dur: 110, r: 4.3 },
    ],
    nature: [
      { a: 'Hussain Sagar Lake', n: 'Large urban lake with waterfront views and evening walks.', dur: 90, r: 4.3 },
      { a: 'KBR National Park', n: 'Green urban park suited to a relaxed morning walk.', dur: 100, r: 4.4 },
    ],
    shopping: [
      { a: 'Laad Bazaar', n: 'Traditional market famous for bangles, textiles and souvenirs.', dur: 100, r: 4.3 },
    ],
  }},
  Delhi: { aliases: ['delhi', 'new delhi'], coords: { lat: 28.6139, lon: 77.209 }, places: {
    history: [
      { a: 'Red Fort', n: 'Major Mughal-era fort and UNESCO World Heritage landmark.', dur: 120, r: 4.5 },
      { a: 'Qutub Minar', n: 'Towering medieval monument surrounded by historic ruins.', dur: 110, r: 4.6 },
      { a: 'Humayun\u2019s Tomb', n: 'Grand Mughal garden tomb and architectural landmark.', dur: 100, r: 4.6 },
      { a: 'India Gate', n: 'Iconic war memorial and one of central Delhi\u2019s best-known landmarks.', dur: 60, r: 4.5 },
    ],
    food: [
      { a: 'Chandni Chowk food walk', n: 'Explore famous Old Delhi street food and market lanes.', dur: 120, r: 4.5 },
      { a: 'Connaught Place dining', n: 'Wide choice of restaurants and caf\u00e9s in central Delhi.', dur: 90, r: 4.3 },
    ],
    nature: [
      { a: 'Lodhi Garden', n: 'Peaceful green space surrounded by historic tombs.', dur: 100, r: 4.5 },
      { a: 'Akshardham waterfront area', n: 'Large cultural complex and landscaped surroundings.', dur: 120, r: 4.6 },
    ],
    shopping: [
      { a: 'Dilli Haat', n: 'Open-air market featuring crafts, textiles and food from across India.', dur: 110, r: 4.4 },
    ],
  }},
  Jaipur: { aliases: ['jaipur'], coords: { lat: 26.9124, lon: 75.7873 }, places: {
    history: [
      { a: 'Amber Fort', n: 'Hilltop fort-palace with courtyards, halls and panoramic views.', dur: 150, r: 4.7 },
      { a: 'City Palace', n: 'Royal complex in the Pink City with museums and courtyards.', dur: 120, r: 4.5 },
      { a: 'Hawa Mahal', n: 'Famous pink sandstone fa\u00e7ade and one of Jaipur\u2019s signature landmarks.', dur: 75, r: 4.5 },
      { a: 'Jantar Mantar', n: 'Historic astronomical observatory with monumental instruments.', dur: 90, r: 4.5 },
    ],
    shopping: [
      { a: 'Johari Bazaar', n: 'Traditional market for jewellery, textiles and colourful crafts.', dur: 110, r: 4.4 },
      { a: 'Bapu Bazaar', n: 'Popular market for souvenirs, fabrics and local handicrafts.', dur: 100, r: 4.2 },
    ],
    food: [
      { a: 'Pink City food trail', n: 'Try dal baati churma, ghewar and other Rajasthani favourites.', dur: 100, r: 4.4 },
    ],
    nature: [
      { a: 'Jal Mahal viewpoint', n: 'Scenic stop beside the palace in Man Sagar Lake.', dur: 60, r: 4.4 },
    ],
  }},
  Mumbai: { aliases: ['mumbai', 'bombay'], coords: { lat: 19.076, lon: 72.8777 }, places: {
    history: [
      { a: 'Gateway of India', n: 'Iconic waterfront monument overlooking Mumbai Harbour.', dur: 75, r: 4.5 },
      { a: 'Chhatrapati Shivaji Maharaj Terminus', n: 'Grand Victorian Gothic railway landmark and UNESCO site.', dur: 75, r: 4.6 },
      { a: 'Elephanta Caves', n: 'Rock-cut cave temples reached by ferry from Mumbai.', dur: 180, r: 4.5 },
    ],
    nature: [
      { a: 'Marine Drive', n: 'Classic seafront promenade for sunset and evening views.', dur: 90, r: 4.6 },
      { a: 'Sanjay Gandhi National Park', n: 'Large urban national park with forest trails and attractions.', dur: 150, r: 4.4 },
    ],
    food: [
      { a: 'South Mumbai food walk', n: 'Explore local favourites including vada pav, pav bhaji and seafood.', dur: 110, r: 4.5 },
    ],
    shopping: [
      { a: 'Colaba Causeway', n: 'Lively shopping street for souvenirs, clothes and street finds.', dur: 110, r: 4.3 },
    ],
  }},
  Kerala: { aliases: ['kerala', 'kochi', 'cochin', 'alleppey', 'alappuzha', 'munnar'], coords: { lat: 9.9312, lon: 76.2673 }, places: {
    nature: [
      { a: 'Alleppey Backwaters', n: 'Relaxed backwater experience through Kerala\u2019s waterways.', dur: 180, r: 4.7 },
      { a: 'Munnar Tea Gardens', n: 'Mountain scenery and tea plantations in the Western Ghats.', dur: 180, r: 4.7 },
      { a: 'Vembanad Lake', n: 'Large lake with scenic waterfront and boat experiences.', dur: 120, r: 4.5 },
    ],
    history: [
      { a: 'Fort Kochi', n: 'Historic coastal quarter with colonial-era streets and landmarks.', dur: 120, r: 4.6 },
      { a: 'Mattancherry Palace', n: 'Historic palace museum in Kochi\u2019s heritage district.', dur: 90, r: 4.4 },
    ],
    food: [
      { a: 'Kerala cuisine experience', n: 'Try appam, stew, seafood and traditional Kerala meals.', dur: 100, r: 4.5 },
    ],
  }},
  Kashmir: { aliases: ['kashmir', 'srinagar', 'gulmarg', 'pahalgam'], coords: { lat: 34.0837, lon: 74.7973 }, places: {
    nature: [
      { a: 'Dal Lake', n: 'Iconic lake for shikara rides and mountain views.', dur: 120, r: 4.7 },
      { a: 'Gulmarg', n: 'Mountain resort known for meadows, views and seasonal activities.', dur: 180, r: 4.7 },
      { a: 'Pahalgam', n: 'Scenic valley destination with rivers, meadows and mountain landscapes.', dur: 180, r: 4.6 },
    ],
    history: [
      { a: 'Mughal Gardens', n: 'Historic terraced gardens overlooking Dal Lake and the surrounding hills.', dur: 100, r: 4.5 },
    ],
    shopping: [
      { a: 'Srinagar local craft market', n: 'Browse Kashmiri shawls, carpets, handicrafts and dry fruits.', dur: 100, r: 4.4 },
    ],
  }},
  Agra: { aliases: ['agra'], coords: { lat: 27.1767, lon: 78.0081 }, places: {
    history: [
      { a: 'Taj Mahal', n: 'World-famous Mughal monument and Agra\u2019s essential landmark.', dur: 150, r: 4.8 },
      { a: 'Agra Fort', n: 'Historic Mughal fort with grand courtyards and views toward the Taj.', dur: 120, r: 4.6 },
      { a: 'Itmad-ud-Daulah\u2019s Tomb', n: 'Elegant riverside Mughal tomb often called the Baby Taj.', dur: 90, r: 4.5 },
      { a: 'Mehtab Bagh', n: 'Garden across the Yamuna with a classic Taj Mahal viewpoint.', dur: 75, r: 4.5 },
    ],
    shopping: [
      { a: 'Sadar Bazaar', n: 'Busy local shopping area for crafts, leather goods and souvenirs.', dur: 100, r: 4.2 },
    ],
  }},
  Varanasi: { aliases: ['varanasi', 'kashi', 'kasi', 'banaras'], coords: { lat: 25.3176, lon: 82.9739 }, places: {
    history: [
      { a: 'Kashi Vishwanath Temple', n: 'Major temple in the old city and one of Varanasi\u2019s most important sights.', dur: 90, r: 4.6 },
      { a: 'Sarnath', n: 'Historic Buddhist site where Buddha is traditionally said to have given his first sermon.', dur: 150, r: 4.5 },
    ],
    nature: [
      { a: 'Sunrise boat ride on the Ganges', n: 'See the ghats wake up from the river at sunrise.', dur: 90, r: 4.8 },
      { a: 'Dashashwamedh Ghat', n: 'One of the best-known ghats for evening Ganga Aarti.', dur: 90, r: 4.7 },
      { a: 'Assi Ghat', n: 'Popular riverside area for sunrise, walks and evening atmosphere.', dur: 75, r: 4.5 },
    ],
    food: [
      { a: 'Banarasi street-food trail', n: 'Try kachori-sabzi, lassi, chaat and other local specialities.', dur: 100, r: 4.5 },
    ],
  }},
  Tokyo: { aliases: ['tokyo'], coords: { lat: 35.6762, lon: 139.6503 }, places: {
    history: [{ a: 'Asakusa & Senso-ji', n: 'Historic temple district with traditional streets and markets.', dur: 120, r: 4.7 }],
    nature: [{ a: 'Meiji Jingu', n: 'Forest-covered shrine complex in central Tokyo.', dur: 100, r: 4.7 }],
    shopping: [{ a: 'Shibuya', n: 'Major shopping and entertainment district with iconic city views.', dur: 120, r: 4.6 }],
    food: [{ a: 'Tsukiji Outer Market', n: 'Food-focused market area for seafood and Japanese street bites.', dur: 110, r: 4.5 }],
  }},
  Kyoto: { aliases: ['kyoto'], coords: { lat: 35.0116, lon: 135.7681 }, places: {
    history: [
      { a: 'Fushimi Inari Taisha', n: 'Famous shrine with thousands of vermilion torii gates.', dur: 150, r: 4.8 },
      { a: 'Kiyomizu-dera', n: 'Historic temple with a famous wooden terrace and city views.', dur: 120, r: 4.7 },
    ],
    nature: [{ a: 'Arashiyama Bamboo Grove', n: 'Iconic bamboo path near temples and the Katsura River.', dur: 90, r: 4.6 }],
    food: [{ a: 'Gion food walk', n: 'Explore Kyoto specialities and traditional streets around Gion.', dur: 100, r: 4.5 }],
  }},
};

export const COUNTRY_ALIASES = {
  'United States of America': 'United States',
  USA: 'United States',
  UAE: 'United Arab Emirates',
  Czechia: 'Czech Republic',
  'Russian Federation': 'Russia',
};

export function normalizeCountryName(name) {
  return COUNTRY_ALIASES[name] || name;
}

/* Find a destination dataset (curated pilgrimage town or researched world destination). */
export function findDestinationData(destination) {
  const norm = String(destination || '').toLowerCase().trim();
  if (!norm) return null;
  for (const key in CURATED) {
    if (CURATED[key].aliases.some((alias) => norm.includes(alias))) return { ...CURATED[key], key };
  }
  for (const place in WORLD_DESTINATION_DATA) {
    const data = WORLD_DESTINATION_DATA[place];
    if (data.aliases.some((alias) => norm.includes(alias))) return { ...data, key: place };
  }
  return null;
}

export function destinationCoords(destination) {
  const data = findDestinationData(destination);
  return data ? data.coords : null;
}