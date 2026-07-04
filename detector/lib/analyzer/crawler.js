const cheerio = require('cheerio');
const { validateUrl } = require('../utils/url');

async function crawlDomain(baseUrl, initialHtml) {
  const result = {
    pages: [],
    internalLinkCount: 0,
    externalLinkCount: 0,
    additionalReasons: []
  };

  if (!initialHtml) return result;

  const $ = cheerio.load(initialHtml);
  const toVisit = new Set();
  const visited = new Set();

  let baseParsed;
  try {
    baseParsed = new URL(baseUrl);
  } catch (e) {
    return result;
  }

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href === '#' || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }

    try {
      const url = new URL(href, baseUrl);
      if (url.hostname === baseParsed.hostname) {
        result.internalLinkCount++;
        // Exclude paths with heavy extensions
        if (!url.pathname.match(/\.(jpg|jpeg|png|gif|pdf|zip|tar|gz|mp4)$/i)) {
          toVisit.add(url.href);
        }
      } else {
        result.externalLinkCount++;
      }
    } catch (e) {
      // Ignored
    }
  });

  const queue = Array.from(toVisit).slice(0, 5); // Limit to 5 pages

  for (const url of queue) {
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Detector/1.0 (Security Scanner)' }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('text/html')) {
          const html = await res.text();
          const page$ = cheerio.load(html);
          result.pages.push({
            url,
            title: page$('title').text().trim() || null,
            snippet: page$('meta[name="description"]').attr('content') || null
          });
        }
      }
    } catch (e) {
      // Graceful fail
    }
  }

  return result;
}

module.exports = { crawlDomain };
