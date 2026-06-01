---
name: scraper
description: Add, debug, or modify price scrapers for e-commerce sites (Shopee, Lazada, Tiki, etc.). Use when working with scraper configs or pullData modules.
---

# Scraper Skill

Work with PriceTrack's price scrapers — add new sites, debug existing ones, or modify scraping logic.

## Architecture

Scrapers are split into two parts:

1. **Config** (`functions/config/<site>.js`) — Site-specific selectors and URL patterns. Exports an object with:
   - `urlPattern` — regex to match product URLs
   - `selectors` — CSS selectors for price, title, image, etc.
   - `transform` — optional data transformation functions

2. **Module** (`functions/modules/pullData.js`) — Generic pull logic that reads configs and fetches/scrapes product pages using:
   - Puppeteer-core + @sparticuz/chromium for JS-rendered pages (serverless Chromium)
   - jsdom for static HTML parsing
   - axios for simple HTTP fetches

## Adding a New Scraper

1. Create `functions/config/<site>.js` with the site's URL pattern and selectors
2. Register it in the config index (check how existing sites are imported)
3. Test with: `firebase functions:shell → pullData({url: '<product-url>'})`
4. Verify the scraped data structure matches what `modules/pullData.js` expects

## Debugging

- Check Firebase Functions logs: `firebase functions:log`
- Puppeteer scrapers run headless on serverless Chromium — no GPU, limited memory
- Some sites require specific headers or cookie consent handling
- `@sparticuz/chromium` has size limits; check if the binary is up to date

## Key Files

- `functions/config/` — per-site scraper configurations
- `functions/modules/pullData.js` — main scraping orchestration
- `functions/modules/updateInfo.js` — product info updates
- `functions/utils/fetch.js` — HTTP fetch utilities
