/*
 * The whole guide is data. Adding a destination is adding one object here; the UI, filters, detail
 * view and booking buttons are all generated from this. Keeping content out of markup is what lets
 * the site grow to hundreds of places without touching HTML.
 *
 * Distances and travel times are approximate, from Bengaluru (BLR), and meant for planning, not
 * precision. `type` and `seasons` drive the filters. `booking` gives the destination hints the
 * MakeMyTrip deep-links are built from (see booking.js).
 */

const ORIGIN = {
    city: 'Bengaluru',
    iata: 'BLR',            // Kempegowda International, for flight links
    railCode: 'SBC',        // KSR Bengaluru City Junction, for train links
};

const DESTINATIONS = [
    {
        slug: 'coorg',
        name: 'Coorg',
        also: 'Kodagu',
        state: 'Karnataka',
        type: 'hills',
        distanceKm: 265,
        driveHours: '5–6',
        seasons: ['oct', 'nov', 'dec', 'jan', 'feb', 'mar'],
        bestMonths: 'October to March',
        tagline: 'Coffee country in the Western Ghats — misty hills, plantations and waterfalls.',
        image: 'images/coorg.jpg',
        description:
            'Coorg, officially Kodagu, is a hill district in the Western Ghats known for its coffee ' +
            'estates, spice plantations and cool, misty weather. Madikeri is the main town and a ' +
            'good base. Highlights include Abbey Falls, the Raja\'s Seat viewpoint at sunset, the ' +
            'Namdroling (Golden) Tibetan monastery at Bylakuppe, and Dubare elephant camp on the ' +
            'Cauvery. It rewards a slow pace: a plantation stay, a short trek to Tadiandamol, and a ' +
            'lot of good coffee.',
        howToReach: {
            flight: 'No airport in Coorg. Fly to Bengaluru (BLR) or Mangaluru (IXE, ~140 km), then drive.',
            train: 'No railway in Coorg. Nearest stations are Mysuru (~120 km) and Hassan (~115 km); continue by road.',
            bus: 'Direct KSRTC and private buses run overnight from Bengaluru to Madikeri (~6 hours).',
            road: 'Self-drive or cab via Mysuru road (NH275); roughly 5–6 hours from Bengaluru.',
        },
        precautions: [
            'Roads inside the hills are narrow and winding; avoid night driving and carry motion-sickness relief.',
            'Leeches are common on treks and plantations during and just after the monsoon — carry salt and wear closed shoes.',
            'Carry cash; card and UPI coverage thins out on estates and smaller homestays.',
            'Book plantation stays ahead on long weekends; Coorg fills up fast.',
        ],
        booking: { railTo: 'Mysuru', busTo: 'Madikeri', hotelCity: 'Coorg' },
        tags: ['nature', 'date', 'solo'],
    },
    {
        slug: 'chikmagalur',
        name: 'Chikmagalur',
        state: 'Karnataka',
        type: 'hills',
        distanceKm: 245,
        driveHours: '4.5–5.5',
        seasons: ['sep', 'oct', 'nov', 'dec', 'jan', 'feb'],
        bestMonths: 'September to February',
        tagline: 'The birthplace of Indian coffee, under Karnataka\'s highest peak.',
        image: 'images/chikmagalur.jpg',
        description:
            'Chikmagalur sits at the foot of Mullayanagiri, the highest peak in Karnataka, and is ' +
            'where coffee was first grown in India. It is quieter than Coorg and better for walkers: ' +
            'the Baba Budangiri range, Hebbe and Kalhatti falls, the Bhadra wildlife sanctuary, and ' +
            'sunrise from Mullayanagiri or Seethalayyanagiri. Estate stays among the coffee are the ' +
            'reason to come.',
        howToReach: {
            flight: 'Nearest airport is Mangaluru (IXE, ~150 km); Bengaluru (BLR, ~245 km) has far more flights.',
            train: 'Chikmagalur has a small station with limited service; Kadur (~40 km) and Hassan are better railheads.',
            bus: 'Regular KSRTC buses from Bengaluru to Chikmagalur town (~5 hours).',
            road: 'Drive via NH75 through Hassan; about 4.5–5.5 hours from Bengaluru.',
        },
        precautions: [
            'Peak-climb trails (Mullayanagiri, Baba Budangiri) get slippery in the mist; start early and wear grip shoes.',
            'Mobile signal drops inside estates and on the ghat roads — download maps offline.',
            'Monsoon brings leeches and landslips on hill roads; check conditions before travelling June–August.',
            'Some peaks fall in reserved forest with entry timings and occasional closures; confirm locally.',
        ],
        booking: { railTo: 'Kadur', busTo: 'Chikmagalur', hotelCity: 'Chikmagalur' },
        tags: ['nature', 'solo', 'date'],
    },
    {
        slug: 'mysuru',
        name: 'Mysuru',
        also: 'Mysore',
        state: 'Karnataka',
        type: 'heritage',
        distanceKm: 145,
        driveHours: '3–3.5',
        seasons: ['sep', 'oct', 'nov', 'dec', 'jan', 'feb'],
        bestMonths: 'September to February (Dasara in Sep–Oct is spectacular)',
        tagline: 'The royal city — a floodlit palace, gardens and the Dasara festival.',
        image: 'images/mysuru.jpg',
        description:
            'Mysuru is the easiest heritage getaway from Bengaluru and a great first trip. The Mysore ' +
            'Palace is the centrepiece, especially when its roughly 97,000 bulbs are lit on Sunday ' +
            'evenings and through Dasara. Add Chamundi Hill and its temple, the Brindavan Gardens ' +
            'musical fountain, St. Philomena\'s Church and the Devaraja Market. It pairs naturally ' +
            'with a side trip to Srirangapatna or onward to Coorg.',
        howToReach: {
            flight: 'Mysuru (MYQ) has limited flights; most visitors fly into Bengaluru (BLR) and continue by road or rail.',
            train: 'Frequent fast trains from Bengaluru (SBC) to Mysuru (MYS), including the Vande Bharat — about 2 hours.',
            bus: 'Very frequent KSRTC and private buses from Bengaluru (~3 hours).',
            road: 'Drive on the Bengaluru–Mysuru expressway (NH275); about 3 hours.',
        },
        precautions: [
            'During Dasara the city is packed and hotels cost several times more — book weeks ahead.',
            'The palace requires removing footwear and bans photography inside; carry socks and a bag for shoes.',
            'Chamundi Hill traffic and queues are heavy on weekends; go early.',
            'Standard city precautions: watch belongings in the crowded market area.',
        ],
        booking: { railTo: 'Mysuru', busTo: 'Mysuru', hotelCity: 'Mysore' },
        tags: ['heritage', 'family', 'photo'],
    },
    {
        slug: 'ooty',
        name: 'Ooty',
        also: 'Udhagamandalam',
        state: 'Tamil Nadu',
        type: 'hills',
        distanceKm: 270,
        driveHours: '6–7',
        seasons: ['oct', 'nov', 'dec', 'mar', 'apr', 'may', 'jun'],
        bestMonths: 'October to June (summer is the classic hill-station escape)',
        tagline: 'Queen of the Nilgiris — tea gardens and a UNESCO toy train.',
        image: 'images/ooty.jpg',
        description:
            'Ooty is the best-known hill station of the Nilgiris, a cool retreat of tea gardens, ' +
            'colonial bungalows and a botanical garden. The signature experience is the Nilgiri ' +
            'Mountain Railway, a UNESCO World Heritage steam toy-train that climbs from Mettupalayam. ' +
            'Add Ooty Lake, Doddabetta peak (the highest in the Nilgiris) and a drive through the tea ' +
            'estates toward Coonoor, which is quieter and just as pretty.',
        howToReach: {
            flight: 'Nearest airport is Coimbatore (CJB, ~90 km); Bengaluru (BLR) is the larger hub, ~270 km away.',
            train: 'Take a train to Mettupalayam, then the Nilgiri Mountain Railway toy train up to Ooty. Coimbatore is the mainline railhead.',
            bus: 'Overnight and day buses run from Bengaluru to Ooty (~7 hours) via Mysuru and Bandipur.',
            road: 'Drive via Mysuru and Bandipur/Mudumalai; 6–7 hours, including 36 hairpin bends on the ghat.',
        },
        precautions: [
            'The Bandipur–Mudumalai stretch has a night traffic ban (roughly 9 pm–6 am) to protect wildlife; plan a daytime crossing.',
            'It gets genuinely cold, especially December–January; carry warm layers.',
            'Book the toy train well in advance — seats sell out, particularly in season.',
            'Ghat roads have many hairpins; those prone to motion sickness should prepare.',
        ],
        booking: { railTo: 'Mettupalayam', busTo: 'Ooty', hotelCity: 'Ooty' },
        tags: ['nature', 'family', 'photo'],
    },
    {
        slug: 'wayanad',
        name: 'Wayanad',
        state: 'Kerala',
        type: 'wildlife',
        distanceKm: 285,
        driveHours: '5.5–6.5',
        seasons: ['oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may'],
        bestMonths: 'October to May',
        tagline: 'Green Kerala highlands — wildlife, caves and waterfalls.',
        image: 'images/wayanad.jpg',
        description:
            'Wayanad is a forested plateau in the Kerala highlands, greener and wilder than the ' +
            'Karnataka hill stations. Highlights include the Edakkal Caves with their prehistoric ' +
            'carvings, Chembra Peak with its heart-shaped lake, Soochipara and Meenmutty falls, and ' +
            'the Wayanad Wildlife Sanctuary next to Bandipur and Nagarhole. It is a good base for ' +
            'safaris, treks and spice-plantation stays.',
        howToReach: {
            flight: 'Nearest airports are Kannur (CNN, ~90 km) and Kozhikode/Calicut (CCJ, ~100 km); Bengaluru (BLR) is ~285 km.',
            train: 'No railway in Wayanad. Nearest railhead is Kozhikode (~100 km); continue by road up the ghat.',
            bus: 'Buses from Bengaluru run to Kalpetta and Sultan Bathery (~6–7 hours) via Mysuru.',
            road: 'Drive via Mysuru and the Bandipur/Muthanga forest route; 5.5–6.5 hours.',
        },
        precautions: [
            'The forest route through Bandipur/Muthanga has a night vehicle ban; cross in daylight.',
            'Leeches are common on treks in and after the monsoon — carry salt and wear closed shoes.',
            'Chembra Peak and some trails need forest-department permits with daily limits; book early in the day.',
            'Carry cash for plantation stays and small towns where digital payments are patchy.',
        ],
        booking: { railTo: 'Kozhikode', busTo: 'Kalpetta', hotelCity: 'Wayanad' },
        tags: ['nature', 'solo', 'family'],
    },
    {
        slug: 'hampi',
        name: 'Hampi',
        state: 'Karnataka',
        type: 'heritage',
        distanceKm: 340,
        driveHours: '6–7',
        seasons: ['oct', 'nov', 'dec', 'jan', 'feb'],
        bestMonths: 'October to February',
        tagline: 'A UNESCO ruin-scape of a vanished empire, among giant boulders.',
        image: 'images/hampi.jpg',
        description:
            'Hampi is the UNESCO World Heritage site of Vijayanagara, once one of the richest cities ' +
            'in the world, now a vast field of temples and ruins scattered across a surreal boulder ' +
            'landscape. Don\'t miss the Virupaksha Temple, the stone chariot at the Vittala Temple, ' +
            'the royal enclosure and Matanga Hill for sunrise. The riverside Hampi bazaar and the ' +
            'quieter Anegundi side reward a couple of unhurried days.',
        howToReach: {
            flight: 'Nearest airports are Hubballi (HBX, ~145 km) and Vidyanagar/Toranagallu (VDY, ~40 km); Bengaluru (BLR) has the most flights.',
            train: 'Nearest railhead is Hosapete (Hospet, HPT, ~13 km), well connected to Bengaluru; then a short cab or auto.',
            bus: 'Overnight buses from Bengaluru run to Hosapete/Hampi (~7 hours).',
            road: 'Drive via Chitradurga on NH48; 6–7 hours from Bengaluru.',
        },
        precautions: [
            'Summers (Mar–May) are punishingly hot with little shade among the ruins; visit in winter and carry water and sun cover.',
            'The site is spread out — hire a bicycle, scooter or auto for the day rather than walking it all.',
            'Climbing boulders and temple steps needs grip footwear; some rocks are slippery.',
            'Respect it as a living heritage and religious site: dress modestly and don\'t deface the monuments.',
        ],
        booking: { railTo: 'Hosapete', busTo: 'Hospet', hotelCity: 'Hampi' },
        tags: ['heritage', 'photo', 'solo'],
    },
    {
        slug: 'gokarna',
        name: 'Gokarna',
        state: 'Karnataka',
        type: 'beach',
        distanceKm: 480,
        driveHours: '8–9',
        seasons: ['oct', 'nov', 'dec', 'jan', 'feb', 'mar'],
        bestMonths: 'October to March',
        tagline: 'A temple town with quiet, cliff-backed beaches — the calmer Goa.',
        image: 'images/gokarna.jpg',
        description:
            'Gokarna is a coastal temple town that doubles as a laid-back beach destination, quieter ' +
            'and more scenic than Goa. A short cliff trek links a string of beaches — Om, Half Moon ' +
            'and Paradise — while the town itself centres on the Mahabaleshwar Temple. It suits ' +
            'travellers who want beach shacks and sunsets without the crowds and nightlife of Goa.',
        howToReach: {
            flight: 'Nearest airports are Hubballi (HBX, ~150 km) and Goa/Dabolim (GOI, ~140 km); Bengaluru (BLR) is ~480 km.',
            train: 'Gokarna Road (GOK) station is on the Konkan line with limited stops; Ankola and Kumta are alternatives.',
            bus: 'Overnight buses run from Bengaluru to Gokarna (~9 hours).',
            road: 'A long drive (~8–9 hours) via Davangere and Hubballi; the overnight bus or train is easier.',
        },
        precautions: [
            'The beach-to-beach cliff trek is exposed and unshaded — go early or late, carry water, and avoid it in the rain.',
            'Sea currents can be strong at Om and Half Moon; swim only where it is safe and heed local advice.',
            'It is a religious town — dress respectfully around the temple and main bazaar.',
            'Monsoon (Jun–Sep) makes the trek slippery and the sea rough; the beaches are a dry-season destination.',
        ],
        booking: { railTo: 'Gokarna Road', busTo: 'Gokarna', hotelCity: 'Gokarna' },
        tags: ['nature', 'date', 'solo'],
    },
    {
        slug: 'nandi-hills',
        name: 'Nandi Hills',
        state: 'Karnataka',
        type: 'hills',
        distanceKm: 60,
        driveHours: '1.5–2',
        seasons: ['jan', 'feb', 'mar', 'aug', 'sep', 'oct', 'nov', 'dec'],
        bestMonths: 'Year-round; clearest sunrises August to March',
        tagline: 'The classic Bangalore sunrise day-trip, above a sea of clouds.',
        image: 'images/nandi-hills.jpg',
        description:
            'Nandi Hills is the closest escape from Bengaluru and the go-to spot for a sunrise above ' +
            'the clouds. An ancient hill fortress with Tipu Sultan connections, it has the Yoga ' +
            'Nandeeshwara temple, Tipu\'s Drop viewpoint and easy walking paths. It is a half-day or ' +
            'early-morning trip rather than an overnight — arrive before dawn for the view, beat the ' +
            'crowds, and be back in the city by lunch.',
        howToReach: {
            flight: 'It sits close to Kempegowda International Airport (BLR, ~35 km) — handy if you are flying in or out.',
            train: 'Nearest stations are Chikkaballapur and Devanahalli; most people simply drive from Bengaluru.',
            bus: 'KSRTC buses run to the base; the last stretch up the hill is by road or on foot.',
            road: 'Drive on NH44 towards Chikkaballapur; 1.5–2 hours, so leave the city around 4–4:30 am for sunrise.',
        },
        precautions: [
            'Entry gates open early but there can be a long vehicle queue on weekends — arrive very early or expect a wait.',
            'Mornings are cold and windy at the top; carry a light jacket even in summer.',
            'The viewpoints have steep, unfenced drops — keep well back, especially with children.',
            'It gets crowded and littered on holidays; carry your trash back and consider a weekday visit.',
        ],
        booking: { railTo: 'Chikkaballapur', busTo: 'Chikkaballapur', hotelCity: 'Nandi Hills' },
        tags: ['nature', 'photo', 'family'],
    },
];

