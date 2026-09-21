/**
 * Content system for In Drive Tours.
 *
 * Structured data for vehicles, services, locations and routes.
 * Page templates consume these types so new SEO pages can be added
 * by adding data — not by duplicating components.
 */

export type Faq = { question: string; answer: string };

export type Vehicle = {
  slug: string;
  name: string;
  tagline: string;
  capacity: string;
  luggage: string;
  description: string;
  image: string;
  alt: string;
  features: string[];
  bestFor: string;
};

export const VEHICLES: Vehicle[] = [
  {
    slug: "sedan",
    name: "Sedan",
    tagline: "Comfortable cars for small groups",
    capacity: "1–4 passengers",
    luggage: "2–3 medium bags",
    description:
      "A practical choice for couples, small families and airport runs. Easy to arrange for local trips around Wayanad and nearby outstation travel.",
    image: "/images/taxi-sedan.jpg",
    alt: "White sedan taxi driving on a green hill road in Wayanad",
    features: ["Air conditioning", "City & highway friendly", "Good for airport pickups"],
    bestFor: "Couples, solo travellers and small families",
  },
  {
    slug: "ertiga-suv",
    name: "Ertiga / SUV",
    tagline: "Extra seats and luggage space",
    capacity: "4–7 passengers",
    luggage: "3–4 medium bags",
    description:
      "Six and seven-seater options such as the Ertiga and similar SUVs — a good middle ground when a sedan feels too small for your group and luggage.",
    image: "/images/suv-ertiga.jpg",
    alt: "SUV cab on a mountain road surrounded by Wayanad greenery",
    features: ["6–7 seater options", "More luggage room", "Higher seating for hill roads"],
    bestFor: "Families of 5–7 and airport trips with extra luggage",
  },
  {
    slug: "innova",
    name: "Innova",
    tagline: "The trusted long-distance cab",
    capacity: "5–7 passengers",
    luggage: "4–5 medium bags",
    description:
      "A popular pick for Wayanad sightseeing days and longer outstation journeys. Spacious, comfortable over ghat roads, and well suited to families.",
    image: "/images/innova.jpg",
    alt: "White Innova cab parked at a scenic viewpoint in Wayanad",
    features: ["Spacious cabin", "Comfortable on ghat roads", "Family favourite"],
    bestFor: "Sightseeing days and outstation trips",
  },
  {
    slug: "innova-crysta",
    name: "Innova Crysta",
    tagline: "A more premium cabin",
    capacity: "5–7 passengers",
    luggage: "4–5 medium bags",
    description:
      "Choose the Crysta when comfort matters most — resort transfers, special occasions and long highway journeys with a quieter, plusher ride.",
    image: "/images/innova-crysta.jpg",
    alt: "Premium Innova Crysta cab on a road through Wayanad tea gardens",
    features: ["Premium interiors", "Captain-seat comfort", "Ideal for long journeys"],
    bestFor: "Resort transfers and premium travel",
  },
  {
    slug: "tempo-traveller",
    name: "Tempo Traveller",
    tagline: "Group travel made easy",
    capacity: "9–17 passengers",
    luggage: "Large luggage space",
    description:
      "The go-to vehicle for family functions, friend groups and tour parties travelling together in one vehicle across Wayanad.",
    image: "/images/tempo-traveller.jpg",
    alt: "White Tempo Traveller minibus on a scenic ghat road in Wayanad",
    features: ["9 to 17 seater options", "Push-back seats", "One vehicle for the whole group"],
    bestFor: "Family groups, tours and events",
  },
  {
    slug: "urbania",
    name: "Urbania",
    tagline: "Premium group travel",
    capacity: "Group seating",
    luggage: "Generous luggage room",
    description:
      "A modern, premium van for groups that want extra comfort — corporate offsites, weddings and resort transfers with a touch more class.",
    image: "/images/urbania.jpg",
    alt: "Modern premium Urbania van driving through Wayanad tea estates",
    features: ["Modern premium van", "Comfortable group seating", "Great for events"],
    bestFor: "Corporate groups and weddings",
  },
  {
    slug: "mini-bus",
    name: "Mini Bus",
    tagline: "For larger groups",
    capacity: "Larger groups",
    luggage: "Large luggage hold",
    description:
      "When a Tempo Traveller isn't enough, a mini bus keeps bigger groups together — school trips, pilgrim groups and company outings.",
    image: "/images/mini-bus.jpg",
    alt: "White mini bus for group transportation on a Kerala highway",
    features: ["Keeps big groups together", "Ample luggage hold", "Good for day trips"],
    bestFor: "Schools, pilgrim and office groups",
  },
  {
    slug: "bus",
    name: "Bus",
    tagline: "Large groups and events",
    capacity: "Large groups",
    luggage: "Full-size luggage space",
    description:
      "Full-size buses for the biggest movements — weddings, conferences and multi-day tour programmes across Wayanad and Kerala.",
    image: "/images/bus.jpg",
    alt: "Tourist bus on a highway through green hills in Kerala",
    features: ["Full-size seating", "Multi-day programmes", "Event logistics support"],
    bestFor: "Weddings, conferences and tours",
  },
];

export const vehicleBySlug = (slug: string): Vehicle | undefined =>
  VEHICLES.find((v) => v.slug === slug);

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export type Service = {
  slug: string;
  name: string;
  short: string;
  description: string;
  longDescription: string[];
  image: string;
  alt: string;
  href: string;
  points: string[];
  faqs: Faq[];
};

