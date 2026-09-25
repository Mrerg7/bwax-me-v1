# BWax.me

Sales site for the premium domain **BWax.me** — Brazilian wax as a personal brand, on the `.me` TLD.

**Asking price:** $50,000
**Inquiries:** [sales@desertrich.com](mailto:sales@desertrich.com)

## Pages

| URL | Purpose |
| --- | --- |
| `/` | Domain sale page: brand case, how to buy, buyer FAQ |
| `/brazilian-wax` | Topical guide that earns search traffic and funnels to the sale |

## SEO

- Title, meta description, canonical, robots, and Open Graph / Twitter cards per page
- Async Google Fonts (preconnect, non-blocking) and single compiled stylesheet
- JSON-LD: `WebSite`, `WebPage`, `Product` + `Offer` ($50,000 USD), `FAQPage`, `Article`
- `sitemap-index.xml` (auto) and `robots.txt` with sitemap reference
- One H1 per page, semantic sections, descriptive internal links between both pages
- Mobile-first layout: no horizontal scroll at 320–1440px, 48px tap targets, sticky mobile buy bar

**Off-site (domain authority) checklist**

1. Verify the property in Google Search Console and submit `https://bwax.me/sitemap-index.xml`
2. List the domain on Sedo, Afternic, and GoDaddy Auctions — each listing is a referrable backlink and a sales channel
3. Put the URL in social bios (X, LinkedIn, Instagram) and any existing portfolio
4. Encourage plain-URL mentions; earned links move DA, on-page changes do not

## Deploy

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`
- **Local check:** `npm run preview` then open `http://localhost:4321`
