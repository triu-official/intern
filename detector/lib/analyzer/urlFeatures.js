const CONSTANTS = require('../constants');

function extractUrlFeatures(urlStr, domain) {
  const features = {};
  const reasons = [];

  // URL Length
  features.urlLength = urlStr.length;
  if (urlStr.length > 75) {
    features.isLong = true;
    reasons.push('URL is unusually long (>75 chars)');
  } else {
    features.isLong = false;
  }

  // Subdomains
  const parts = domain.split('.');
  // www.example.com -> length 3. example.com -> length 2.
  features.subdomainCount = Math.max(0, parts.length - 2);
  if (features.subdomainCount > 2) {
    reasons.push(`Too many subdomains detected (${features.subdomainCount})`);
  }

  // IP as hostname
  features.isIpHostname = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(domain);
  if (features.isIpHostname) {
    reasons.push('Hostname is an IP address instead of a domain name');
  }

  // Suspicious Characters
  const suspChars = ['@', '%', '=', '-', '_'];
  let suspCharCount = 0;
  for (const char of suspChars) {
    if (urlStr.includes(char)) suspCharCount++;
  }
  features.suspiciousCharCount = suspCharCount;

  if (urlStr.includes('@')) {
    reasons.push('URL contains @ symbol (credential stealing pattern)');
  }
  if ((domain.match(/-/g) || []).length > 2) {
    reasons.push('Domain contains multiple hyphens');
  }

  // Suspicious Keywords
  const foundKeywords = CONSTANTS.SUSPICIOUS_KEYWORDS.filter(kw => urlStr.toLowerCase().includes(kw));
  features.foundKeywords = foundKeywords;
  if (foundKeywords.length > 0) {
    reasons.push(`URL contains suspicious keywords: ${foundKeywords.join(', ')}`);
  }

  // Shortener
  features.isShortener = CONSTANTS.SHORTENERS.has(domain.toLowerCase());
  if (features.isShortener) {
    reasons.push('URL uses a known link shortener service');
  }

  // Suspicious TLD
  const tld = parts[parts.length - 1]?.toLowerCase();
  features.tld = tld;
  features.isSuspiciousTld = CONSTANTS.SUSPICIOUS_TLDS.has(tld);
  if (features.isSuspiciousTld) {
    reasons.push(`Domain uses a high-risk TLD (.${tld})`);
  }

  // HTTP instead of HTTPS
  features.isHttp = urlStr.startsWith('http://');
  if (features.isHttp) {
    reasons.push('Connection uses unencrypted HTTP instead of HTTPS');
  }

  // Deep Path
  try {
    const parsed = new URL(urlStr);
    const pathSegments = parsed.pathname.split('/').filter(p => p.length > 0);
    features.pathDepth = pathSegments.length;
    if (features.pathDepth > 4) {
      reasons.push('URL has an unusually deep path structure');
    }
  } catch (e) {
    features.pathDepth = 0;
  }

  // Digits in hostname
  const digitCount = (domain.match(/\d/g) || []).length;
  features.digitsInHostname = digitCount;
  if (digitCount > 5) {
    reasons.push('Hostname contains excessive numbers');
  }

  // Punycode
  features.isPunycode = domain.includes('xn--');
  if (features.isPunycode) {
    reasons.push('Domain uses punycode (xn--), potential homograph attack');
  }

  // Brand Impersonation
  const foundBrands = CONSTANTS.TARGET_BRANDS.filter(brand => domain.toLowerCase().includes(brand) && domain.toLowerCase() !== `${brand}.com`);
  features.impersonatedBrands = foundBrands;
  if (foundBrands.length > 0 && !features.isIpHostname) {
    reasons.push(`Potential brand impersonation detected in domain: ${foundBrands[0]}`);
  }

  return { features, reasons };
}

module.exports = { extractUrlFeatures };