export const SERVICES: Service[] = [
  {
    slug: "wayanad-taxi",
    name: "Wayanad Taxi",
    short: "Local and outstation cab services.",
    description:
      "Private taxis for local Wayanad trips and outstation journeys — arranged around your schedule, pickup point and group size.",
    longDescription: [
      "Getting around Wayanad is easiest with a private taxi. Public transport between tourist spots is limited, and many of the best places — waterfalls, viewpoints and estates — sit a drive away from the main towns. A local taxi lets you plan the day your way.",
      "Share your pickup point, destination and travel date, and we will help arrange a suitable vehicle — from sedans for couples to Innova and Tempo Traveller options for families and groups. Availability and pricing are confirmed with you on WhatsApp before the trip.",
    ],
    image: "/images/taxi-sedan.jpg",
    alt: "Taxi cab service on a hill road in Wayanad, Kerala",
    href: "/wayanad-taxi/",
    points: ["Local Wayanad trips", "Outstation journeys", "Sedans, SUVs & Innova options"],
    faqs: [
      {
        question: "How can I book a taxi in Wayanad?",
        answer:
          "Choose your service on this website, share your name, WhatsApp number and trip details, and continue the enquiry on WhatsApp. Our team will check vehicle availability and confirm the trip with you.",
      },
      {
        question: "Which vehicle should I choose for local Wayanad trips?",
        answer:
          "Couples and small families usually go with a sedan. For 5–7 passengers or extra luggage, an Ertiga, SUV or Innova is more comfortable. For bigger groups, consider a Tempo Traveller.",
      },
      {
        question: "Can I book a taxi for multiple days in Wayanad?",
        answer:
          "Yes. Share your full itinerary — pickup points, sightseeing days and drop location — and we will help arrange a vehicle for the complete trip, subject to availability.",
      },
    ],
  },
  {
    slug: "airport-transfers",
    name: "Airport Transfers",
    short: "Calicut and Kannur airport transfers.",
    description:
      "Private pickups and drops between Wayanad and the nearest airports — timed around your flight, with room for your luggage.",
    longDescription: [
      "Wayanad's nearest airports are Calicut International Airport (Kozhikode) and Kannur International Airport. The drive between the airport and most Wayanad towns takes around two and a half to three and a half hours, depending on your destination and traffic through the ghat roads.",
      "Airport transfers work best when they are pre-arranged: share your flight date, pickup point and group size, and we will help line up a suitable vehicle. Early-morning and late-night arrivals can be accommodated subject to vehicle availability.",
    ],
    image: "/images/airport.jpg",
    alt: "Airport transfer highway at dawn for Wayanad taxi pickups",
    href: "/airport-transfers/",
    points: ["Calicut Airport (CCJ)", "Kannur Airport (CNN)", "Flight-timed pickups"],
    faqs: [
      {
        question: "Do you provide Calicut Airport transfers to Wayanad?",
        answer:
          "Yes, we arrange airport transfer enquiries between Calicut International Airport and destinations across Wayanad, including Kalpetta, Vythiri and Meppadi.",
      },
      {
        question: "How long is the drive from Calicut Airport to Wayanad?",
        answer:
          "It typically takes around two and a half to three and a half hours depending on your exact destination in Wayanad, the route and traffic through the ghat section.",
      },
      {
        question: "Can I get a pickup for a late-night or early-morning flight?",
        answer:
          "Yes, subject to vehicle availability. Share your flight timing in advance so the pickup can be planned properly.",
      },
    ],
  },
  {
    slug: "wayanad-sightseeing",
    name: "Wayanad Sightseeing",
    short: "Full-day and custom sightseeing trips.",
    description:
      "Spend the day visiting lakes, waterfalls, viewpoints and estates with a private vehicle and a flexible plan.",
    longDescription: [
      "Wayanad's attractions are spread out — Pookode Lake and Lakkidi near Vythiri, Edakkal Caves near Ambalavayal, Soochipara Falls near Meppadi, and the wildlife sanctuaries toward Muthanga and Tholpetty. A private sightseeing vehicle lets you combine nearby spots into one comfortable day.",
      "Tell us where you are staying and what you'd like to see, and we will help arrange a vehicle for the day. You set the pace; the plan can be adjusted around opening times, weather and how much walking your group is up for.",
    ],
    image: "/images/sightseeing.jpg",
    alt: "Waterfall in lush green forest — Wayanad sightseeing trip",
    href: "/wayanad-sightseeing/",
    points: ["Lakes & waterfalls", "Viewpoints & estates", "Flexible day plans"],
    faqs: [
      {
        question: "Do you provide Wayanad sightseeing taxis?",
        answer:
          "Yes. Sightseeing enquiries can be submitted through the website and confirmed through WhatsApp, with the vehicle and plan arranged around your stay and interests.",
      },
      {
        question: "How many places can we cover in one sightseeing day?",
        answer:
          "Most groups comfortably cover two to four nearby spots in a day, depending on distances, walking involved and opening times. Spots far apart — for example Meppadi and Mananthavady sides — are better split across days.",
      },
      {
        question: "Which vehicle is best for sightseeing with family?",
        answer:
          "Families of up to 4 usually take a sedan; 5–7 passengers are more comfortable in an Ertiga, SUV or Innova. Larger families and groups can enquire about a Tempo Traveller.",
      },
    ],
  },
  {
    slug: "tempo-traveller",
    name: "Tempo Traveller",
    short: "Group transportation for families and groups.",
    description:
      "9 to 17-seater Tempo Travellers for family functions, friend groups and tour parties travelling together.",
    longDescription: [
      "When the group outgrows cars, a Tempo Traveller keeps everyone in one vehicle — simpler coordination, shared luggage space and the whole group arriving together. It is a common choice for family events, weddings and Wayanad tour programmes.",
      "Share your group size, travel dates and route, and we will check availability for a suitable seating layout. For premium requirements, you can also enquire about the Urbania.",
    ],
    image: "/images/tempo-traveller.jpg",
    alt: "Tempo Traveller rental in Wayanad for group transportation",
    href: "/tempo-traveller/",
    points: ["9–17 seater options", "Family events & tours", "Single-vehicle coordination"],
    faqs: [
      {
        question: "Can I book a Tempo Traveller in Wayanad?",
        answer:
          "Yes, depending on vehicle availability. Submit your group size, dates and route through the website or WhatsApp, and our team will confirm.",
      },
      {
        question: "How many people fit in a Tempo Traveller?",
        answer:
          "Common layouts seat 9 to 17 passengers. Tell us your group size and luggage needs so we can help match a suitable layout.",
      },
      {
        question: "Can we take a Tempo Traveller for outstation trips from Wayanad?",
        answer:
          "Yes. Outstation trips can be arranged subject to availability — share your route and dates for confirmation.",
      },
    ],
  },
  {
    slug: "bus-rental",
    name: "Bus Rental",
    short: "Mini buses and buses for larger groups.",
    description:
      "Mini buses and full-size buses for weddings, school trips, pilgrim groups and corporate movements.",
    longDescription: [
      "Large movements need planning — vehicle size, pickup sequencing, parking and timing all matter. Mini buses suit medium groups, while full-size buses handle weddings, conferences and multi-day tour programmes.",
      "Share your group size, dates, pickup points and programme schedule, and we will help work out a workable vehicle plan, subject to availability.",
    ],
    image: "/images/bus.jpg",
    alt: "Bus rental in Wayanad for weddings and large group transportation",
    href: "/bus-rental/",
    points: ["Mini buses & full buses", "Weddings & events", "Multi-day programmes"],
    faqs: [
      {
        question: "Can I book transportation for a large group?",
        answer:
          "Yes. Enquire about Tempo Travellers, Urbania, mini buses or buses depending on your group size, and our team will confirm availability on WhatsApp.",
      },
      {
        question: "Do you arrange buses for weddings in Wayanad?",
        answer:
          "Yes, subject to availability. Share the event dates, pickup points and guest count so the vehicle plan can be worked out in advance.",
      },
      {
        question: "How early should large groups enquire?",
        answer:
          "As early as possible — especially for weekends, holidays and wedding season — since larger vehicles get committed first.",
      },
    ],
  },
  {
    slug: "resort-transfers",
    name: "Resort Transfers",
    short: "Comfortable pickup and drop to Wayanad resorts.",
    description:
      "Door-to-door pickups and drops to Wayanad's resorts and homestays — from the airport, railway station or your home town.",
    longDescription: [
      "Many Wayanad resorts sit inside estates or off the main roads, where finding a last-minute cab can be difficult — especially late in the evening. A pre-arranged resort transfer means a vehicle is already planned for your arrival and departure.",
      "Share your resort name, check-in date and group size, and we will help arrange a comfortable vehicle. Innova and Crysta options are popular for resort transfers.",
    ],
    image: "/images/resort.jpg",
    alt: "Resort transfer in Wayanad — cab pickup at a Kerala resort",
    href: "/resort-transfers/",
    points: ["Airport–resort transfers", "Estate & homestay pickups", "Innova & Crysta options"],
    faqs: [
      {
        question: "Do you pick up from resorts inside estates?",
        answer:
          "Yes, subject to road access and availability. Share the resort name and location pin so the pickup can be planned accurately.",
      },
      {
        question: "Can you arrange both arrival and departure transfers?",
        answer:
          "Yes. Share both dates and timings together so the vehicle plan covers your full stay.",
      },
      {
        question: "Which vehicle is best for a resort transfer?",
        answer:
          "Couples often choose a sedan; families and groups with more luggage usually prefer an Ertiga, SUV, Innova or Crysta.",
      },
    ],
  },
];

