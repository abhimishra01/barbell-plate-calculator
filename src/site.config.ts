// ONE config file. Change values here; every page reads from it.
// Keep this file plain (no type-only syntax): scripts/deploy.mjs imports it directly.
export default {
  name: 'Barbell Plate Calculator',                 // shown in header, title, footer
  domain: 'bingemind.com/barbell-plate-calculator', // host and path of the public home (no https://). Canonical, sitemap and legal text use it
  cloudflareProject: 'barbell-plate-calculator',    // Cloudflare Pages project name (used by npm run deploy)
  keyword: 'plate calculator',        // main keyword (search phrase)
  h1: 'Barbell plate calculator',     // visible page heading
  title: 'Plate Calculator: Barbell Plates Per Side (lb & kg)', // home page title, under 60 chars
  tagline: 'Free and fast',
  description:
    'Enter a target weight and see the plates to load on each side of the barbell. lb and kg, any bar, your plates, warm-up sets.',
  contact: 'https://bingemind.com/#contact', // contact link (no email address)
  hub: 'https://bingemind.com/tools/', // "More free tools" footer link
  ga4: '',                            // GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. Empty = Google Analytics off
  adsense: '',                        // AdSense publisher ID, e.g. 'ca-pub-1234567890123456'. Empty = ads off
  brand: '#c2410c',                   // brand color (hex)
  skin: 'retro',                      // visual skin: minimal, swiss, clay or retro
  locale: 'en-US',                    // BCP 47 language tag
  ogImage: '/og.png',
  category: 'HealthApplication',   // schema.org applicationCategory
  owner: 'Bingemind',                // name used in legal pages (person or business)
};
