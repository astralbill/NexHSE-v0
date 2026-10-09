# Search Console + SEO checklist

This is the operational checklist for indexing and discovery on Google, Bing, and other search engines.

## 1) Submit the canonical site
- Verify the domain property `nexhse.co.ke` in Google Search Console and Bing Webmaster Tools.
- Use `https://www.nexhse.co.ke` as the canonical public-site URL; the bare domain currently redirects to `www`.
- Verify the shop domain in Search Console as a separate property if needed: `https://shop.nexhse.co.ke`
- Confirm the `www` host is canonical and redirects resolve in one hop.

## 2) Submit the sitemap
- Submit: `https://www.nexhse.co.ke/sitemap.xml`
- Ensure the sitemap only includes indexable public pages.
- Keep admin, checkout, and API routes out of the index.

## 3) Validate crawl rules
- Confirm robots.txt allows the public site and blocks `/admin/`, `/api/`, and checkout flows.
- Ensure there are no noindex tags on core service or product pages.
- Keep structured data schema valid and not duplicated across multiple pages.

## 4) Validate metadata quality
- Titles should include the primary keyword and brand.
- Meta descriptions should be unique and clearly explain the offer.
- Canonical URLs should match the final host and path.
- Open Graph and Twitter cards should use the same branded image.

## 5) Use schema markup correctly
- Add Organization schema for the company.
- Add WebSite + WebPage schema for main pages.
- Add Product schema for product pages and FAQPage or Article schema where relevant.
- Keep JSON-LD valid JSON without trailing commas.

## 6) Monitor indexing quality
- Check Coverage and Page Indexing status in Search Console.
- Review any blocked or excluded URLs.
- Prioritize pages with high commercial intent: home, services, training, quote request, shop landing page.

## 7) Re-submit after major changes
- After adding or removing pages, refresh the sitemap and re-submit.
- After content updates, review ranking and indexing for your high-priority pages.

## 8) Performance + trust factors
- Keep pages fast and mobile-friendly.
- Ensure forms and quotations are easy to reach.
- Include real business details, location signals, and contact information.
- Maintain a consistent brand and metadata style across the site.

## Production crawl audit (2026-10-08)
- The current production sitemap exposes 70 URLs; all returned HTTP 200 in a HEAD crawl.
- 48 main-site URLs on `nexhse.co.ke` redirect to `www.nexhse.co.ke`; the shop root also redirects to its trailing-slash URL. The generated sitemap now emits direct canonical URLs.
- Shop URLs are served directly on `shop.nexhse.co.ke`.
- Home, service, and article URLs return the same initial HTML title and canonical; route-specific metadata is currently added client-side. Prerendering or server rendering is needed for reliable per-URL metadata in crawlers that do not execute JavaScript.
- Admin robots policy intentionally blocks the entire admin host.
- The admin-session POST currently returns Vercel `FUNCTION_INVOCATION_FAILED`; this is an API runtime/configuration failure, not a rejected password.