export const serviceBySlug = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

/* ------------------------------------------------------------------ */
/* Sightseeing spots                                                   */
/* ------------------------------------------------------------------ */

export type Spot = { name: string; area: string; note: string };

export const SPOTS: Spot[] = [
  { name: "Pookode Lake", area: "Vythiri", note: "Easy lakeside walks and boating, good for all ages." },
  { name: "Lakkidi Viewpoint", area: "Vythiri", note: "Ghat-top views, often wrapped in mist." },
  { name: "Soochipara Falls", area: "Meppadi", note: "A forest waterfall with a short trek down." },
  { name: "Kanthapara Falls", area: "Meppadi", note: "A quieter falls, easy to pair with Soochipara." },
  { name: "Edakkal Caves", area: "Ambalavayal", note: "Ancient rock carvings with a climb up." },
  { name: "Banasura Sagar Dam", area: "Padinjarathara", note: "India's largest earth dam, boating below the hills." },
  { name: "900 Kandi", area: "Meppadi", note: "Glass bridge and valley views above the estates." },
  { name: "Kuruva Island", area: "Mananthavady", note: "River-island bamboo trails (seasonal entry)." },
  { name: "Wayanad Wildlife Sanctuary", area: "Muthanga / Tholpetty", note: "Forest jeep safaris run by the forest department." },
];

/* ------------------------------------------------------------------ */
/* Locations                                                           */
/* ------------------------------------------------------------------ */

export type LocationInfo = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  heroAlt: string;
  intro: string[];
  areasServed: string[];
  transportNote: string;
  airportNote: string;
  sightseeingNote: string;
  spots: { name: string; note: string }[];
  relatedLocations: string[];
  relatedRoutes: string[];
  faqs: Faq[];
};

