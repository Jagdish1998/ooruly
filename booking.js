/*
 * Booking links to MakeMyTrip.
 *
 * Important honesty note, reflected in the code: a static site cannot take a payment or reserve a
 * seat. What it can do is hand the traveller off to MakeMyTrip at the right place. MakeMyTrip does
 * not publish a stable, documented deep-link format for pre-filled searches, and their URLs change,
 * so building brittle query strings that "look" pre-filled would break silently. Instead we open the
 * correct MakeMyTrip section (flights / trains / bus / hotels) reliably, and pass the destination as
 * a search term where MakeMyTrip supports it. Worst case, the traveller lands on the right page with
 * the destination pre-typed to search — which is honest and never broken.
 *
 * AFFILIATE-READY: every outbound URL runs through withAffiliate(). Set AFFILIATE.enabled = true and
 * fill AFFILIATE.params once you join the MakeMyTrip / partner programme, and all links become
 * tracked in one place with no other change.
 */

const AFFILIATE = {
    enabled: false,
    // e.g. { affid: 'yourId', campaign: 'yatra' } — appended to every MakeMyTrip link when enabled.
    params: {},
};

const MMT = {
    flights: 'https://www.makemytrip.com/flights/',
    trains: 'https://www.makemytrip.com/railways/',
    bus: 'https://www.makemytrip.com/bus-tickets/',
    hotels: 'https://www.makemytrip.com/hotels/',
};

function withAffiliate(url) {
    if (!AFFILIATE.enabled) return url;
    const u = new URL(url);
    Object.entries(AFFILIATE.params).forEach(([k, v]) => u.searchParams.set(k, v));
    return u.toString();
}

/*
 * Build the four booking links for a destination. Each returns a plain object { href, label, note }
 * so the UI can render a button and a short honest sub-label. `origin` is the ORIGIN from data.js.
 */
function bookingLinks(dest, origin) {
    const b = dest.booking || {};

    const hotels = new URL(MMT.hotels);
    // MakeMyTrip hotels accepts a free-text city search param; harmless if ignored.
    hotels.searchParams.set('checkin', '');
    hotels.searchParams.set('searchText', b.hotelCity || dest.name);

    return [
        {
            key: 'flight',
            icon: 'fa-plane',
            label: 'Flights',
            href: withAffiliate(MMT.flights),
            note: `Search flights from ${origin.city} (${origin.iata}) to the nearest airport`,
        },
        {
            key: 'train',
            icon: 'fa-train',
            label: 'Trains',
            href: withAffiliate(MMT.trains),
            note: `Search trains from ${origin.city} toward ${b.railTo || dest.name}`,
        },
        {
            key: 'bus',
            icon: 'fa-bus',
            label: 'Buses',
            href: withAffiliate(MMT.bus),
            note: `Search buses from ${origin.city} to ${b.busTo || dest.name}`,
        },
        {
            key: 'hotel',
            icon: 'fa-hotel',
            label: 'Hotels',
            href: withAffiliate(hotels.toString()),
            note: `Find stays in ${b.hotelCity || dest.name}`,
        },
    ];
}