/*
 * Places to visit INSIDE Bengaluru itself — city sights you can do in a few hours, not multi-day
 * getaways. They share the photo-card + detail-page pattern of DESTINATIONS, but with a city model:
 * no distance-from-Bengaluru and no flight/train booking. Each has a slug (for #/city/<slug>),
 * an image, an overview, highlights, how to get there within the city, entry/timing notes, tips,
 * and a Google Maps directions link.
 */
const CITY_ATTRACTIONS = [
    {
        slug: 'lalbagh',
        name: 'Lalbagh Botanical Garden',
        category: 'Garden',
        area: 'Mavalli, South Bengaluru',
        bestTime: 'Early morning, 6–9 am',
        tagline: 'A 240-acre botanical garden with a glasshouse and a famous flower show.',
        image: 'images/lalbagh.jpg',
        description:
            'Lalbagh is Bengaluru\'s best-loved green space, commissioned by Hyder Ali in the 1760s ' +
            'and expanded by Tipu Sultan. Spread over about 240 acres, it holds India\'s largest ' +
            'collection of tropical plants, a lake, an ancient rock said to be 3,000 million years ' +
            'old, and the glass Crystal Palace modelled on London\'s Crystal Palace. Morning walkers ' +
            'flock here; the twice-yearly flower shows are the big draw.',
        highlights: [
            'The glass house and its Republic Day and Independence Day flower shows',
            'The Lalbagh Rock and the Kempegowda watchtower on it',
            'The lake, aquarium and the huge silk-cotton and mahogany trees',
        ],
        gettingThere: {
            metro: 'Lalbagh has its own Namma Metro station on the Green Line, right at the west gate.',
            road: 'Autos and cabs reach all four gates; the Double Road and Siddapura gates are handy for parking.',
        },
        entry: 'Small entry ticket (free very early morning for walkers). Open roughly 6 am–7 pm daily.',
        tips: [
            'The biannual flower show is spectacular but very crowded — go on a weekday morning.',
            'It is large and open — carry water and sun cover if you visit late morning.',
            'Enter from the Metro-side west gate to reach the glass house fastest.',
        ],
        maps: 'Lalbagh Botanical Garden, Bengaluru',
        lat: 12.9507, lng: 77.5848,
        tags: ['nature', 'family', 'photo'],
    },
    {
        slug: 'cubbon-park',
        name: 'Cubbon Park',
        category: 'Park',
        area: 'Sampangi Rama Nagar, Central Bengaluru',
        bestTime: 'Morning, or weekend car-free hours',
        tagline: 'A 300-acre green lung in the heart of the city, laid out in 1884.',
        image: 'images/cubbon-park.jpg',
        description:
            'Cubbon Park, officially Sri Chamarajendra Park, is the green heart of central Bengaluru, ' +
            'created in 1884 by Richard Sankey. Its roughly 300 acres of lawns and old-growth trees ' +
            'sit among some of the city\'s grandest buildings — the red Gothic State Central Library, ' +
            'the High Court (Attara Kacheri) and museums. It is the city\'s go-to spot for a morning ' +
            'walk, a run, or a lazy afternoon under the trees.',
        highlights: [
            'The red-brick State Central Library and the Attara Kacheri High Court',
            'The bamboo grove, bandstand and the toy train for kids',
            'Government Museum and the Visvesvaraya Industrial and Technological Museum nearby',
        ],
        gettingThere: {
            metro: 'Cubbon Park and Dr. BR Ambedkar stations (Purple Line) sit right by the park.',
            road: 'Central and easy to reach from MG Road; parking is limited, so the Metro is easiest.',
        },
        entry: 'Free and open all day; the internal roads close to traffic on weekends and holidays.',
        tips: [
            'Come on a weekend or holiday morning, when the roads shut to cars — the best time to walk or run.',
            'Pair it with the museums or the library for a half-day in the centre of town.',
            'Early morning is quietest; it gets busy with groups by mid-morning.',
        ],
        maps: 'Cubbon Park, Bengaluru',
        lat: 12.9763, lng: 77.5929,
        tags: ['nature', 'family', 'solo'],
    },
    {
        slug: 'bangalore-palace',
        name: 'Bangalore Palace',
        category: 'Heritage',
        area: 'Vasanth Nagar, Central Bengaluru',
        bestTime: 'Late morning to afternoon',
        tagline: 'An 1878 Tudor-style royal palace of the Wodeyar dynasty.',
        image: 'images/bangalore-palace.jpg',
        description:
            'Built in 1878 and inspired by England\'s Windsor Castle, Bangalore Palace is a Tudor-style ' +
            'residence of the Wodeyar royal family, spread across about 45,000 square feet. Inside are ' +
            'ornate wooden interiors, Gothic windows, turrets and a large collection of family ' +
            'portraits and period furniture. An audio guide walks you through the halls, and the ' +
            'grounds host concerts and events through the year.',
        highlights: [
            'The Tudor and Scottish-Gothic architecture, turrets and grand durbar hall',
            'The audio-guided tour of the royal interiors and portrait collection',
            'The sprawling grounds, a frequent venue for big-name concerts',
        ],
        gettingThere: {
            metro: 'Nearest Metro is around Cantonment / Sivan Chetty Garden; take an auto or cab for the last stretch.',
            road: 'Easily reached by cab or auto in Vasanth Nagar, off Jayamahal Road.',
        },
        entry: 'Ticketed entry with an audio guide; a separate, steep camera fee applies. Open roughly 10 am–5:30 pm.',
        tips: [
            'Check the camera fee before you start shooting inside — it is charged on top of entry.',
            'Confirm timings on event days, when parts of the grounds may be closed for concerts.',
            'Allow about 60–90 minutes for the full audio-guided tour.',
        ],
        maps: 'Bangalore Palace, Bengaluru',
        lat: 12.9987, lng: 77.5920,
        tags: ['heritage', 'photo', 'family'],
    },
    {
        slug: 'vidhana-soudha',
        name: 'Vidhana Soudha',
        category: 'Landmark',
        area: 'Ambedkar Veedhi, Central Bengaluru',
        bestTime: 'Evening, especially Sunday and holidays',
        tagline: 'Karnataka\'s grand granite legislative building, floodlit on holidays.',
        image: 'images/vidhana-soudha.jpg',
        description:
            'Vidhana Soudha, completed in 1956, is the seat of Karnataka\'s legislature and one of the ' +
            'most imposing buildings in the country. Built in a Neo-Dravidian granite style, it stands ' +
            'at the north end of Cubbon Park facing the Gothic High Court. It is most striking after ' +
            'dark on Sundays and public holidays, when the whole façade is floodlit.',
        highlights: [
            'The floodlit granite façade on Sunday and holiday evenings',
            'The Neo-Dravidian domes and the grand central steps',
            'The contrast with the red Attara Kacheri High Court across the road',
        ],
        gettingThere: {
            metro: 'Dr. BR Ambedkar and Cubbon Park stations (Purple Line) are a short walk away.',
            road: 'Central location on Ambedkar Veedhi; easy by auto or cab.',
        },
        entry: 'A working government building — no public entry. You can view and photograph it from outside.',
        tips: [
            'Come on a Sunday or holiday evening for the illumination; weekdays it is not lit.',
            'Photograph from across the road for the full façade in frame.',
            'Pair it with a Cubbon Park walk, since it sits right at the park\'s edge.',
        ],
        maps: 'Vidhana Soudha, Bengaluru',
        lat: 12.9794, lng: 77.5912,
        tags: ['heritage', 'photo'],
    },
    {
        slug: 'iskcon-temple',
        name: 'ISKCON Temple',
        category: 'Temple',
        area: 'Rajajinagar, West Bengaluru',
        bestTime: 'Morning, or evening aarti',
        tagline: 'A hilltop Krishna temple, one of the largest ISKCON complexes in the world.',
        image: 'images/iskcon.jpg',
        description:
            'The Sri Radha Krishna Temple in Rajajinagar, run by ISKCON, is one of the largest Krishna ' +
            'temples in the world. Opened in 1997 and set on a small hill, it blends modern glass-and-' +
            'steel construction with traditional temple form. Beyond the main shrine there are ' +
            'multimedia exhibits on Vedic culture, a large hall, and a well-known prasadam and ' +
            'food-court area.',
        highlights: [
            'The main Radha-Krishna shrine and the gold-topped towers',
            'The evening aarti and devotional singing',
            'Prasadam counters and the temple\'s vegetarian food court',
        ],
        gettingThere: {
            metro: 'Mahalakshmi station (Green Line) is the nearest; then a short auto ride up to the temple.',
            road: 'On Hare Krishna Hill in Rajajinagar, well signposted and easy by cab or auto.',
        },
        entry: 'Free entry. Open in two windows, morning and evening; timings extend on festival days.',
        tips: [
            'Weekends and festival days see long queues — go early on a weekday if you can.',
            'Phones, footwear and bags are deposited before entering; carry as little as possible.',
            'Dress modestly, as it is an active place of worship.',
        ],
        maps: 'ISKCON Temple Rajajinagar, Bengaluru',
        lat: 13.0098, lng: 77.5511,
        tags: ['heritage', 'family'],
    },
    {
        slug: 'bannerghatta',
        name: 'Bannerghatta Biological Park',
        category: 'Wildlife',
        area: 'Bannerghatta, South Bengaluru',
        bestTime: 'Morning; opens around 9:30 am',
        tagline: 'A zoo, safari and butterfly park on the city\'s southern edge.',
        image: 'images/bannerghatta.jpg',
        description:
            'On the southern fringe of the city, Bannerghatta Biological Park combines a zoo, a bus ' +
            'safari through forested enclosures, a butterfly park and a rescue centre. The safari is ' +
            'the highlight, passing herbivore, tiger, lion and bear zones, including the well-known ' +
            'white tigers. It makes an easy half- to full-day outing for families without leaving ' +
            'Bengaluru.',
        highlights: [
            'The bus safari past tigers (including white tigers), lions and bears',
            'India\'s first butterfly park, with a walk-through conservatory',
            'The zoo and the animal rescue and rehabilitation centre',
        ],
        gettingThere: {
            metro: 'No Metro nearby; take a cab, or a BMTC bus toward Bannerghatta from the city.',
            road: 'About 22 km south of the centre on Bannerghatta Road; roughly an hour by cab.',
        },
        entry: 'Ticketed, with separate safari and butterfly-park tickets. Closed on Tuesdays; opens around 9:30 am.',
        tips: [
            'Book safari tickets online ahead and arrive early — the safari fills up, and it is closed Tuesdays.',
            'Leave enough travel time; south-city traffic on Bannerghatta Road can be heavy.',
            'Carry water and sun cover; the zoo section involves a fair bit of walking.',
        ],
        maps: 'Bannerghatta Biological Park, Bengaluru',
        lat: 12.8000, lng: 77.5770,
        tags: ['family', 'nature', 'photo'],
        closedOn: 'tue',
    },
    {
        slug: 'tipu-summer-palace',
        name: 'Tipu Sultan\'s Summer Palace',
        category: 'Heritage',
        area: 'Chamrajpet, South Bengaluru',
        bestTime: 'Morning',
        tagline: 'An ornate 18th-century teakwood palace built for Tipu Sultan.',
        image: 'images/tipu-palace.jpg',
        description:
            'This two-storey teakwood palace, completed in 1791 within the old Bangalore Fort, was ' +
            'Tipu Sultan\'s summer retreat. An elegant example of Indo-Islamic architecture, it is ' +
            'built almost entirely of wood, with carved pillars, arches and painted ceilings, and a ' +
            'small museum on Tipu and the Mysore kingdom. It is compact and best combined with the ' +
            'nearby fort and market.',
        highlights: [
            'The carved teakwood pillars, balconies and painted interiors',
            'The small museum on Tipu Sultan and the Mysore dynasty',
            'The adjoining Bangalore Fort remains and the KR Market area',
        ],
        gettingThere: {
            metro: 'KR Market and City Railway Station (Green Line) are nearby; then a short auto ride.',
            road: 'In Chamrajpet near KR Market; easy by auto or cab, though the area is congested.',
        },
        entry: 'Small entry ticket. Open roughly 8:30 am–5:30 pm; a protected monument, so no defacing or littering.',
        tips: [
            'It is compact — pair it with the fort, KR Market and Bangalore Fort for a half-day.',
            'Go in the morning before the surrounding market traffic builds up.',
            'Wooden floors and stairs are old and narrow; tread gently.',
        ],
        maps: 'Tipu Sultan Summer Palace, Bengaluru',
        lat: 12.9591, lng: 77.5738,
        tags: ['heritage', 'photo'],
    },
    {
        slug: 'ulsoor-lake',
        name: 'Ulsoor Lake',
        category: 'Lake',
        area: 'Ulsoor, East Bengaluru',
        bestTime: 'Evening',
        tagline: 'One of the city\'s largest lakes, with boating and a lakeside promenade.',
        image: 'images/ulsoor-lake.jpg',
        description:
            'Ulsoor Lake, also called Halasuru Lake, is one of the largest lakes in the city, close to ' +
            'MG Road on the eastern side. Dotted with small islands and ringed by a walking promenade, ' +
            'it offers pedal- and row-boating and is a calm break from the traffic just outside. A ' +
            'Ganesha temple and the Someshwara temple sit nearby, making an easy evening loop.',
        highlights: [
            'Boating among the lake\'s small wooded islands',
            'The lakeside promenade for an evening walk',
            'The nearby Someshwara and Ulsoor Ganesha temples',
        ],
        gettingThere: {
            metro: 'Halasuru and Trinity stations (Purple Line) are a short walk or auto ride away.',
            road: 'Just off MG Road in Ulsoor; central and easy by auto or cab.',
        },
        entry: 'Free to walk the promenade; boating is ticketed with limited, weather-dependent hours.',
        tips: [
            'Boating hours are limited and weather-dependent; the promenade is pleasant year-round.',
            'Evenings are the nicest, when it cools down and the lake catches the sunset.',
            'It is a city lake — swimming is not allowed.',
        ],
        maps: 'Ulsoor Lake, Bengaluru',
        lat: 12.9825, lng: 77.6203,
        tags: ['nature', 'date', 'family'],
    },
];

