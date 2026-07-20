# Google services configuration

Last checked: 2026-07-20 (JST)

## Google Analytics 4

- Account: Manapick (`397005594`)
- Property: manapick career (`545251351`)
- Industry: 仕事、教育
- Reporting timezone: Japan (GMT+09:00)
- Currency: JPY
- Web stream: manapick career (`15243311086`)
- Website: `https://career.manapick.app`
- Measurement ID: `G-WW5XWW0YFE`
- Route-guide answers are not included in GA4 events or parameters.
- The GA4 property is linked to the independent Search Console URL-prefix property below (linked on 2026-07-12).
- The account, property, stream, and Search Console link in this section were last checked on 2026-07-12. Current GA4 reception for this release candidate is unconfirmed.

## Google Search Console

- The domain property `manapick.app` already covers the subdomain.
- An independent URL-prefix property `https://career.manapick.app/` was also created and automatically verified through the domain provider on 2026-07-12.
- `https://career.manapick.app/sitemap.xml` was submitted successfully; Search Console reported 31 discovered pages on 2026-07-12. This is a dated Search Console observation, not the current sitemap URL count.
- Indexing and mobile rendering for URLs added by the current release candidate are unconfirmed.

## Google AdSense

- Publisher: `pub-4108900975353940`
- The AdSense site list contains `manapick.app` with status Ready. A separate `career.manapick.app` site entry is not required because it is covered by that parent-domain entry.
- `ads.txt` is approved and the Policy Center was clean when checked on 2026-07-20.
- Site verification is exposed with the `google-adsense-account` meta tag and `public/ads.txt`.
- Parent-domain Auto ads remain available for the existing sister sites, while `career.manapick.app` is excluded from Auto ads.
- The current code loads the AdSense script on every long-form news and guide article and inserts only manual responsive slot `8041327454`, after section 2. There is no separate manual-ad feature flag.
- A filled production response was observed once on 2026-07-20. Fill is request-dependent and is not guaranteed. A filled-ad, full-width check across all target viewport widths remains unconfirmed.
- Implementation and production observations are recorded in `docs/adsense-configuration.md`.
