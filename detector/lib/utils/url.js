function sanitizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.trim();
}

function normalizeUrl(raw) {
  let cleaned = sanitizeUrl(raw);
  if (!cleaned) return null;

  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

function extractDomain(urlStr) {
  try {
    const parsed = new URL(urlStr);
    return parsed.hostname;
  } catch (e) {
    return null;
  }
}

function isPrivateIp(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4) return false;

  // 10.x.x.x
  if (parts[0] === 10) return true;
  // 172.16.x.x - 172.31.x.x
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  // 192.168.x.x
  if (parts[0] === 192 && parts[1] === 168) return true;
  // 169.254.x.x (Link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;
  // 127.x.x.x (Loopback)
  if (parts[0] === 127) return true;

  return false;
}

function isLocalhost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function isPublicHostname(hostname) {
  if (!hostname) return false;
  if (isLocalhost(hostname)) return false;

  // Basic check to see if it's an IP
  const isIpV4 = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
  if (isIpV4 && isPrivateIp(hostname)) return false;

  // Don't allow spaces or wildly invalid chars
  if (/\s/.test(hostname)) return false;

  return true;
}

function validateUrl(raw) {
  const normalized = normalizeUrl(raw);
  if (!normalized) return { valid: false, error: 'Empty URL' };

  if (normalized.length > 500) return { valid: false, error: 'URL too long' };

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP/HTTPS allowed' };
    }
    if (!isPublicHostname(parsed.hostname)) {
      return { valid: false, error: 'Private or local domains are not allowed' };
    }
    return { valid: true, url: normalized, parsed };
  } catch (e) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

module.exports = {
  sanitizeUrl,
  normalizeUrl,
  extractDomain,
  isPrivateIp,
  isLocalhost,
  isPublicHostname,
  validateUrl
};