/*
 * Famous temples of Bengaluru — a spread across eras and faiths: ancient Chola- and Vijayanagara-era
 * shrines, a 16th-century cave temple, and a modern landmark. Same city-attraction model (area,
 * best time, highlights, getting there, entry, tips, a Maps link) so they reuse the city detail view.
 */
const TEMPLES = [
    {
        slug: 'iskcon',
        name: 'ISKCON Sri Radha Krishna Temple',
        category: 'Krishna temple',
        area: 'Rajajinagar, North Bengaluru',
        bestTime: 'Early morning darshan, or evening aarti',
        tagline: 'One of the world\'s largest Krishna temples, on Hare Krishna Hill.',
        image: 'images/iskcon.jpg',
        description:
            'Completed in 1997 atop the seven-acre Hare Krishna Hill in Rajajinagar, ISKCON Bengaluru ' +
            'is one of the largest Krishna temples in the world. It blends classic Dravidian form with ' +
            'modern construction: four gopurams linked by a glazed-glass canopy, a gold-plated flag ' +
            'mast and shikara, and a soaring main hall for Sri Radha Krishnachandra. Beyond darshan it ' +
            'runs a huge kitchen and the Akshaya Patra mid-day-meal programme, and the complex includes ' +
            'a multimedia show and a busy prasadam and shopping arcade.',
        highlights: [
            'The gold-plated shikara and flag mast, and the glass-canopied gopurams',
            'Evening aarti and bhajans in the main hall',
            'Janmashtami, when the temple is at its most spectacular (and most crowded)',
        ],
        gettingThere: {
            metro: 'Mahalakshmi station (Green Line) is the nearest; then a short auto ride up the hill.',
            road: 'Well signposted off the Chord Road / Mahalakshmi Layout area; cabs and autos reach the gate.',
        },
        entry: 'Free entry. Open roughly 7:15 am–1 pm and 4–8:20 pm; timings extend on festival days.',
        tips: [
            'Phones and footwear are deposited at the entrance — travel light and carry a bag tag.',
            'Weekends and Janmashtami see very long, winding queues; a weekday morning is calmest.',
            'The walk to the sanctum is long and one-way through the arcade; allow at least an hour.',
        ],
        maps: 'ISKCON Temple, Rajajinagar, Bengaluru',
        lat: 13.0098, lng: 77.5511,
        tags: ['heritage', 'family'],
    },
    {
        slug: 'bull-temple',
        name: 'Bull Temple (Dodda Basavana Gudi)',
        category: 'Shiva / Nandi temple',
        area: 'Basavanagudi, South Bengaluru',
        bestTime: 'Morning; the Kadalekai Parishe groundnut fair in Nov–Dec',
        tagline: 'A giant monolithic Nandi carved from a single granite boulder.',
        image: 'images/bull-temple.jpg',
        description:
            'Built by Kempegowda around 1537, the Bull Temple in Basavanagudi enshrines one of the ' +
            'largest Nandi (bull) idols in the world — roughly 4.5 metres tall and 6 metres long, ' +
            'carved from a single block of granite and darkened over centuries by ritual oil and ' +
            'charcoal. Nandi is the mount and devotee of Shiva, and the temple gives the whole ' +
            'neighbourhood its name (Basava = bull, gudi = temple). Each year the surrounding streets ' +
            'host the Kadalekai Parishe, a centuries-old groundnut fair.',
        highlights: [
            'The colossal monolithic Nandi, garlanded and anointed daily',
            'The Kempegowda-era Dravidian architecture',
            'The Kadalekai Parishe (groundnut fair) in late November / December',
        ],
        gettingThere: {
            metro: 'National College station (Green Line) is the closest; about a 15-minute walk or short auto.',
            road: 'In Basavanagudi off Bull Temple Road; easy by auto or cab, parking is tight on weekends.',
        },
        entry: 'Free entry. Open roughly 6 am–noon and 5:30–8:30 pm daily.',
        tips: [
            'The Dodda Ganapathi (big Ganesha) temple is right next door — do both in one visit.',
            'Go during the groundnut fair for the atmosphere, but expect big crowds and closed roads.',
            'Footwear comes off at the entrance; floors can be warm by mid-morning.',
        ],
        maps: 'Bull Temple, Basavanagudi, Bengaluru',
        lat: 12.9426, lng: 77.5676,
        tags: ['heritage', 'photo'],
    },
    {
        slug: 'gavi-gangadhareshwara',
        name: 'Gavi Gangadhareshwara Cave Temple',
        category: 'Shiva cave temple',
        area: 'Gavipuram, South Bengaluru',
        bestTime: 'Makar Sankranti (Jan 14–15) for the sun phenomenon',
        tagline: 'A 16th-century rock-cut cave temple with a famous solar alignment.',
        image: 'images/gavi-gangadhareshwara.jpg',
        description:
            'One of Bengaluru\'s oldest temples, this Shiva shrine was built into a natural cave by ' +
            'Kempegowda in the 16th century — "gavi" means cave in Kannada. Its monolithic granite ' +
            'discs and pillars in the forecourt are an architectural curiosity, but the temple is most ' +
            'famous for a solar marvel: on Makar Sankranti each January, evening sunlight passes through ' +
            'an arch and between the horns of the stone Nandi to fall directly on the Shiva linga inside ' +
            'the cave, illuminating it for a few minutes. It is protected as an ancient monument.',
        highlights: [
            'The Makar Sankranti sunlight-through-Nandi\'s-horns alignment on the linga',
            'The rock-cut cave sanctum and the monolithic discs (Surya Pana, Chandra Pana)',
            'The old Kempegowda-era Dravidian forecourt',
        ],
        gettingThere: {
            metro: 'National College and Krishna Rajendra Market stations (Green Line) are the nearest railheads.',
            road: 'In Gavipuram Guttahalli, near Kempegowda Nagar; reachable by auto or cab.',
        },
        entry: 'Free entry. Open roughly 7:30 am–12:30 pm and 5–8:30 pm; hugely crowded on Sankranti.',
        tips: [
            'For the Sankranti sun phenomenon, arrive well before evening — crowds are enormous.',
            'The cave sanctum is low and dim; watch your step and your head.',
            'A quiet weekday morning is the best time to actually see the architecture.',
        ],
        maps: 'Gavi Gangadhareshwara Temple, Gavipuram, Bengaluru',
        lat: 12.9503, lng: 77.5590,
        tags: ['heritage', 'photo'],
    },
    {
        slug: 'halasuru-someshwara',
        name: 'Halasuru Someshwara Temple',
        category: 'Shiva temple',
        area: 'Halasuru (Ulsoor), East Bengaluru',
        bestTime: 'Morning; Kartika and Shivaratri festivals',
        tagline: 'A Chola-origin Shiva temple, greatly expanded under Vijayanagara.',
        image: 'images/halasuru-someshwara.jpg',
        description:
            'The Someshwara temple in Halasuru (Ulsoor) is among the oldest surviving temples in the ' +
            'city, with origins in the Chola period and major additions during the Vijayanagara era, ' +
            'attributed to the 16th century and Kempegowda\'s time. Dedicated to Shiva as Someshwara, ' +
            'it is celebrated for its intricately carved pillars, a richly sculpted mantapa and a tall, ' +
            'colourful gopura crowded with figures from the epics. It sits close to Ulsoor Lake, making ' +
            'the two an easy combined visit.',
        highlights: [
            'The towering, densely sculpted gopura over the entrance',
            'The ornate pillared mantapa and Vijayanagara-era stonework',
            'Old Tamil and Kannada inscriptions within the complex',
        ],
        gettingThere: {
            metro: 'Halasuru and Trinity stations (Purple Line) are a short auto ride away.',
            road: 'In Ulsoor, just off MG Road and near Ulsoor Lake; central and easy by auto or cab.',
        },
        entry: 'Free entry. Open roughly 6 am–noon and 5:30–8:30 pm daily.',
        tips: [
            'Pair it with a walk around Ulsoor Lake, a few minutes away.',
            'Look up at the mantapa ceilings and pillar carvings — the detail is the highlight.',
            'It is a living temple, so dress modestly and be mindful during pujas.',
        ],
        maps: 'Halasuru Someshwara Temple, Ulsoor, Bengaluru',
        lat: 12.9789, lng: 77.6270,
        tags: ['heritage', 'photo'],
    },
    {
        slug: 'banashankari',
        name: 'Sri Banashankari Amma Temple',
        category: 'Devi temple',
        area: 'Banashankari, South Bengaluru',
        bestTime: 'Fridays and Rahukala (evening) for special pujas',
        tagline: 'A hugely popular Devi temple famous for its Rahukala lamp offerings.',
        image: 'images/banashankari.jpg',
        description:
            'The Banashankari Amma temple is one of the city\'s most-visited Devi shrines and gives its ' +
            'name to the whole surrounding locality. The goddess Banashankari, a form of Parvati, is ' +
            'worshipped here in a way that is unusual for a Devi temple: devotees offer lamps and ' +
            'prayers during Rahukala — a period normally considered inauspicious — which draws long ' +
            'queues on Fridays and Tuesdays. Expect a lively, intensely devotional atmosphere with ' +
            'flower and lamp stalls lining the approach.',
        highlights: [
            'The distinctive Rahukala lamp (deepa) offerings',
            'Friday and Tuesday crowds and the bustling market outside',
            'Rahu-Ketu and special pujas the temple is sought out for',
        ],
        gettingThere: {
            metro: 'Banashankari station (Green Line) is close; then a short walk or auto ride.',
            road: 'On Kanakapura Road in Banashankari; easy by bus, auto or cab.',
        },
        entry: 'Free entry. Open roughly 6 am–1 pm and 3:30–9 pm; Rahukala timings vary by day.',
        tips: [
            'It gets extremely crowded on Fridays and during Rahukala — go early on a weekday for calm.',
            'Lamp and flower offerings are sold at stalls right outside the temple.',
            'Keep an eye on belongings in the dense crowd around the sanctum.',
        ],
        maps: 'Banashankari Temple, Bengaluru',
        lat: 12.9255, lng: 77.5468,
        tags: ['heritage', 'family'],
    },
    {
        slug: 'chokkanathaswamy',
        name: 'Chokkanathaswamy Temple',
        category: 'Vishnu temple',
        area: 'Domlur, East Bengaluru',
        bestTime: 'Morning; Vaikuntha Ekadashi and Vishnu festivals',
        tagline: 'Widely regarded as the oldest temple in Bengaluru, of Chola origin.',
        image: 'images/chokkanathaswamy.jpg',
        description:
            'The Chokkanathaswamy temple in Domlur is often called the oldest temple in Bengaluru, with ' +
            'inscriptions dating its origins to around the 10th century and the Chola period, and later ' +
            'work under the Vijayanagara empire. Dedicated to Vishnu (as Chokkanatha or Chokka Perumal), ' +
            'it is a modest but historically important shrine known for its old granite pillars, finely ' +
            'sculpted figures, and Tamil and Kannada inscriptions that record centuries of patronage.',
        highlights: [
            'Among the city\'s oldest surviving shrines, with 10th–16th century roots',
            'The carved granite pillars and Vishnu iconography',
            'Historic Tamil and Kannada inscriptions in the complex',
        ],
        gettingThere: {
            metro: 'Nearest metro is limited; Indiranagar station (Purple Line) plus an auto is easiest.',
            road: 'In Domlur, near the Domlur flyover and old airport road; best reached by auto or cab.',
        },
        entry: 'Free entry. Open roughly 7 am–noon and 5:30–8:30 pm; quieter than the bigger temples.',
        tips: [
            'It is a small neighbourhood temple — a short, unhurried visit for the history and carvings.',
            'Combine with nearby Indiranagar cafes or Ulsoor for a fuller outing.',
            'Ask the priest about the inscriptions if you\'re curious about its age.',
        ],
        maps: 'Chokkanathaswamy Temple, Domlur, Bengaluru',
        lat: 12.9612, lng: 77.6387,
        tags: ['heritage', 'solo'],
    },
];

