# Project Map

This is a plain static HTML website for Elemental 5. There is no framework, package manager, or build pipeline. Netlify serves files directly from the repository root.

## Primary Public Pages

These are the main public-facing pages. They are linked from the shared navigation, listed in `sitemap.xml`, have self-referencing canonical URLs, or are routed by Netlify.

- `index.html` - homepage
- `programs.html` - programs overview
- `start-here.html` - new family / getting-started page
- `pricing.html` - pricing and enrollment
- `schedule.html` - class schedule
- `new-gym.html` - new facility / founding membership
- `ninfit-beginner.html` - NinFit beginner levels
- `ninfit-intermediate-page.html` - NinFit intermediate levels
- `tx3-page.html` - Tx3 program page
- `aerial-silks-page.html` - aerial silks program page
- `juniorcoach.html` - Junior Coach Apprenticeship
- `echo-performance-troupe.html` - Echo troupe page linked from navigation
- `echo.html` - Echo page listed in `sitemap.xml`
- `about.html` - about page
- `team.html` - team page
- `character.html` - character / five elements page
- `contact.html` - contact page
- `newsletter.html` - newsletter page
- `policies.html` - policies page
- `store.html` - store page; `/store` is rewritten to this file by Netlify
- `e5-surge.html` - Surge program page; this is an active page, not a duplicate

## Utility Pages

These are supporting pages that may be reached after forms or from special-purpose links.

- `feedback.html` - feedback form
- `feedback-thank-you.html` - feedback confirmation page
- `juniorcoach-thank-you.html` - Junior Coach application confirmation page
- `kiosk/index.html` - separate kiosk-style experience; blocked from indexing in `robots.txt`

## Shared Partials

Shared partials live in `Partials/` and are loaded into pages with `fetch()`.

- `Partials/nav.html`
  - Controls the desktop and mobile navigation.
  - Includes the logo, dropdown menus, program links, `/store` link, and Student Portal CTA.
  - Changing this file affects most public pages.

- `Partials/footer.html`
  - Controls footer content, contact info, location, team/coach links, and the newsletter signup.
  - Includes MailerLite form markup and scripts.
  - Changing this file affects most public pages.

Because these partials are loaded with `fetch('/Partials/...')`, nav and footer may not appear correctly when opening pages directly from the filesystem. Test through a local server when checking layout or scripts.

## Legacy Duplicate Pages

These files appear to be older or alternate versions. Their canonical URLs point to non-prefixed primary pages, so do not edit these unless intentionally maintaining the legacy copy.

- `e5-about.html` -> canonical `about.html`
- `e5-character.html` -> canonical `character.html`
- `e5-contact.html` -> canonical `contact.html`
- `e5-echo.html` -> canonical `echo.html`
- `e5-new-gym.html` -> canonical `new-gym.html`
- `e5-policies.html` -> canonical `policies.html`
- `e5-pricing.html` -> canonical `pricing.html`
- `e5-programs.html` -> canonical `programs.html`
- `e5-schedule.html` -> canonical `schedule.html`
- `e5-team.html` -> canonical `team.html`

Important exception: `e5-surge.html` is not in this duplicate group. It canonicals to itself and appears in `sitemap.xml`.

## Assets

Most images and brand assets live in the repository root.

- Brand files include `E5_Logo_FullLockUp_021224 (2).png`, `E5_ElementalAthlete_*.png`, `.eps`, and `.ai` files.
- Element icons include `element-air.png`, `element-earth.png`, `element-fire.png`, `element-water.png`, and `element-void.png`.
- Large local photos include files such as `Allie 1.jpg`, `group bow.jpg`, `Peyton 1.jpg`, and related athlete/group photos.
- Many pages also reference externally hosted images from Googleusercontent URLs.
- `store.html` uses externally hosted product imagery from a CDN.

## Deployment Notes

- `netlify.toml` sets `publish = "."`.
- There is no build command.
- Netlify serves the repository root directly.
- `/store` is rewritten to `/store.html` with status `200`.
- `robots.txt` allows the public site and disallows `/kiosk/`.
- `sitemap.xml` manually lists indexed public URLs.
- Most pages include manual SEO metadata: title, description, canonical URL, Open Graph tags, and Twitter card tags.
- The homepage includes JSON-LD structured data for the business.

## External Services

Common external services used by the site:

- Google Analytics via `gtag.js`
- iClassPro for enrollment and student portal links
- Formspree for several forms
- MailerLite for newsletter signup in the footer
- Google Fonts for `Montserrat` and `Nunito Sans`
- External image hosting via Googleusercontent and other CDNs

## Rules For Safely Editing This Site

1. Do not assume there is a build step. Edit the actual `.html` or partial file that Netlify serves.
2. Prefer editing primary canonical pages, not `e5-*` duplicate pages.
3. Treat `e5-surge.html` as active, despite the `e5-` prefix.
4. For navigation changes, edit `Partials/nav.html` once instead of editing every page.
5. For footer/contact/newsletter changes, edit `Partials/footer.html` once and test several pages.
6. Be careful with inline CSS. Most page styles are copied per page, so visual changes may need to be repeated on each relevant page.
7. Avoid broad find-and-replace across all HTML files unless duplicate legacy pages are intentionally included.
8. When updating URLs, check `Partials/nav.html`, `sitemap.xml`, canonical tags, and any internal page CTAs.
9. When changing form markup, preserve required third-party fields and endpoints unless intentionally migrating providers.
10. When changing the footer, verify the MailerLite success behavior still works.
11. Test pages through a local server so `fetch('/Partials/...')` can load the shared nav and footer.
12. After content or routing changes, update `sitemap.xml` and `robots.txt` if needed.
13. Watch for text encoding issues when editing special characters such as arrows, em dashes, stars, and curly quotes.
14. Do not delete legacy duplicate pages without first deciding whether old inbound links or search results still need redirects.
15. Keep edits narrow. This site is static and duplicated, so small changes are easier to verify than sweeping refactors.