export const LOCATIONS: LocationInfo[] = [
  {
    slug: "kalpetta",
    name: "Kalpetta",
    metaTitle: "Kalpetta Taxi & Cab Service | In Drive Tours",
    metaDescription:
      "Book taxis and cabs in Kalpetta, Wayanad — local trips, airport transfers, sightseeing cars and group vehicles. Enquire on WhatsApp for availability and pricing.",
    heroImage: "/images/hero.jpg",
    heroAlt: "Misty Wayanad hills near Kalpetta with a winding road",
    intro: [
      "Kalpetta is Wayanad's district headquarters and its most central base for getting around. Staying here puts you within easy reach of both the Vythiri side (Pookode Lake, Lakkidi) and the Meppadi side (Soochipara Falls, 900 Kandi) — which is why many visitors plan their sightseeing days from Kalpetta.",
      "It is also the town where picking up a pre-arranged vehicle is simplest: clear pickup points, straightforward parking, and quick exits toward every part of the district. Share your hotel location and trip plan, and a suitable vehicle can be arranged from Kalpetta.",
    ],
    areasServed: ["Kalpetta town", "Munderi", "Kainatty", "Nalloornad", "Muttil side", "Karapuzha side"],
    transportNote:
      "Kalpetta works as a transit hub — taxis are commonly arranged here for day trips to Vythiri, Meppadi, Ambalavayal and Sulthan Bathery, as well as for onward journeys to Calicut, Mysore and Bangalore.",
    airportNote:
      "Airport transfers from Kalpetta usually run via the Thamarassery ghat to Calicut Airport, or via Mananthavady–Nedumpoyil to Kannur Airport. The drive typically takes around two and a half to three and a half hours depending on the airport, route and traffic.",
    sightseeingNote:
      "Popular day combinations from Kalpetta include Pookode Lake with Lakkidi Viewpoint, Soochipara Falls with Kanthapara Falls, and Edakkal Caves with the Ambalavayal Heritage Museum.",
    spots: [
      { name: "Karapuzha Dam", note: "Close to town — gardens, views and boating." },
      { name: "Pookode Lake", note: "An easy half-day trip toward Vythiri." },
      { name: "Chembra Peak base", note: "Trek permissions via Meppadi side." },
    ],
    relatedLocations: ["muttil", "vythiri", "meppadi", "ambalavayal"],
    relatedRoutes: ["calicut-airport-to-kalpetta", "kannur-airport-to-wayanad", "mysore-to-wayanad"],
    faqs: [
      {
        question: "Can I book a Kalpetta taxi for Wayanad sightseeing?",
        answer:
          "Yes. Kalpetta is a central base for sightseeing days to Vythiri, Meppadi and Ambalavayal sides. Share your hotel location and the places you want to visit, and a vehicle can be arranged subject to availability.",
      },
      {
        question: "Do you arrange pickups from Kalpetta hotels and homestays?",
        answer:
          "Yes. Share your hotel name, check-in details and trip plan on WhatsApp so the pickup can be arranged accurately.",
      },
      {
        question: "How do I reach Kalpetta from Calicut Airport?",
        answer:
          "The usual route is via Thamarassery ghat road. Airport transfer enquiries between Calicut Airport and Kalpetta can be submitted through the website and confirmed on WhatsApp.",
      },
    ],
  },
  {
    slug: "vythiri",
    name: "Vythiri",
    metaTitle: "Vythiri Taxi & Cab Service | In Drive Tours",
    metaDescription:
      "Vythiri taxi and cab booking for resorts, Pookode Lake, Lakkidi and airport transfers. Share your trip on WhatsApp and we'll help arrange the right vehicle.",
    heroImage: "/images/lake.jpg",
    heroAlt: "Serene lake surrounded by misty hills near Vythiri, Wayanad",
    intro: [
      "Vythiri is Wayanad's resort country — misty hills, rainforest patches and some of the district's best-known places to stay. Most visitors come here to slow down: Pookode Lake in the morning, Lakkidi Viewpoint when the mist lifts, and evenings back at the resort.",
      "Because many Vythiri resorts sit inside estates off the main road, pre-arranged pickups work far better than finding a cab at the last minute. Share your resort name and dates, and a vehicle can be planned for your arrival, sightseeing days and departure.",
    ],
    areasServed: ["Vythiri town", "Lakkidi", "Pookode", "Achoor", "Chundale side", "Pozhuthana side"],
    transportNote:
      "Vythiri is the first major Wayanad town after climbing the Thamarassery ghat from Calicut side, so taxis are commonly arranged here for arrivals, resort transfers and short sightseeing loops.",
    airportNote:
      "Vythiri is the closest major Wayanad halt to Calicut Airport, usually reached via the Thamarassery ghat in around two to three hours depending on traffic. Kannur Airport transfers run via the northern ghat route.",
    sightseeingNote:
      "Easy sightseeing from Vythiri includes Pookode Lake, Lakkidi Viewpoint, the Chain Tree and nearby tea estates — all combinable into a relaxed single day.",
    spots: [
      { name: "Pookode Lake", note: "Boating and lakeside walks, minutes away." },
      { name: "Lakkidi Viewpoint", note: "Ghat-top mist views above Vythiri." },
      { name: "Chain Tree", note: "A quick roadside stop with local legend." },
    ],
    relatedLocations: ["kalpetta", "meppadi", "muttil", "ambalavayal"],
    relatedRoutes: ["calicut-airport-to-vythiri", "calicut-airport-to-wayanad", "bangalore-to-wayanad"],
    faqs: [
      {
        question: "Can I book a taxi from my Vythiri resort?",
        answer:
          "Yes. Share your resort name, location and trip plan — many Vythiri resorts are inside estates, so advance booking helps plan the pickup properly.",
      },
      {
        question: "Is Vythiri a good base for Wayanad sightseeing?",
        answer:
          "Yes for the Vythiri–Kalpetta circuit (Pookode, Lakkidi, Karapuzha). For Edakkal Caves or the sanctuaries, plan a longer day or split your stay.",
      },
      {
        question: "How far is Vythiri from Calicut Airport?",
        answer:
          "The drive is typically around two to three hours via the Thamarassery ghat, depending on traffic. Airport transfer enquiries can be submitted through the website.",
      },
    ],
  },
  {
    slug: "meppadi",
    name: "Meppadi",
    metaTitle: "Meppadi Taxi & Cab Booking | In Drive Tours",
    metaDescription:
      "Meppadi taxi and cab service for 900 Kandi, Soochipara Falls, Chembra and tea-estate stays. Enquire on WhatsApp for availability and pricing.",
    heroImage: "/images/sightseeing.jpg",
    heroAlt: "Forest waterfall near Meppadi in Wayanad during monsoon greenery",
    intro: [
      "Meppadi sits among Wayanad's tea estates and has become the adventure side of the district — 900 Kandi's viewpoints, Soochipara and Kanthapara waterfalls, and the Chembra Peak trek base are all reached from here.",
      "Roads around Meppadi wind through estates and climb toward viewpoints, so a private vehicle for the day is the practical way to sightsee. Share your stay location and wish list, and a vehicle can be arranged around realistic drive times.",
    ],
    areasServed: ["Meppadi town", "900 Kandi side", "Chooralmala side", "Mundakkai side", "Chembra base", "Vaduvanchal side"],
    transportNote:
      "Meppadi trips often mix estate roads and short highway stretches — sedans suit couples, while families heading to falls and viewpoints usually prefer an SUV or Innova for comfort.",
    airportNote:
      "Airport transfers to Meppadi run from Calicut Airport via Kalpetta (typically around three to three and a half hours) or from Kannur Airport via the northern route. Share your flight timing so the pickup can be planned with buffer time for the ghat section.",
    sightseeingNote:
      "A classic Meppadi day pairs Soochipara Falls with Kanthapara Falls; 900 Kandi and the Chembra base are usually planned as separate half-days because of drive and activity time.",
    spots: [
      { name: "Soochipara Falls", note: "Forest falls with a trek down — carry good footwear." },
      { name: "900 Kandi", note: "Glass bridge and valley viewpoints above the estates." },
      { name: "Chembra Peak", note: "Trek base; permissions have daily limits." },
    ],
    relatedLocations: ["kalpetta", "vythiri", "ambalavayal", "sulthan-bathery"],
    relatedRoutes: ["calicut-airport-to-meppadi", "calicut-airport-to-wayanad", "mysore-to-wayanad"],
    faqs: [
      {
        question: "Can I book a Meppadi taxi for 900 Kandi and the waterfalls?",
        answer:
          "Yes. Share your stay location and the places you want to cover — 900 Kandi, Soochipara and Kanthapara are commonly combined into planned day trips, subject to availability.",
      },
      {
        question: "Which vehicle is best around Meppadi's estate roads?",
        answer:
          "Sedans work for couples on the main routes; families and groups usually prefer an Ertiga, SUV or Innova for the climbs and extra luggage.",
      },
      {
        question: "Do you arrange pickups from Meppadi homestays and resorts?",
        answer:
          "Yes. Share your property name and location pin, since many Meppadi stays are inside estates off the main road.",
      },
    ],
  },
  {
    slug: "sulthan-bathery",
    name: "Sulthan Bathery",
    metaTitle: "Sulthan Bathery Taxi & Cab Service | In Drive Tours",
    metaDescription:
      "Sulthan Bathery taxi and cab booking — Edakkal Caves, Muthanga sanctuary, Mysore–Bangalore route transfers. Enquire on WhatsApp today.",
    heroImage: "/images/ghat-road.jpg",
    heroAlt: "Winding road through green forest near Sulthan Bathery, Wayanad",
    intro: [
      "Sulthan Bathery — Bathery to locals — is Wayanad's southern gateway town and the handiest base for Edakkal Caves, the Jain temple and the Muthanga side of the Wayanad Wildlife Sanctuary. Visitors driving in from Mysore and Bangalore usually enter Wayanad through Bathery.",
      "The town is a practical pickup point for onward sightseeing and for transfers along the Mysore–Wayanad–Calicut corridor. Share your route and dates, and a vehicle can be arranged accordingly.",
    ],
    areasServed: ["Bathery town", "Muthanga side", "Noolpuzha side", "Ambalavayal side", "Meenangadi side", "Panamaram side"],
    transportNote:
      "Bathery is the natural halt for the Mysore/Bangalore corridor and for sanctuary-side sightseeing — taxis are commonly arranged here for Edakkal days, Muthanga safaris (forest-department jeeps at the gate) and intercity transfers.",
    airportNote:
      "Bathery is typically reached from Calicut Airport via Kalpetta, or from Kannur Airport via Mananthavady. For the Mysore–Bangalore side, Mysore is often the more convenient transit city than an airport run.",
    sightseeingNote:
      "From Bathery, Edakkal Caves pairs well with the Ambalavayal Heritage Museum; Muthanga sanctuary visits are best planned as early-morning trips.",
    spots: [
      { name: "Edakkal Caves", note: "Prehistoric carvings — a climb, best started early." },
      { name: "Muthanga sanctuary", note: "Morning forest safaris (forest-department jeeps)." },
      { name: "Jain Temple", note: "Historic stone temple in Bathery town." },
    ],
    relatedLocations: ["ambalavayal", "meppadi", "kalpetta", "pulpally"],
    relatedRoutes: ["mysore-to-wayanad", "bangalore-to-wayanad", "calicut-airport-to-wayanad"],
    faqs: [
      {
        question: "Can I book a Bathery taxi for Edakkal Caves?",
        answer:
          "Yes. Taxis are commonly arranged from Sulthan Bathery for Edakkal Caves visits, often combined with the Ambalavayal Heritage Museum.",
      },
      {
        question: "Do you arrange Mysore to Sulthan Bathery transfers?",
        answer:
          "Yes, subject to availability. Share your pickup point in Mysore, date and group size for confirmation on WhatsApp.",
      },
      {
        question: "Can you arrange a vehicle for a Muthanga sanctuary visit?",
        answer:
          "Yes — we can arrange your transfer to the sanctuary. Note that the forest safari itself runs in forest-department jeeps at the gate.",
      },
    ],
  },
  {
    slug: "mananthavady",
    name: "Mananthavady",
    metaTitle: "Mananthavady Taxi & Cab Service | In Drive Tours",
    metaDescription:
      "Mananthavady taxi and cab booking for Kuruva Island, Tholpetty sanctuary and Kannur-side transfers. Share your trip on WhatsApp.",
    heroImage: "/images/lake.jpg",
    heroAlt: "River and bamboo trails near Kuruva Island, Mananthavady",
    intro: [
      "Mananthavady anchors north Wayanad — quieter than Kalpetta, closer to Kuruva Island, the Tholpetty sanctuary and the Pazhassi heritage sites. It is also the Wayanad town best connected toward Kannur and Coorg.",
      "Because the north's attractions are spread out, a private vehicle makes the biggest difference here. Share your itinerary and a vehicle can be arranged for Kuruva days, sanctuary mornings or onward transfers.",
    ],
    areasServed: ["Mananthavady town", "Kuruva side", "Tholpetty side", "Panamaram side", "Nallurnad side", "Kannur-route villages"],
    transportNote:
      "Mananthavady trips tend to be longer-distance days (Kuruva, Tholpetty, Banasura) — comfortable seating matters, so families often choose an SUV or Innova over a sedan.",
    airportNote:
      "Kannur Airport is usually the most convenient airport for Mananthavady, via the Nedumpoyil/Periya ghat route. Calicut Airport transfers run via Kalpetta and take longer.",
    sightseeingNote:
      "Kuruva Island (seasonal entry, closed in monsoon) and Tholpetty sanctuary mornings are the two classic Mananthavady-side plans; Banasura Sagar Dam can pair with either side depending on your route.",
    spots: [
      { name: "Kuruva Island", note: "Bamboo-island river trails — check seasonal entry." },
      { name: "Tholpetty sanctuary", note: "Morning safaris in forest-department jeeps." },
      { name: "Pazhassi Tomb", note: "A quiet heritage stop near town." },
    ],
    relatedLocations: ["pulpally", "kalpetta", "ambalavayal", "sulthan-bathery"],
    relatedRoutes: ["kannur-airport-to-wayanad", "mysore-to-wayanad", "calicut-airport-to-wayanad"],
    faqs: [
      {
        question: "Can I book a taxi in Mananthavady for Kuruva Island?",
        answer:
          "Yes. Share your date and group size — note that Kuruva Island has seasonal entry and daily visitor limits, so plan ahead.",
      },
      {
        question: "Which airport is closest to Mananthavady?",
        answer:
          "Kannur Airport is usually the most convenient, via the northern ghat route. Transfer enquiries can be submitted through the website.",
      },
      {
        question: "Do you arrange transfers from Mananthavady to Coorg or Mysore?",
        answer:
          "Yes, subject to availability. Share your route, date and group size for confirmation on WhatsApp.",
      },
    ],
  },
  {
    slug: "ambalavayal",
    name: "Ambalavayal",
    metaTitle: "Ambalavayal Taxi & Cab Service | In Drive Tours",
    metaDescription:
      "Ambalavayal taxi and cab booking near Edakkal Caves — sightseeing days, heritage museum and Wayanad transfers. Enquire on WhatsApp.",
    heroImage: "/images/hero.jpg",
    heroAlt: "Green Wayanad hills around Ambalavayal with morning mist",
    intro: [
      "Ambalavayal is a small town with an outsized attraction list — it is the base for Edakkal Caves, home to the Wayanad Heritage Museum, and close to Karapuzha Dam. Visitors who want Edakkal without the crowds often stay on this side.",
      "A taxi from Ambalavayal keeps Edakkal days simple: an early start for the climb, the museum or Karapuzha afterwards, and no parking worries at the cave base.",
    ],
    areasServed: ["Ambalavayal town", "Edakkal base", "Karapuzha side", "Muppainad side", "Kalpetta side", "Bathery side"],
    transportNote:
      "Ambalavayal sits between Kalpetta and Bathery, so it works both as a sightseeing base and as a pickup point for transfers along the Wayanad central corridor.",
    airportNote:
      "Airport transfers from Ambalavayal run via Kalpetta to Calicut Airport, or via Mananthavady to Kannur Airport. Share your flight timing so the ghat section can be planned with buffer time.",
    sightseeingNote:
      "The classic Ambalavayal day is Edakkal Caves in the morning and the Heritage Museum plus Karapuzha Dam in the afternoon.",
    spots: [
      { name: "Edakkal Caves", note: "The main draw — start early to beat heat and crowds." },
      { name: "Wayanad Heritage Museum", note: "Tribal artefacts, an easy add-on." },
      { name: "Karapuzha Dam", note: "Gardens and boating, a short drive away." },
    ],
    relatedLocations: ["sulthan-bathery", "kalpetta", "meppadi", "pulpally"],
    relatedRoutes: ["calicut-airport-to-kalpetta", "mysore-to-wayanad", "calicut-airport-to-wayanad"],
    faqs: [
      {
        question: "Can I book a taxi from Ambalavayal to Edakkal Caves?",
        answer:
          "Yes. Ambalavayal is the closest base to the caves — share your date and group size and a vehicle can be arranged, subject to availability.",
      },
      {
        question: "Is Ambalavayal a good place to stay for sightseeing?",
        answer:
          "Yes if Edakkal, the Heritage Museum and Karapuzha are your priorities. For the Vythiri or Meppadi circuits, Kalpetta is more central.",
      },
      {
        question: "Do you arrange pickups from Ambalavayal homestays?",
        answer:
          "Yes. Share your property name, location pin and trip plan on WhatsApp.",
      },
    ],
  },
  {
    slug: "pulpally",
    name: "Pulpally",
    metaTitle: "Pulpally Taxi & Cab Service | In Drive Tours",
    metaDescription:
      "Pulpally taxi and cab service for south Wayanad — Kuruva Island access, Kabini side and group transfers. Enquire on WhatsApp today.",
    heroImage: "/images/ghat-road.jpg",
    heroAlt: "Quiet green road through south Wayanad near Pulpally",
    intro: [
      "Pulpally is south Wayanad's quiet corner — paddy fields, forest edges and a slower pace than the main tourist towns. It is a useful base for reaching Kuruva Island from the southern side and for travellers heading toward the Kabini region.",
      "Public transport is thin on this side, so pre-arranged taxis matter more here than anywhere else in the district. Share your route in advance and a vehicle can be planned properly.",
    ],
    areasServed: ["Pulpally town", "Kuruva south side", "Seetha side", "Kabini-route villages", "Bathery side", "Mananthavady side"],
    transportNote:
      "Pulpally trips are usually planned point-to-point runs (Kuruva, Bathery, Mananthavady, Kabini side) rather than hop-on sightseeing — advance booking is strongly recommended.",
    airportNote:
      "Airport transfers from Pulpally typically route via Bathery–Kalpetta to Calicut Airport, or via Mananthavady to Kannur Airport. Allow generous time — these are among the longer Wayanad airport runs.",
    sightseeingNote:
      "From Pulpally, Kuruva Island is the headline trip (seasonal entry); otherwise the area suits slow stays, temple visits and Kabini-side itineraries.",
    spots: [
      { name: "Kuruva Island", note: "Reachable from the south side too — seasonal entry." },
      { name: "Seetha Lava Kusha Temple", note: "A well-known local temple." },
      { name: "Kabini side", note: "Riverside stays toward the Karnataka border." },
    ],
    relatedLocations: ["mananthavady", "sulthan-bathery", "ambalavayal", "kalpetta"],
    relatedRoutes: ["mysore-to-wayanad", "kannur-airport-to-wayanad", "bangalore-to-wayanad"],
    faqs: [
      {
        question: "Can I book a taxi in Pulpally?",
        answer:
          "Yes. Because Pulpally is a quieter area with limited on-the-spot options, we recommend sharing your route and dates in advance on WhatsApp.",
      },
      {
        question: "How do I reach Kuruva Island from Pulpally?",
        answer:
          "Kuruva can be approached from the southern side. Share your date and group size — and note the island's seasonal entry and visitor limits.",
      },
      {
        question: "Do you arrange transfers from Pulpally to Mysore or Kabini?",
        answer:
          "Yes, subject to availability. Share your route, date and group size for confirmation.",
      },
    ],
  },
  {
    slug: "muttil",
    name: "Muttil",
    metaTitle: "Muttil Taxi & Cab Service | In Drive Tours",
    metaDescription:
      "Muttil taxi and cab booking near Kalpetta — local trips, Karapuzha Dam visits and Wayanad transfers. Share your trip on WhatsApp.",
    heroImage: "/images/cta-valley.jpg",
    heroAlt: "Misty valley view over Wayanad countryside near Muttil",
    intro: [
      "Muttil is a growing town minutes from Kalpetta — close enough to use Kalpetta's central location, with its own stays, eateries and easy access toward Karapuzha Dam and the Meppadi road.",
      "Visitors staying in Muttil typically plan the same circuits as Kalpetta: Vythiri side one day, Meppadi side the next, Edakkal when energy permits. Pickups from Muttil stays are straightforward to arrange.",
    ],
    areasServed: ["Muttil town", "Kalpetta side", "Karapuzha side", "Meppadi road side", "Kainatty side", "Puzhamudi side"],
    transportNote:
      "Muttil works like a Kalpetta suburb for trip planning — the same day-trip circuits apply, with marginally shorter runs toward Karapuzha and the Meppadi road.",
    airportNote:
      "Airport transfers from Muttil follow the Kalpetta corridors — via Thamarassery ghat to Calicut Airport, or via Mananthavady to Kannur Airport.",
    sightseeingNote:
      "From Muttil, Karapuzha Dam is the closest outing; Pookode–Lakkidi, Soochipara and Edakkal run as full day trips.",
    spots: [
      { name: "Karapuzha Dam", note: "The nearest outing — gardens and boating." },
      { name: "Pookode Lake", note: "An easy day trip via Kalpetta–Vythiri." },
      { name: "Soochipara Falls", note: "A full day via the Meppadi road." },
    ],
    relatedLocations: ["kalpetta", "vythiri", "meppadi", "ambalavayal"],
    relatedRoutes: ["calicut-airport-to-kalpetta", "calicut-airport-to-wayanad", "kannur-airport-to-wayanad"],
    faqs: [
      {
        question: "Can I book a taxi from Muttil for sightseeing?",
        answer:
          "Yes. Muttil uses the same sightseeing circuits as nearby Kalpetta — share your stay location and wish list on WhatsApp.",
      },
      {
        question: "Is Muttil a convenient place to stay in Wayanad?",
        answer:
          "Yes — it is minutes from Kalpetta with quick access to Karapuzha Dam and the Meppadi road, while staying quieter than the main town.",
      },
      {
        question: "Do you arrange Muttil airport transfers?",
        answer:
          "Yes. Share your flight details, stay location and group size for confirmation on WhatsApp.",
      },
    ],
  },
];

