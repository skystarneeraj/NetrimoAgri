# Nutrimo Agri Science — Website

A static, dependency-free website (HTML + CSS + vanilla JS). Open `index.html` in a browser, or upload the whole folder to any web host (Netlify, cPanel, GitHub Pages, S3, etc.).

## Structure

```
index.html  about.html  products.html  research.html  services.html
resources.html  contact.html  careers.html  privacy.html  404.html
css/style.css          all styles (colour palette in :root variables)
js/main.js             mobile menu, filters, scroll effects, form handling
assets/img/            logo-mark.svg, logo-full.svg, hero, og-image.png, apple-touch-icon.png
downloads/             8 branded PDF resources
favicon.svg  site.webmanifest  robots.txt  sitemap.xml
```

## Before going live — replace placeholders

| What | Where |
|---|---|
| Domain `www.nutrimoagriscience.com` | `<head>` of every page (canonical / Open Graph), `sitemap.xml`, `robots.txt` |
| Phone `+91 00000 00000`, email `info@` / `careers@nutrimoagriscience.com` | Top bar, footer, contact page, form `data-mailto` attributes |
| Address `[Street Address], [City]…` | Footer, contact page; map `q=` on contact page |
| Company figures (60+ products, 1,500+ dealers, etc.) | `index.html` stats, `research.html` stats |
| Milestone years | `about.html` timeline |
| Testimonials (marked as samples) | `index.html` |
| Product names, doses, job openings | `products.html`, `careers.html` |
| Social media links (`href="#"`) | Footer of every page |
| Report figures marked `[x]` / `[value]` | `downloads/field-trial-summary-2025.pdf`, `sustainability-report-2025.pdf` |

Placeholders are also marked with HTML comments (`<!-- Replace … -->`).

## Forms

All forms (inquiry, service request, job application, newsletter) validate in the browser.

- **Default:** with no backend, submitting opens the visitor's email app with the message pre-filled to the `data-mailto` address.
- **Recommended:** create a form endpoint (e.g. Formspree, Getform, or your own API) and put its URL in the form's `data-endpoint="..."`. Submissions are then POSTed directly and the visitor sees a success message. File uploads (resumes) only work with an endpoint.

## Downloads

Replace any PDF in `downloads/` with your own file of the same name, or add new cards in `resources.html`.