/*
 * Hidden cafes across Bengaluru's neighbourhoods — independent, lesser-known spots rather than the
 * big chains, in areas like JP Nagar, Jayanagar, Indiranagar and around. Same card + detail pattern,
 * but a cafe model: neighbourhood, what it's known for, the vibe, an overview, what to order, tips,
 * and a Google Maps link. No verified photo per cafe, so cards use a themed tile (see app.js), which
 * keeps things honest — we don't want to attach a wrong or copyrighted image to a real small business.
 */
const CAFES = [
    {
        slug: 'dyu-art-cafe',
        name: 'Dyu Art Café',
        area: 'Koramangala',
        knownFor: 'Art-café in an old bungalow',
        priceHint: '₹₹ · cash & UPI',
        bestTime: 'Weekday afternoon',
        tagline: 'A rustic bungalow art-café with courtyard seating and slow, calm afternoons.',
        image: 'images/cafe-latte.jpg',
        description:
            'One of Bengaluru\'s most-loved hidden cafés, Dyu Art Café is set in an old bungalow with ' +
            'open courtyards, gabled roofs and walls hung with rotating artwork. The mood is unhurried ' +
            'and analogue — low chairs, plants and warm light — which makes it a favourite for reading, ' +
            'sketching or a long, quiet coffee. The food leans comfort-Continental, and the verandah ' +
            'is the seat to grab on a pleasant day.',
        order: ['Filter coffee and cold coffee', 'Sandwiches and the sizzler brownie', 'Whatever cake is fresh that day'],
        tips: [
            'Weekday afternoons are calmest; weekends fill up and the wait can be long.',
            'Seating is limited and cosy — go in a small group rather than a large one.',
            'Carry a book or sketchpad; it is that kind of place. Photography is welcome, but be gentle around the art.',
        ],
        maps: 'Dyu Art Cafe, Koramangala, Bengaluru',
        lat: 12.9349, lng: 77.6156,
        tags: ['date', 'solo', 'work', 'photo'],
    },
    {
        slug: 'matteo-coffea',
        name: 'Matteo Coffea',
        area: 'Church Street / Indiranagar',
        knownFor: 'Warm-wood specialty coffee bar',
        priceHint: '₹₹ · card & UPI',
        bestTime: 'Late morning',
        tagline: 'A warm, wood-lined coffee bar with corner tables made for lingering.',
        image: 'images/cafe-cappuccino.jpg',
        description:
            'Matteo Coffea is a cosy, wood-toned coffee bar that quietly does the basics very well. ' +
            'Small tables and corner nooks make it easy to settle in for a long coffee or a bit of ' +
            'reading, away from the noise of the main strip. It is a dependable specialty-coffee stop ' +
            'that regulars return to precisely because it does not try too hard.',
        order: ['A well-pulled cappuccino or flat white', 'Cold brew on a warm afternoon', 'A croissant or a slice of cake'],
        tips: [
            'Grab a corner table if you want privacy for a long sit.',
            'Late mornings are quietest, before the lunch and evening crowd.',
            'Great as a work or reading stop — pace your order to keep the table.',
        ],
        maps: 'Matteo Coffea, Church Street, Bengaluru',
        lat: 12.9752, lng: 77.6069,
        tags: ['work', 'solo', 'date'],
    },
    {
        slug: 'the-hole-in-the-wall',
        name: 'The Hole in the Wall Café',
        area: 'Koramangala / Sahakar Nagar',
        knownFor: 'All-day breakfast',
        priceHint: '₹₹ · card & UPI',
        bestTime: 'Weekday breakfast',
        tagline: 'A snug, no-frills spot famous for all-day breakfast and big pancakes.',
        image: 'images/food-dosa-sambar.jpg',
        description:
            'A long-running favourite that started small and stayed unpretentious, The Hole in the ' +
            'Wall is best known for its all-day breakfast — pancakes, waffles, big skillets and ' +
            'generous plates. It is compact and often busy, with a homely, student-friendly feel and ' +
            'portions that punch above the bill. Come hungry.',
        order: ['Stuffed pancakes or waffles', 'The breakfast skillet', 'A big mug of hot chocolate'],
        tips: [
            'Go on a weekday morning to skip the notorious weekend brunch wait.',
            'Portions are large — share if you want to try more than one thing.',
            'Seating is tight; small groups fare best.',
        ],
        maps: 'The Hole in the Wall Cafe, Koramangala, Bengaluru',
        lat: 12.9346, lng: 77.6205,
        tags: ['groups', 'family', 'budget'],
    },
    {
        slug: 'third-wave-jayanagar',
        name: 'Third Wave Coffee (Jayanagar)',
        area: 'Jayanagar',
        knownFor: 'Neighbourhood specialty roaster',
        priceHint: '₹₹ · card & UPI',
        bestTime: 'Morning',
        tagline: 'A laid-back Jayanagar roaster corner for a serious cup close to home.',
        image: 'images/cafe-beans.jpg',
        description:
            'Away from the busier Indiranagar and CBD outlets, the Jayanagar corner of this homegrown ' +
            'specialty roaster is an easy neighbourhood spot for a properly made coffee. Minimal decor, ' +
            'comfortable seating and reliable brews make it a calm morning stop or a low-key work ' +
            'perch in the leafy south of the city.',
        order: ['Single-origin pour-over or a cappuccino', 'Their cold coffee / cold brew', 'A cookie or a small bake'],
        tips: [
            'Mornings are the calmest; it picks up later in the day.',
            'Ask what single-origin is on — the pour-over is worth it.',
            'A good work or catch-up spot in south Bengaluru, away from the busier branches.',
        ],
        maps: 'Third Wave Coffee, Jayanagar, Bengaluru',
        lat: 12.9250, lng: 77.5938,
        tags: ['work', 'solo'],
    },
    {
        slug: 'roastery-coffee-house',
        name: 'Roastery Coffee House',
        area: 'Bellandur / Koramangala',
        knownFor: 'Sunlit specialty coffee',
        priceHint: '₹₹ · card & UPI',
        bestTime: 'Morning to early afternoon',
        tagline: 'An airy, plant-filled coffee house built around single-origin brews.',
        image: 'images/cafe-coffee.jpg',
        description:
            'Roastery Coffee House is a bright, plant-filled space that takes its coffee seriously, ' +
            'with a menu built around single-origin beans and a range of brew methods. The high ' +
            'ceilings and daylight make it feel calm and open, and it is as good for a slow solo ' +
            'coffee as for a quiet catch-up. A solid pick for anyone who wants to taste the difference ' +
            'between origins.',
        order: ['A pour-over or AeroPress of the featured single origin', 'Signature cold coffee', 'Avocado toast or a bake'],
        tips: [
            'Come in daylight hours to enjoy the airy, sunlit room at its best.',
            'Tell the barista how you like your coffee — they will guide you to a bean.',
            'Weekday mornings are the quietest for a work session.',
        ],
        maps: 'Roastery Coffee House, Bengaluru',
        lat: 12.9279, lng: 77.6271,
        tags: ['work', 'solo', 'date'],
    },
    {
        slug: 'ela-matcha',
        name: 'Ela Matcha',
        area: 'Indiranagar',
        knownFor: 'Matcha-forward tea room',
        priceHint: '₹₹ · card & UPI',
        bestTime: 'Afternoon',
        tagline: 'A minimalist, matcha-first room inspired by a Kerala tea shop.',
        image: 'images/cafe-matcha.jpg',
        description:
            'Ela Matcha is a small, minimalist café in Indiranagar built around matcha and slow, ' +
            'intentional sipping. Its design nods to a Kerala tea shop, tying into the meaning of its ' +
            'name, and the menu is matcha-forward rather than coffee-first — a refreshing change of ' +
            'pace among the city\'s coffee bars. It is a calm, unhurried spot for an afternoon break.',
        order: ['Classic iced or hot matcha latte', 'A matcha dessert or bake', 'Try it with an alternative milk'],
        tips: [
            'If you are new to matcha, ask for a lighter, sweeter version to start.',
            'It is small and quiet — ideal for a solo break rather than a big group.',
            'Afternoons suit the mood of the place best.',
        ],
        maps: 'Ela Matcha, Indiranagar, Bengaluru',
        lat: 12.9718, lng: 77.6412,
        tags: ['solo', 'date', 'photo'],
    },
];