export const locationBySlug = (slug: string): LocationInfo | undefined =>
  LOCATIONS.find((l) => l.slug === slug);

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

export type RouteInfo = {
  slug: string;
  from: string;
  to: string;
  metaTitle: string;
  metaDescription: string;
  distance: string;
  duration: string;
  heroImage: string;
  heroAlt: string;
  overview: string[];
  highlights: string[];
  vehicles: string[];
  relatedLocations: string[];
  relatedRoutes: string[];
  faqs: Faq[];
};

export const ROUTES: RouteInfo[] = [
  {
    slug: "calicut-airport-to-wayanad",
    from: "Calicut Airport",
    to: "Wayanad",
    metaTitle: "Calicut Airport to Wayanad Taxi | In Drive Tours",
    metaDescription:
      "Private taxi from Calicut Airport (CCJ) to Wayanad — Kalpetta, Vythiri, Meppadi & more. Share your flight on WhatsApp for availability and pricing.",
    distance: "Approx. 85–110 km depending on destination",
    duration: "Approx. 2.5–3.5 hours depending on destination & traffic",
    heroImage: "/images/airport.jpg",
    heroAlt: "Highway from Calicut Airport toward the Wayanad ghats at dawn",
    overview: [
      "Calicut International Airport (Kozhikode, CCJ) is the most-used airport for Wayanad trips. The drive climbs the Thamarassery ghat — nine hairpin bends through forested hills — before levelling out onto the Wayanad plateau toward Vythiri, Kalpetta or Meppadi.",
      "Because the ghat section slows traffic, flight-timed planning matters: share your landing time, destination and group size, and a pickup can be arranged with realistic buffer time. Early-morning and late-night arrivals can be accommodated subject to availability.",
    ],
    highlights: [
      "Thamarassery ghat drive with valley viewpoints",
      "Via Vythiri for Lakkidi-side resorts",
      "Via Kalpetta for Meppadi and Bathery sides",
      "Luggage-friendly vehicle options for families",
    ],
    vehicles: ["sedan", "ertiga-suv", "innova", "innova-crysta", "tempo-traveller"],
    relatedLocations: ["vythiri", "kalpetta", "meppadi", "muttil"],
    relatedRoutes: ["calicut-airport-to-kalpetta", "calicut-airport-to-vythiri", "calicut-airport-to-meppadi"],
    faqs: [
      {
        question: "How long does Calicut Airport to Wayanad take by taxi?",
        answer:
          "Typically around two and a half to three and a half hours, depending on your exact destination in Wayanad, the ghat traffic and weather.",
      },
      {
        question: "Will the driver wait if my flight is delayed?",
        answer:
          "Share your flight number and landing time in advance — pickups are planned around your actual arrival, and timing is coordinated with you on WhatsApp.",
      },
      {
        question: "Which vehicle should I book from the airport?",
        answer:
          "Couples with light luggage usually take a sedan; families with more bags prefer an Ertiga, SUV or Innova. Groups of 9+ should enquire about a Tempo Traveller.",
      },
    ],
  },
  {
    slug: "calicut-airport-to-kalpetta",
    from: "Calicut Airport",
    to: "Kalpetta",
    metaTitle: "Calicut Airport to Kalpetta Taxi | In Drive Tours",
    metaDescription:
      "Calicut Airport to Kalpetta taxi service via Thamarassery ghat. Private pickup for your flight — enquire on WhatsApp for availability and pricing.",
    distance: "Approx. 95–105 km",
    duration: "Approx. 2.5–3 hours depending on traffic",
    heroImage: "/images/airport.jpg",
    heroAlt: "Airport transfer taxi route from Calicut Airport to Kalpetta",
    overview: [
      "The Calicut Airport to Kalpetta run is Wayanad's classic arrival route: airport pickup, the climb through Thamarassery ghat, then the plateau drive past Vythiri into Kalpetta town. Most visitors heading to central Wayanad stays use this corridor.",
      "Kalpetta's central location makes it a smart arrival point — from here, Vythiri, Meppadi and Edakkal-side sightseeing all run as easy day trips. Share your flight and hotel details for a planned pickup.",
    ],
    highlights: [
      "The most-used Wayanad arrival corridor",
      "Ghat climb with photo-stop viewpoints",
      "Direct drop to Kalpetta hotels & homestays",
      "Easy onward sightseeing from Kalpetta",
    ],
    vehicles: ["sedan", "ertiga-suv", "innova", "innova-crysta"],
    relatedLocations: ["kalpetta", "vythiri", "muttil", "meppadi"],
    relatedRoutes: ["calicut-airport-to-wayanad", "calicut-airport-to-vythiri", "kannur-airport-to-wayanad"],
    faqs: [
      {
        question: "What is the taxi travel time from Calicut Airport to Kalpetta?",
        answer:
          "Typically around two and a half to three hours via the Thamarassery ghat, depending on traffic and weather.",
      },
      {
        question: "Can I get dropped at my Kalpetta hotel?",
        answer:
          "Yes. Share your hotel name and location — pickups and drops are door-to-door, planned around your flight.",
      },
      {
        question: "Is the ghat road safe at night?",
        answer:
          "The Thamarassery ghat is a well-used highway, but night and monsoon driving needs extra care and time. Share late-flight details in advance so the pickup is planned with buffer time.",
      },
    ],
  },
  {
    slug: "calicut-airport-to-vythiri",
    from: "Calicut Airport",
    to: "Vythiri",
    metaTitle: "Calicut Airport to Vythiri Taxi | In Drive Tours",
    metaDescription:
      "Private taxi from Calicut Airport to Vythiri resorts — door-to-door pickup timed to your flight. Enquire on WhatsApp for availability and pricing.",
    distance: "Approx. 80–90 km",
    duration: "Approx. 2–2.5 hours depending on traffic",
    heroImage: "/images/resort.jpg",
    heroAlt: "Resort arrival in Vythiri after an airport transfer from Calicut",
    overview: [
      "Vythiri is the first major Wayanad halt after the Thamarassery ghat, which makes the Calicut Airport to Vythiri transfer the shortest of the main Wayanad airport runs. Many resort guests prefer landing and reaching their estate stay in a single smooth drive.",
      "Since Vythiri resorts often sit off the main road inside estates, sharing your resort name and location pin in advance makes the final stretch much smoother — especially for evening arrivals.",
    ],
    highlights: [
      "Shortest major Wayanad airport run",
      "Direct drop to estate resorts & homestays",
      "Pookode & Lakkidi right beside your stay",
      "Good arrival point before a Kalpetta move",
    ],
    vehicles: ["sedan", "ertiga-suv", "innova", "innova-crysta"],
    relatedLocations: ["vythiri", "kalpetta", "muttil", "meppadi"],
    relatedRoutes: ["calicut-airport-to-wayanad", "calicut-airport-to-kalpetta", "calicut-airport-to-meppadi"],
    faqs: [
      {
        question: "How long is the drive from Calicut Airport to Vythiri?",
        answer:
          "Typically around two to two and a half hours via the Thamarassery ghat, depending on traffic.",
      },
      {
        question: "Will the taxi come to my Vythiri resort?",
        answer:
          "Yes — drops are door-to-door. Share your resort name and location pin, since many Vythiri properties sit inside estates off the main road.",
      },
      {
        question: "Can I combine the airport transfer with sightseeing?",
        answer:
          "Yes, subject to timing — Lakkidi Viewpoint and Pookode Lake sit along the arrival side. Mention it in your enquiry so the plan and vehicle can be arranged accordingly.",
      },
    ],
  },
  {
    slug: "calicut-airport-to-meppadi",
    from: "Calicut Airport",
    to: "Meppadi",
    metaTitle: "Calicut Airport to Meppadi Taxi | In Drive Tours",
    metaDescription:
      "Calicut Airport to Meppadi taxi for 900 Kandi, tea-estate stays and waterfall trips. Share your flight on WhatsApp for availability and pricing.",
    distance: "Approx. 100–115 km",
    duration: "Approx. 3–3.5 hours depending on traffic",
    heroImage: "/images/ghat-road.jpg",
    heroAlt: "Ghat road winding toward Meppadi from Calicut Airport side",
    overview: [
      "The Calicut Airport to Meppadi transfer runs the full Wayanad arrival corridor — ghat climb, Vythiri, Kalpetta — then onward into the tea-estate country around Meppadi. It is the longest of the main airport runs, so comfort and buffer time matter.",
      "Meppadi stays are often inside estates, and the final approach can be narrow. Sharing your property location in advance, plus your flight timing, lets the pickup be planned realistically.",
    ],
    highlights: [
      "Full Wayanad corridor drive in one trip",
      "Direct drop to estate stays & homestays",
      "Arrive ready for 900 Kandi & falls days",
      "Comfortable vehicles for the longer run",
    ],
    vehicles: ["ertiga-suv", "innova", "innova-crysta", "tempo-traveller"],
    relatedLocations: ["meppadi", "kalpetta", "vythiri", "ambalavayal"],
    relatedRoutes: ["calicut-airport-to-wayanad", "calicut-airport-to-kalpetta", "mysore-to-wayanad"],
    faqs: [
      {
        question: "How long does Calicut Airport to Meppadi take?",
        answer:
          "Typically around three to three and a half hours via Kalpetta, depending on traffic and your exact stay location.",
      },
      {
        question: "Which vehicle is best for the Meppadi airport run?",
        answer:
          "For the longer drive, families usually prefer an Ertiga, SUV or Innova for comfort and luggage space. Couples with light bags can take a sedan.",
      },
      {
        question: "My Meppadi stay is inside an estate — is pickup possible?",
        answer:
          "Yes, in most cases. Share the property name and location pin so the final approach can be planned accurately.",
      },
    ],
  },
  {
    slug: "kannur-airport-to-wayanad",
    from: "Kannur Airport",
    to: "Wayanad",
    metaTitle: "Kannur Airport to Wayanad Taxi | In Drive Tours",
    metaDescription:
      "Private taxi from Kannur Airport (CNN) to Wayanad — Mananthavady, Kalpetta & more via the northern ghat. Enquire on WhatsApp today.",
    distance: "Approx. 60–110 km depending on destination",
    duration: "Approx. 2–3 hours depending on destination & traffic",
    heroImage: "/images/airport.jpg",
    heroAlt: "Northern ghat route from Kannur Airport toward Wayanad",
    overview: [
      "Kannur International Airport (CNN) is the convenient arrival airport for north Wayanad — Mananthavady, Kuruva side and Tholpetty are all closer from Kannur than from Calicut. The route climbs the northern ghat via Nedumpoyil/Periya.",
      "For Kalpetta and the southern towns, Kannur and Calicut airports are roughly comparable options — the better choice depends on your flight timings and fares. Share your landing details and destination for a planned pickup.",
    ],
    highlights: [
      "Closest airport for Mananthavady & Kuruva side",
      "Northern ghat drive via Nedumpoyil/Periya",
      "Good alternative for Kalpetta arrivals",
      "Flight-timed private pickups",
    ],
    vehicles: ["sedan", "ertiga-suv", "innova", "innova-crysta", "tempo-traveller"],
    relatedLocations: ["mananthavady", "kalpetta", "pulpally", "sulthan-bathery"],
    relatedRoutes: ["calicut-airport-to-wayanad", "calicut-airport-to-kalpetta", "mysore-to-wayanad"],
    faqs: [
      {
        question: "Which Wayanad towns are closest to Kannur Airport?",
        answer:
          "Mananthavady and the Kuruva/Tholpetty side are closest. Kalpetta is reachable in roughly two and a half to three hours depending on the route and traffic.",
      },
      {
        question: "Should I fly to Kannur or Calicut for Wayanad?",
        answer:
          "For north Wayanad (Mananthavady side), Kannur is usually more convenient. For Vythiri, Kalpetta and Meppadi, compare both airports on flight timings and fares.",
      },
      {
        question: "Do you arrange late-night pickups from Kannur Airport?",
        answer:
          "Yes, subject to availability. Share your flight timing in advance so the pickup can be planned with buffer time for the ghat section.",
      },
    ],
  },
  {
    slug: "bangalore-to-wayanad",
    from: "Bangalore",
    to: "Wayanad",
    metaTitle: "Bangalore to Wayanad Taxi | In Drive Tours",
    metaDescription:
      "Outstation taxi from Bangalore to Wayanad via Mysore — one-way and round-trip enquiries for families and groups. Confirm on WhatsApp.",
    distance: "Approx. 270–290 km",
    duration: "Approx. 6–7 hours depending on route & traffic",
    heroImage: "/images/ghat-road.jpg",
    heroAlt: "Highway from Bangalore to Wayanad passing through forested hills",
    overview: [
      "Bangalore to Wayanad is a full-day drive, usually routed via Mysore, Gundlupet and the Muthanga forest corridor into Sulthan Bathery. It is a popular weekend-trip corridor, and an early start makes the biggest difference to arrival time.",
      "For this distance, vehicle comfort matters more than anything else — families typically choose an Innova or Crysta, and groups travel by Tempo Traveller. One-way drops and round trips with local sightseeing days can both be enquired about.",
    ],
    highlights: [
      "Via Mysore & the Muthanga forest corridor",
      "Early starts beat city & highway traffic",
      "One-way drops or full round trips",
      "Comfort-first vehicles for the long run",
    ],
    vehicles: ["innova", "innova-crysta", "ertiga-suv", "tempo-traveller", "urbania"],
    relatedLocations: ["sulthan-bathery", "kalpetta", "vythiri", "meppadi"],
    relatedRoutes: ["mysore-to-wayanad", "calicut-airport-to-wayanad", "kannur-airport-to-wayanad"],
    faqs: [
      {
        question: "How long does Bangalore to Wayanad take by taxi?",
        answer:
          "Typically around six to seven hours via Mysore, depending on Bangalore city traffic, the route and breaks.",
      },
      {
        question: "Can I book a one-way drop from Bangalore to Wayanad?",
        answer:
          "Yes, subject to availability. Share your Bangalore pickup point, Wayanad destination, date and group size for confirmation on WhatsApp.",
      },
      {
        question: "Can the same vehicle stay for Wayanad sightseeing?",
        answer:
          "Yes — round trips with local sightseeing days are commonly enquired about. Share your full itinerary so the vehicle plan can cover every day.",
      },
    ],
  },
  {
    slug: "mysore-to-wayanad",
    from: "Mysore",
    to: "Wayanad",
    metaTitle: "Mysore to Wayanad Taxi | In Drive Tours",
    metaDescription:
      "Taxi from Mysore to Wayanad via Gundlupet & Muthanga — Bathery, Kalpetta & Meppadi drops. Enquire on WhatsApp for availability.",
    distance: "Approx. 120–140 km",
    duration: "Approx. 3–3.5 hours depending on route & traffic",
    heroImage: "/images/ghat-road.jpg",
    heroAlt: "Forest highway from Mysore to Wayanad through Muthanga",
    overview: [
      "Mysore to Wayanad is a comfortable half-day drive via Gundlupet and the Muthanga forest corridor, entering Wayanad at Sulthan Bathery. Many travellers pair a Mysore stay with a Wayanad leg — or arrive by train to Mysuru Junction and continue by road.",
      "The forest-corridor stretch has regulated hours, so timing the drive matters. Share your pickup time and destination, and the transfer can be planned around a smooth crossing.",
    ],
    highlights: [
      "Via Gundlupet & Muthanga forest corridor",
      "Pairs well with Mysuru Junction arrivals",
      "Enters Wayanad at Sulthan Bathery",
      "Comfortable half-day drive",
    ],
    vehicles: ["sedan", "ertiga-suv", "innova", "innova-crysta", "tempo-traveller"],
    relatedLocations: ["sulthan-bathery", "ambalavayal", "kalpetta", "pulpally"],
    relatedRoutes: ["bangalore-to-wayanad", "calicut-airport-to-wayanad", "kannur-airport-to-wayanad"],
    faqs: [
      {
        question: "How long does Mysore to Wayanad take by taxi?",
        answer:
          "Typically around three to three and a half hours to the Bathery/Kalpetta side via Gundlupet and Muthanga, depending on traffic.",
      },
      {
        question: "Can I be picked up from Mysuru Junction railway station?",
        answer:
          "Yes, subject to availability. Share your train arrival time, Wayanad destination and group size for confirmation.",
      },
      {
        question: "Is the Muthanga forest route open at all hours?",
        answer:
          "The forest corridor has regulated movement hours. Share your planned timing so the transfer can be scheduled for a smooth crossing.",
      },
    ],
  },
];

