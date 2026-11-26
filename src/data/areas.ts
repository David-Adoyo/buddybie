export interface City {
  id: string;
  name: string;
  /** Major districts / neighbourhoods shown in the area picker. */
  areas: string[];
}

export const cities: City[] = [
  // ── United States ────────────────────────────────────────────────────────────
  {
    id: "new-york",
    name: "New York",
    areas: ["Manhattan", "Brooklyn", "Queens", "The Bronx", "Harlem", "Long Island City"],
  },
  {
    id: "los-angeles",
    name: "Los Angeles",
    areas: ["Downtown LA", "Santa Monica", "Hollywood", "Silver Lake", "Culver City", "West Hollywood"],
  },
  {
    id: "chicago",
    name: "Chicago",
    areas: ["The Loop", "Lincoln Park", "Wicker Park", "Hyde Park", "River North", "Wrigleyville"],
  },
  {
    id: "miami",
    name: "Miami",
    areas: ["South Beach", "Brickell", "Wynwood", "Little Havana", "Coconut Grove", "Coral Gables"],
  },
  {
    id: "houston",
    name: "Houston",
    areas: ["Downtown", "Midtown", "The Heights", "Montrose", "River Oaks", "Energy Corridor"],
  },
  {
    id: "atlanta",
    name: "Atlanta",
    areas: ["Midtown", "Buckhead", "Old Fourth Ward", "Inman Park", "East Atlanta", "Little Five Points"],
  },
  {
    id: "dallas",
    name: "Dallas",
    areas: ["Downtown", "Uptown", "Deep Ellum", "Oak Cliff", "Lakewood", "Bishop Arts District"],
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    areas: ["SoMa", "Mission District", "Castro", "Pacific Heights", "North Beach", "Haight-Ashbury"],
  },
  {
    id: "seattle",
    name: "Seattle",
    areas: ["Capitol Hill", "Belltown", "South Lake Union", "Fremont", "Queen Anne", "Ballard"],
  },
  {
    id: "boston",
    name: "Boston",
    areas: ["Back Bay", "South End", "Beacon Hill", "Cambridge", "Fenway", "Seaport"],
  },
  {
    id: "washington-dc",
    name: "Washington DC",
    areas: ["Capitol Hill", "Dupont Circle", "Adams Morgan", "Logan Circle", "Georgetown", "U Street"],
  },
  {
    id: "denver",
    name: "Denver",
    areas: ["LoDo", "Capitol Hill", "RiNo", "Cherry Creek", "Five Points", "Highlands"],
  },
  // ── Canada ───────────────────────────────────────────────────────────────────
  {
    id: "toronto",
    name: "Toronto",
    areas: ["Downtown Core", "Yorkville", "Kensington Market", "North York", "Scarborough", "Etobicoke"],
  },
  // ── Europe ───────────────────────────────────────────────────────────────────
  {
    id: "london",
    name: "London",
    areas: ["Central London", "East London", "South London", "North London", "West London", "Canary Wharf"],
  },
  {
    id: "paris",
    name: "Paris",
    areas: ["Centre (1st–4th)", "Latin Quarter (5th–6th)", "Le Marais", "Montmartre", "Bastille / Nation", "La Défense"],
  },
  {
    id: "amsterdam",
    name: "Amsterdam",
    areas: ["Centrum", "De Pijp", "Jordaan", "Oud-West", "Noord", "Oost"],
  },
  {
    id: "berlin",
    name: "Berlin",
    areas: ["Mitte", "Prenzlauer Berg", "Kreuzberg", "Friedrichshain", "Charlottenburg", "Neukölln"],
  },
  {
    id: "barcelona",
    name: "Barcelona",
    areas: ["Eixample", "Gràcia", "El Born", "Barceloneta", "Sarrià-Sant Gervasi", "Poblenou"],
  },
  {
    id: "stockholm",
    name: "Stockholm",
    areas: ["Södermalm", "Östermalm", "Vasastan", "Gamla Stan", "Kungsholmen", "Nacka"],
  },
  {
    id: "dublin",
    name: "Dublin",
    areas: ["Dublin 1 / City Centre", "Dublin 2 / Southside", "Dublin 4 / Ballsbridge", "Dublin 6 / Rathmines", "Dublin 7 / Smithfield", "Dublin 8 / Portobello"],
  },
  {
    id: "lisbon",
    name: "Lisbon",
    areas: ["Alfama", "Bairro Alto", "Chiado", "Belém", "Príncipe Real", "Parque das Nações"],
  },
  // ── Middle East ─────────────────────────────────────────────────────────────
  {
    id: "dubai",
    name: "Dubai",
    areas: ["Downtown Dubai", "Dubai Marina", "JBR", "Jumeirah", "DIFC", "Business Bay", "Deira"],
  },
  // ── Africa ──────────────────────────────────────────────────────────────────
  {
    id: "nairobi",
    name: "Nairobi",
    areas: ["CBD", "Westlands", "Parklands", "Kilimani", "Karen", "Lavington", "Eastleigh", "Kasarani", "Ruiru / Thika Road", "Rongai / Kitengela"],
  },
  {
    id: "lagos",
    name: "Lagos",
    areas: ["Victoria Island", "Lekki", "Ikoyi", "Ikeja", "Surulere", "Yaba", "Ajah"],
  },
  {
    id: "johannesburg",
    name: "Johannesburg",
    areas: ["Sandton", "Rosebank", "Melville", "Maboneng", "Midrand", "Soweto"],
  },
  {
    id: "cape-town",
    name: "Cape Town",
    areas: ["City Bowl", "Sea Point", "Green Point", "Camps Bay", "Observatory", "Claremont"],
  },
  // ── Asia-Pacific ─────────────────────────────────────────────────────────────
  {
    id: "singapore",
    name: "Singapore",
    areas: ["Central", "Orchard", "Tampines", "Jurong", "Queenstown", "Buona Vista"],
  },
  {
    id: "sydney",
    name: "Sydney",
    areas: ["CBD", "Surry Hills", "Newtown", "Manly", "Bondi", "Parramatta"],
  },
  {
    id: "melbourne",
    name: "Melbourne",
    areas: ["CBD", "Fitzroy", "St Kilda", "Southbank", "Richmond", "Brunswick"],
  },
  {
    id: "tokyo",
    name: "Tokyo",
    areas: ["Shibuya", "Shinjuku", "Ginza", "Harajuku / Omotesando", "Akihabara", "Roppongi"],
  },
];

/** Flat list — used by profile display and search filters. */
export const areaOptions: { value: string; label: string; city: string }[] =
  cities.flatMap((city) =>
    city.areas.map((area) => ({
      value: `${city.id}:${area}`,
      label: area,
      city: city.name,
    })),
  );
