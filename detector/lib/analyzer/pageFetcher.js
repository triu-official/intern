const { validateUrl, isPublicHostname } = require('../utils/url');

async function fetchPage(urlStr) {
  const MAX_REDIRECTS = parseInt(process.env.MAX_REDIRECTS) || 5;
  const TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS) || 10000;

  const result = {
    html: null,
    finalUrl: urlStr,
    statusCode: null,
    redirectChain: [],
    reachability: 'unknown',
    errorType: null,
    errorMessage: null,
    headers: {},
    contentType: null
  };

  let currentUrl = urlStr;
  let redirects = 0;

  while (redirects <= MAX_REDIRECTS) {
    const validCheck = validateUrl(currentUrl);
    if (!validCheck.valid) {
      result.errorType = 'blocked_redirect';
      result.errorMessage = `Blocked redirect to invalid or internal URL: ${currentUrl}`;
      result.reachability = 'failed';
      return result;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Detector/1.0 (Security Scanner)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        redirect: 'manual',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      result.statusCode = response.status;

      const newHeaders = {};
      for (const [key, value] of response.headers.entries()) {
        newHeaders[key.toLowerCase()] = value;
      }
      result.headers = newHeaders;

      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
          result.errorType = 'invalid_redirect';
          result.errorMessage = 'Redirect status with no Location header';
          result.reachability = 'failed';
          return result;
        }

        const nextUrl = new URL(location, currentUrl).href;
        result.redirectChain.push({ from: currentUrl, to: nextUrl, status: response.status });
        currentUrl = nextUrl;
        result.finalUrl = currentUrl;
        redirects++;
        continue;
      }

      result.contentType = response.headers.get('content-type') || '';

      if (result.contentType.includes('text/html')) {
        result.html = await response.text();
      } else {
        // Read but discard to complete request cleanly
        await response.arrayBuffer();
      }

      result.reachability = response.ok ? 'reachable' : 'error_status';
      return result;

    } catch (error) {
      result.reachability = 'failed';
      if (error.name === 'AbortError') {
        result.errorType = 'timeout';
        result.errorMessage = 'Connection timed out';
      } else if (error.message.includes('fetch')) {
        result.errorType = 'network_error';
        result.errorMessage = error.message;
      } else {
        result.errorType = 'unknown';
        result.errorMessage = error.message;
      }
      return result;
    }
  }

  result.reachability = 'failed';
  result.errorType = 'too_many_redirects';
  result.errorMessage = `Exceeded maximum of ${MAX_REDIRECTS} redirects`;
  return result;
}

module.exports = { fetchPage };