/*
 * Authentic eats — Bengaluru's legendary, decades-old food institutions: the tiffin rooms, the
 * benne-dosa joints and the colonial-era cafes locals grew up on. Same card + detail pattern as the
 * cafes (monogram tile, no per-place photo, honest and copyright-safe), but an institution model:
 * the year it started, what to order, the story behind it, tips, and a Google Maps link.
 * Route: #/eat/<slug>.
 */
const EATERIES = [
    {
        slug: 'mtr',
        name: 'MTR (Mavalli Tiffin Rooms)',
        area: 'Lalbagh Road',
        since: 1924,
        signature: 'Rava idli & masala dosa',
        priceHint: '₹₹ · veg',
        tagline: 'The tiffin room that invented rava idli — old-school South Indian breakfast.',
        image: 'images/eat-mtr.jpg',
        description:
            'Mavalli Tiffin Rooms, universally MTR, is arguably Bengaluru\'s most famous eating house. ' +
            'Founded in 1924 near Lalbagh, it is the place credited with inventing the rava idli during ' +
            'World War II rice shortages. Little has changed over the decades — the same kitchen, the ' +
            'same unhurried service, and a set of classics done with rare consistency. It is a piece ' +
            'of living Bengaluru history as much as a meal.',
        mustTry: ['Rava idli (invented here)', 'Masala dosa with a mound of butter', 'Filter coffee', 'The full Sunday breakfast'],
        tips: [
            'Come early, especially on weekends — the wait for a table can be long by mid-morning.',
            'It is pure vegetarian and cash/UPI friendly; go hungry, portions are hearty.',
            'The Lalbagh Road original is the one to visit for the full heritage experience.',
        ],
        maps: 'MTR Mavalli Tiffin Rooms, Lalbagh Road, Bengaluru',
        lat: 12.9548, lng: 77.5848,
        veg: 'veg',
        tags: ['family', 'heritage', 'quick'],
    },
    {
        slug: 'vidyarthi-bhavan',
        name: 'Vidyarthi Bhavan',
        area: 'Gandhi Bazaar, Basavanagudi',
        since: 1943,
        signature: 'Masala dosa',
        priceHint: '₹ · veg',
        tagline: 'A dosa temple since 1943, in the old lanes of Gandhi Bazaar.',
        image: 'images/food-masala-dosa.jpg',
        description:
            'Founded in 1943 to feed students around Basavanagudi\'s colleges, Vidyarthi Bhavan has ' +
            'become a heritage food landmark famous for one thing above all: its crisp, ghee-roasted ' +
            'masala dosa, browned dark and served fast in a cramped, wood-panelled hall. Long queues, ' +
            'shared tables and waiters weaving through with towers of dosas are all part of the ritual.',
        mustTry: ['The signature crisp masala dosa', 'Kesari bath (sweet)', 'Strong filter coffee'],
        tips: [
            'Expect a queue, especially on weekends; it moves fast and is worth the wait.',
            'Seating is shared and tight — it is about the food, not lingering.',
            'Cash is handy; go early morning or late afternoon to dodge the peak.',
        ],
        maps: 'Vidyarthi Bhavan, Gandhi Bazaar, Basavanagudi, Bengaluru',
        lat: 12.9438, lng: 77.5731,
        veg: 'veg',
        tags: ['budget', 'quick', 'heritage'],
    },
    {
        slug: 'ctr',
        name: 'CTR (Central Tiffin Room)',
        area: 'Malleswaram',
        since: 1920,
        signature: 'Benne masala dosa',
        priceHint: '₹ · veg',
        tagline: 'Home of the gold-standard benne (butter) masala dosa in Malleswaram.',
        image: 'images/food-masala-dosa-vada.jpg',
        description:
            'CTR, also known as Shri Sagar, is a Malleswaram institution whose benne (butter) masala ' +
            'dosa is considered by many the finest in the city — evenly browned, impossibly crisp and ' +
            'generously buttered. Dating back to the 1920s, it is a small, no-frills joint where the ' +
            'dosa does all the talking, best chased with a strong filter coffee.',
        mustTry: ['Benne masala dosa (the one to get)', 'Kharabath / idli', 'Filter coffee'],
        tips: [
            'Weekend mornings are packed — arrive early or expect to wait outside.',
            'It is small and casual; be ready for shared, quick-turnover seating.',
            'Malleswaram around it is great for a post-dosa walk.',
        ],
        maps: 'CTR Shri Sagar, Malleswaram, Bengaluru',
        lat: 13.0037, lng: 77.5687,
        veg: 'veg',
        tags: ['budget', 'quick', 'heritage'],
    },
    {
        slug: 'koshys',
        name: 'Koshy\'s',
        area: 'St. Mark\'s Road',
        since: 1940,
        signature: 'Breakfast & roast chicken',
        priceHint: '₹₹ · veg & non-veg',
        tagline: 'The colonial-era cafe where old Bengaluru still gathers over coffee.',
        image: 'images/food-south-indian.jpg',
        description:
            'Koshy\'s, on St. Mark\'s Road, began as a bakery around 1940 and grew into a restaurant ' +
            'that became a legendary hangout for writers, journalists, politicians and artists. With ' +
            'its high ceilings, worn wooden chairs and unchanged interiors, it trades in old-school ' +
            'charm and unhurried café culture. Come for breakfast, coffee and long conversations rather ' +
            'than anything fancy.',
        mustTry: ['Breakfast spread and mutton cutlets', 'Roast chicken', 'Coffee, and just soaking in the room'],
        tips: [
            'It is as much about the atmosphere as the food — settle in, don\'t rush.',
            'Serves both veg and non-veg; the mood is relaxed and conversational.',
            'Central location near MG Road / Cubbon Park makes it an easy add-on.',
        ],
        maps: 'Koshy\'s, St Marks Road, Bengaluru',
        lat: 12.9727, lng: 77.5990,
        veg: 'veg & non-veg',
        tags: ['groups', 'heritage', 'date'],
    },
    {
        slug: 'airlines-hotel',
        name: 'Airlines Hotel',
        area: 'Lavelle Road',
        since: 1969,
        signature: 'Filter coffee under the trees',
        priceHint: '₹₹ · veg',
        tagline: 'Bengaluru\'s classic open-air drive-in — coffee and dosas under old trees.',
        image: 'images/cafe-coffee.jpg',
        description:
            'Airlines Hotel on Lavelle Road is a beloved open-air, drive-in restaurant where you sit ' +
            'under a canopy of old rain trees with a tumbler of filter coffee. Long a Bengaluru ' +
            'institution, its garden setting, unhurried pace and dependable South Indian fare make it ' +
            'a favourite for morning coffee, a plate of dosas, or simply passing a slow hour outdoors ' +
            'in the middle of the city.',
        mustTry: ['Filter coffee under the trees', 'Masala dosa and idli-vada', 'A leisurely open-air breakfast'],
        tips: [
            'The charm is the garden seating — go when the weather is pleasant.',
            'Mornings are the nicest and least crowded.',
            'It is pure vegetarian; expect a relaxed, no-rush vibe.',
        ],
        maps: 'Airlines Hotel, Lavelle Road, Bengaluru',
        lat: 12.9714, lng: 77.5969,
        veg: 'veg',
        tags: ['family', 'date', 'heritage'],
    },
    {
        slug: 'brahmins-coffee-bar',
        name: 'Brahmin\'s Coffee Bar',
        area: 'Basavanagudi',
        since: 1965,
        signature: 'Idli-vada & chutney',
        priceHint: '₹ · veg',
        tagline: 'A tiny counter legend for soft idlis and a chutney people crave.',
        image: 'images/food-idli-vada.jpg',
        description:
            'Brahmin\'s Coffee Bar is a tiny, standing-room Basavanagudi institution that has done a ' +
            'short, perfect menu since the 1960s: pillow-soft idlis, crisp vadas, khara bath and a ' +
            'coconut chutney locals rave about, plus strong filter coffee. There is no dosa and barely ' +
            'any seating — just a fast-moving counter and a queue that speaks for itself.',
        mustTry: ['Idli-vada with the famous chutney', 'Khara bath / kesari bath', 'Filter coffee'],
        tips: [
            'Menu is tiny and there is no dosa — come for the idli, vada and chutney.',
            'It is largely stand-and-eat with a queue; it moves quickly.',
            'Closes by early afternoon and stays busy — go in the morning.',
        ],
        maps: 'Brahmins Coffee Bar, Basavanagudi, Bengaluru',
        lat: 12.9432, lng: 77.5698,
        veg: 'veg',
        tags: ['budget', 'quick', 'heritage'],
    },
];

