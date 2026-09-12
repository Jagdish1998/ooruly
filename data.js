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
