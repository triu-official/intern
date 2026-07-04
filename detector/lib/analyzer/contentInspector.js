const cheerio = require('cheerio');

function inspectContent(html, baseUrl) {
  const result = {
    signals: {},
    pageInfo: {},
    reasons: []
  };

  if (!html) {
    result.reasons.push('No HTML content available to inspect.');
    return result;
  }

  const $ = cheerio.load(html);

  // Meta info
  result.pageInfo.title = $('title').text().trim() || null;
  result.pageInfo.description = $('meta[name="description"]').attr('content') || null;
  result.pageInfo.keywords = $('meta[name="keywords"]').attr('content') || null;

  // Headings
  const h1Texts = [];
  $('h1').each((_, el) => h1Texts.push($(el).text().trim()));
  result.pageInfo.h1 = h1Texts;

  const h2Texts = [];
  $('h2').each((_, el) => h2Texts.push($(el).text().trim()));
  result.pageInfo.h2 = h2Texts;

  // Forms
  let hasPassword = false;
  let hasExternalAction = false;
  let formCount = 0;

  $('form').each((_, el) => {
    formCount++;
    const action = $(el).attr('action');
    if (action && action.startsWith('http')) {
      try {
        const actionUrl = new URL(action);
        const base = new URL(baseUrl);
        if (actionUrl.hostname !== base.hostname) {
          hasExternalAction = true;
        }
      } catch (e) {
        // Ignored
      }
    }

    if ($(el).find('input[type="password"]').length > 0) {
      hasPassword = true;
    }
  });

  result.signals.hasPasswordForm = hasPassword;
  result.signals.hasExternalFormAction = hasExternalAction;
  result.signals.formCount = formCount;

  if (hasPassword) {
    result.reasons.push('Page contains a password input field.');
  }
  if (hasExternalAction) {
    result.reasons.push('Form submits data to a different external domain.');
  }

  // Links & Navigation
  let totalLinks = 0;
  let deadLinks = 0;
  let externalLinks = 0;
  const navTexts = [];

  $('a').each((_, el) => {
    totalLinks++;
    const href = $(el).attr('href');
    const text = $(el).text().toLowerCase().trim();

    if (text) navTexts.push(text);

    if (!href || href === '#' || href.startsWith('javascript:')) {
      deadLinks++;
    } else if (href.startsWith('http')) {
      try {
        const hUrl = new URL(href);
        const bUrl = new URL(baseUrl);
        if (hUrl.hostname !== bUrl.hostname) {
          externalLinks++;
        }
      } catch (e) {}
    }
  });

  result.signals.totalLinks = totalLinks;
  result.signals.deadLinks = deadLinks;
  result.signals.externalLinks = externalLinks;

  if (totalLinks > 0 && deadLinks / totalLinks > 0.5) {
    result.reasons.push('High proportion of dead or empty links (common in templates/phishing).');
  }

  // Suspicious Elements
  result.signals.iframeCount = $('iframe').length;
  result.signals.scriptCount = $('script[src]').length;
  result.signals.hiddenInputCount = $('input[type="hidden"]').length;

  if (result.signals.iframeCount > 2) {
    result.reasons.push(`Page uses multiple iframes (${result.signals.iframeCount}).`);
  }

  // Trust Indicators
  const fullText = $('body').text().toLowerCase();

  result.signals.hasPrivacy = navTexts.some(t => t.includes('privacy'));
  result.signals.hasTerms = navTexts.some(t => t.includes('terms') || t.includes('conditions'));
  result.signals.hasContact = navTexts.some(t => t.includes('contact') || t.includes('support'));

  const currentYear = new Date().getFullYear().toString();
  result.signals.hasCurrentCopyright = fullText.includes(`© ${currentYear}`) || fullText.includes(`copyright ${currentYear}`);

  result.signals.hasEmailLink = $('a[href^="mailto:"]').length > 0;
  result.signals.hasTelLink = $('a[href^="tel:"]').length > 0;

  const socialLinks = ['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'youtube.com'];
  let socialFound = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href').toLowerCase();
    if (socialLinks.some(s => href.includes(s))) socialFound++;
  });
  result.signals.socialLinksCount = socialFound;

  result.signals.hasFavicon = $('link[rel="icon"]').length > 0 || $('link[rel="shortcut icon"]').length > 0;

  if (!result.signals.hasFavicon) result.reasons.push('Missing favicon.');
  if (!result.signals.hasPrivacy && !result.signals.hasContact) {
    result.reasons.push('Lacks standard trust pages (Privacy, Contact, Terms).');
  }

  // Offerings Inference
  const allHeadings = [...h1Texts, ...h2Texts].join(' ').toLowerCase();
  result.pageInfo.inferredOfferings = "General content";
  if (allHeadings.includes('login') || allHeadings.includes('sign in')) {
    result.pageInfo.inferredOfferings = "Authentication / Login";
  } else if (allHeadings.includes('shop') || allHeadings.includes('buy') || allHeadings.includes('cart')) {
    result.pageInfo.inferredOfferings = "E-commerce / Shopping";
  }

  return result;
}

module.exports = { inspectContent };