/*
 * Things to do — popular hands-on experiences and activities around Bengaluru: creative workshops,
 * cooking classes and outdoor adventures. Same card + detail pattern (image with monogram fallback),
 * with an activity model: category, area, typical duration, an overview, what you'll actually do,
 * tips, and a Google Maps link. These point to the kind of place/experience rather than endorsing
 * one specific operator; search locally for current studios, timings and bookings. Route: #/do/<slug>.
 */
const ACTIVITIES = [
    {
        slug: 'pottery-class',
        name: 'Pottery & wheel-throwing',
        category: 'Creative',
        area: 'Indiranagar & studios citywide',
        duration: '2–3 hours',
        priceHint: 'Beginner-friendly',
        tagline: 'Get your hands muddy at a beginner pottery wheel and hand-building class.',
        image: 'images/act-pottery.jpg',
        description:
            'Pottery has quietly become one of Bengaluru\'s favourite weekend activities, with a wave ' +
            'of studios running beginner-friendly drop-in classes. A typical session mixes hand-' +
            'building and time at the wheel, so you leave with something you actually made. It is ' +
            'calming, tactile and social — no experience needed, just a willingness to get clay under ' +
            'your nails.',
        whatYoullDo: [
            'Learn to centre clay and throw a basic form on the wheel',
            'Try hand-building a pinch pot or small dish',
            'Glaze or decorate, with pieces fired and collected later',
        ],
        tips: [
            'Wear clothes you don\'t mind getting messy and keep nails short.',
            'Beginner slots fill up on weekends — book a class ahead.',
            'Finished pieces need firing, so you usually collect them a week or two later.',
        ],
        maps: 'Pottery studio Indiranagar, Bengaluru',
        tags: ['date', 'solo', 'groups'],
    },
    {
        slug: 'pizza-making',
        name: 'Pizza & pasta making',
        category: 'Culinary',
        area: 'Cafes & cook studios citywide',
        duration: '2–3 hours',
        priceHint: 'All levels',
        tagline: 'Stretch your own dough and pull a wood-fired pizza out of the oven.',
        image: 'images/act-pizza.jpg',
        description:
            'Hands-on cooking classes are a fun, tasty way to spend an afternoon, and Italian ' +
            'sessions — making pizza and fresh pasta from scratch — are among the most popular. You ' +
            'knead and stretch your own dough, build your toppings, and (at the good ones) bake it in ' +
            'a wood-fired oven, then sit down and eat what you made. Great for a date, a group or a ' +
            'birthday.',
        whatYoullDo: [
            'Make and stretch pizza dough from scratch',
            'Build and bake your own pizza, often in a wood-fired oven',
            'Sometimes roll fresh pasta and a simple sauce too',
        ],
        tips: [
            'Come hungry — you eat what you cook at the end.',
            'Good for groups and celebrations; book the whole batch together.',
            'Tell the host about any dietary needs when you book.',
        ],
        maps: 'Pizza making class Bengaluru',
        tags: ['date', 'groups', 'family'],
    },
    {
        slug: 'candle-making',
        name: 'Candle-making workshop',
        category: 'Creative',
        area: 'Workshops citywide',
        duration: '1.5–2 hours',
        priceHint: 'Beginner-friendly',
        tagline: 'A calm, scented afternoon pouring your own custom candles.',
        image: 'images/act-candle.jpg',
        description:
            'Candle-making workshops have taken off as a relaxed, mindful way to unwind. Over a ' +
            'couple of unhurried hours you pick your fragrance, work with the wax and pour your own ' +
            'scented candle to take home. Many sessions weave in a little mindfulness, which makes it ' +
            'a popular solo reset as well as a low-key date or friends\' outing.',
        whatYoullDo: [
            'Choose your fragrance and colour',
            'Melt, blend and pour your own candle',
            'Take your finished candle home the same day',
        ],
        tips: [
            'A relaxed, no-skill-needed activity — good for solo, dates or small groups.',
            'The candle sets during the session, so you usually leave with it.',
            'Check whether materials are included when you book.',
        ],
        maps: 'Candle making workshop Bengaluru',
        tags: ['date', 'solo', 'groups'],
    },
    {
        slug: 'kayaking-ulsoor',
        name: 'Kayaking on the lake',
        category: 'Outdoor',
        area: 'Ulsoor & city lakes',
        duration: '1–2 hours',
        priceHint: 'Basics taught',
        tagline: 'Paddle out on a city lake for an easy dose of water and calm.',
        image: 'images/act-kayak.jpg',
        description:
            'For a quick outdoor reset without leaving the city, kayaking and paddleboarding on ' +
            'Bengaluru\'s lakes is hard to beat. Operators run beginner sessions where the basics are ' +
            'taught before you head out on the water. It is a refreshing morning activity and an easy ' +
            'way to see the city from a calmer angle; some lakes on the outskirts offer longer ' +
            'paddles.',
        whatYoullDo: [
            'Get a short safety and paddling briefing',
            'Kayak or paddleboard around the lake at your own pace',
            'Options for solo or tandem, beginners welcome',
        ],
        tips: [
            'Go early morning for calm water and cooler weather.',
            'Wear quick-dry clothes and carry a change; you may get splashed.',
            'Sessions are weather-dependent — confirm on the day.',
        ],
        maps: 'Kayaking Ulsoor Lake, Bengaluru',
        tags: ['nature', 'solo', 'groups'],
    },
    {
        slug: 'heritage-cycling',
        name: 'Heritage cycling tour',
        category: 'Outdoor',
        area: 'Old Bengaluru & city routes',
        duration: '3–4 hours',
        priceHint: 'Guided',
        tagline: 'Pedal through the old city\'s markets, lanes and landmarks at dawn.',
        image: 'images/act-cycling.jpg',
        description:
            'Early-morning cycling tours are a brilliant way to see the older parts of Bengaluru ' +
            'before the traffic wakes up. Guided rides wind through markets, temples, colonial-era ' +
            'streets and local breakfast stops, mixing history with a bit of exercise. There are also ' +
            'countryside rides toward Nandi Hills for those wanting more distance.',
        whatYoullDo: [
            'Ride a guided route through old-city lanes and landmarks',
            'Stop for chai and a classic local breakfast',
            'Hear the stories behind markets, temples and streets',
        ],
        tips: [
            'Tours start early to beat the traffic and heat — sleep early the night before.',
            'Bikes are usually provided; wear comfortable clothes and closed shoes.',
            'Carry water and sun cover even for a morning ride.',
        ],
        maps: 'Heritage cycling tour Bengaluru',
        tags: ['heritage', 'groups', 'nature'],
    },
    {
        slug: 'go-karting',
        name: 'Go-karting',
        category: 'Adventure',
        area: 'Tracks around the city',
        duration: '1–2 hours',
        priceHint: 'All levels',
        tagline: 'Chase lap times around a track for a quick adrenaline hit.',
        image: 'images/act-gokart.jpg',
        description:
            'When you want something faster-paced, go-karting is one of Bengaluru\'s go-to adrenaline ' +
            'activities. Tracks around the city and outskirts rent karts by the session, with safety ' +
            'gear and a briefing included. It is beginner-friendly but genuinely competitive with ' +
            'friends, which makes it a favourite for groups, birthdays and team outings.',
        whatYoullDo: [
            'Gear up and get a safety and flags briefing',
            'Race timed laps around the track',
            'Compare lap times — great with a group',
        ],
        tips: [
            'Wear closed shoes; long hair should be tied back for safety.',
            'Book a group slot for the most fun and shorter waits.',
            'Outdoor tracks are best in the cooler parts of the day.',
        ],
        maps: 'Go karting track Bengaluru',
        tags: ['groups', 'family'],
    },
];