export const routeBySlug = (slug: string): RouteInfo | undefined =>
  ROUTES.find((r) => r.slug === slug);

/* ------------------------------------------------------------------ */
/* Homepage FAQs                                                       */
/* ------------------------------------------------------------------ */

export const HOME_FAQS: Faq[] = [
  {
    question: "How can I book a taxi in Wayanad?",
    answer:
      "Select your service on this website, share your name, WhatsApp number and trip details, and continue the enquiry on WhatsApp. Our team will check vehicle availability and confirm the trip with you.",
  },
  {
    question: "Do you provide Calicut Airport transfers to Wayanad?",
    answer:
      "Yes, we arrange airport transfer enquiries between Calicut Airport and destinations across Wayanad, including Kalpetta, Vythiri and Meppadi.",
  },
  {
    question: "Can I book a Tempo Traveller in Wayanad?",
    answer:
      "Yes, depending on vehicle availability. Submit your group size, dates and route through the website or WhatsApp for confirmation.",
  },
  {
    question: "Can I book transportation for a large group?",
    answer:
      "Yes. Enquire about Tempo Travellers, Urbania, mini buses or buses depending on your group size, and our team will confirm availability on WhatsApp.",
  },
  {
    question: "Do you provide Wayanad sightseeing taxis?",
    answer:
      "Yes, sightseeing enquiries can be submitted through the website and confirmed through WhatsApp, with the vehicle arranged around your stay and interests.",
  },
];