// Filterable "type" values, with readable labels for the filter bar.
const TYPES = [
    { id: 'all', label: 'All places' },
    { id: 'hills', label: 'Hills' },
    { id: 'beach', label: 'Beaches' },
    { id: 'heritage', label: 'Heritage' },
    { id: 'wildlife', label: 'Wildlife' },
];

/*
 * INTENTS — the "what am I in the mood for?" layer. A small, curated set of vibes users can filter
 * by across cafes, eats, things-to-do and sights. Each item can carry a `tags: []` of these ids;
 * the UI turns them into filter chips. Keeping the vocabulary fixed here keeps filtering meaningful.
 */
const INTENTS = [
    { id: 'work', label: 'Work-friendly', icon: 'fa-laptop' },
    { id: 'date', label: 'Date spot', icon: 'fa-heart' },
    { id: 'family', label: 'Family', icon: 'fa-people-roof' },
    { id: 'solo', label: 'Solo', icon: 'fa-user' },
    { id: 'groups', label: 'Groups', icon: 'fa-users' },
    { id: 'quick', label: 'Quick bite', icon: 'fa-bolt' },
    { id: 'photo', label: 'Photo spot', icon: 'fa-camera' },
    { id: 'budget', label: 'Budget', icon: 'fa-indian-rupee-sign' },
    { id: 'nature', label: 'Nature', icon: 'fa-tree' },
    { id: 'heritage', label: 'Heritage', icon: 'fa-landmark' },
];

/*
 * PHRASES — a tiny Kannada phrasebook (the "Lingo Help" locals' guides tend to ship). Grouped for a
 * simple tabbed helper: greetings, getting around (autos/directions) and food ordering. Romanised so
 * a visitor can read it aloud; kn is the Kannada script for showing a local.
 */
const PHRASES = [
    {
        group: 'Basics',
        items: [
            { en: 'Hello / greetings', roman: 'Namaskāra', kn: 'ನಮಸ್ಕಾರ' },
            { en: 'Thank you', roman: 'Dhanyavādagalu', kn: 'ಧನ್ಯವಾದಗಳು' },
            { en: 'Yes', roman: 'Haudu', kn: 'ಹೌದು' },
            { en: 'No', roman: 'Illa', kn: 'ಇಲ್ಲ' },
            { en: 'How much?', roman: 'Eshtu?', kn: 'ಎಷ್ಟು?' },
            { en: 'I don\'t understand', roman: 'Nanage artha āgalilla', kn: 'ನನಗೆ ಅರ್ಥ ಆಗಲಿಲ್ಲ' },
        ],
    },
    {
        group: 'Getting around',
        items: [
            { en: 'Where is...?', roman: '...elli ide?', kn: '...ಎಲ್ಲಿ ಇದೆ?' },
            { en: 'Go straight', roman: 'Nēra hōgi', kn: 'ನೇರ ಹೋಗಿ' },
            { en: 'Turn left', roman: 'Edakke tirugi', kn: 'ಎಡಕ್ಕೆ ತಿರುಗಿ' },
            { en: 'Turn right', roman: 'Balakke tirugi', kn: 'ಬಲಕ್ಕೆ ತಿರುಗಿ' },
            { en: 'Stop here', roman: 'Illi nilḷisi', kn: 'ಇಲ್ಲಿ ನಿಲ್ಲಿಸಿ' },
            { en: 'Please use the meter', roman: 'Meter hāki', kn: 'ಮೀಟರ್ ಹಾಕಿ' },
        ],
    },
    {
        group: 'Food',
        items: [
            { en: 'Water, please', roman: 'Nīru kodi', kn: 'ನೀರು ಕೊಡಿ' },
            { en: 'One coffee', roman: 'Ondu kāfi', kn: 'ಒಂದು ಕಾಫಿ' },
            { en: 'Not spicy', roman: 'Khāra beda', kn: 'ಖಾರ ಬೇಡ' },
            { en: 'Very tasty', roman: 'Tumbā ruchi', kn: 'ತುಂಬಾ ರುಚಿ' },
            { en: 'The bill, please', roman: 'Bill kodi', kn: 'ಬಿಲ್ ಕೊಡಿ' },
            { en: 'Vegetarian only', roman: 'Veg maatra', kn: 'ವೆಜ್ ಮಾತ್ರ' },
        ],
    },
];