/* ------------------------------------------------------------------ */
/* Trust + process                                                     */
/* ------------------------------------------------------------------ */

export const TRUST_POINTS = [
  {
    title: "Local Wayanad service",
    text: "Trips planned around Wayanad's roads, distances and ghat timings — not generic packages.",
  },
  {
    title: "Multiple vehicle options",
    text: "Sedans to buses, matched to your group size and luggage — not one fixed cab type.",
  },
  {
    title: "Airport pickup & drop",
    text: "Flight-timed transfers between Wayanad and Calicut / Kannur airports.",
  },
  {
    title: "Family & group transportation",
    text: "From couples to full functions — one enquiry covers cars, travellers and buses.",
  },
  {
    title: "Simple WhatsApp booking",
    text: "No accounts, no apps, no advance online payment — confirm directly on WhatsApp.",
  },
  {
    title: "Local trip assistance",
    text: "Help sequencing your days sensibly — which sides pair well, what fits in a day.",
  },
] as const;

export const BOOKING_STEPS = [
  {
    number: "01",
    title: "Choose your ride",
    text: "Select taxi, traveller, bus or transfer — and tell us where you're going.",
  },
  {
    number: "02",
    title: "Tell us your trip",
    text: "Enter your name, WhatsApp number and passenger details. It takes under a minute.",
  },
  {
    number: "03",
    title: "Continue on WhatsApp",
    text: "Our team checks availability and confirms your trip, vehicle and price.",
  },
] as const;
