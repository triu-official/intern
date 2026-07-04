const tls = require('tls');

function fetchTlsCert(hostname) {
  return new Promise((resolve) => {
    const options = {
      host: hostname,
      port: 443,
      servername: hostname,
      rejectUnauthorized: false,
      timeout: 8000
    };

    let resolved = false;

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      socket.end();
      if (!resolved) {
        resolved = true;
        resolve({ cert, authorized: socket.authorized, error: null });
      }
    });

    socket.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        resolve({ cert: null, authorized: false, error: err.message });
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      if (!resolved) {
        resolved = true;
        resolve({ cert: null, authorized: false, error: 'TLS connection timed out' });
      }
    });
  });
}

async function analyzeTls(urlStr) {
  const result = {
    hasTls: false,
    subject: null,
    issuer: null,
    validFrom: null,
    validTo: null,
    fingerprint: null,
    isCurrentlyValid: false,
    isSelfSigned: false,
    daysToExpiry: null,
    reasons: []
  };

  if (urlStr.startsWith('http://')) {
    result.reasons.push('Site is loaded over unencrypted HTTP.');
    return result;
  }

  let hostname;
  try {
    const parsed = new URL(urlStr);
    hostname = parsed.hostname;
  } catch (e) {
    result.reasons.push('Invalid URL format for TLS check.');
    return result;
  }

  const { cert, authorized, error } = await fetchTlsCert(hostname);

  if (error || !cert || Object.keys(cert).length === 0) {
    result.reasons.push(`Failed to retrieve TLS certificate: ${error || 'Unknown error'}`);
    return result;
  }

  result.hasTls = true;
  result.subject = cert.subject?.CN || null;
  result.issuer = cert.issuer?.O || cert.issuer?.CN || null;
  result.validFrom = cert.valid_from;
  result.validTo = cert.valid_to;
  result.fingerprint = cert.fingerprint256;
  result.isCurrentlyValid = authorized;

  // Check if self-signed (issuer == subject is a common indicator)
  if (cert.subject && cert.issuer && cert.subject.CN === cert.issuer.CN) {
    result.isSelfSigned = true;
    result.reasons.push('TLS certificate is self-signed.');
  }

  if (!authorized && !result.isSelfSigned) {
    result.reasons.push('TLS certificate is not trusted by root authorities.');
  }

  if (result.validTo) {
    const expiryDate = new Date(result.validTo);
    const now = new Date();
    if (!isNaN(expiryDate.getTime())) {
      const diffTime = expiryDate.getTime() - now.getTime();
      result.daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (result.daysToExpiry < 0) {
        result.reasons.push(`TLS certificate expired ${Math.abs(result.daysToExpiry)} days ago.`);
        result.isCurrentlyValid = false;
      } else if (result.daysToExpiry < 15) {
        result.reasons.push(`TLS certificate expires soon (${result.daysToExpiry} days).`);
      }
    }
  }

  // Suspicious issuers
  const suspiciousIssuers = ["Let's Encrypt", 'ZeroSSL'];
  if (result.issuer && suspiciousIssuers.some(iss => result.issuer.includes(iss))) {
    // We don't automatically mark it as malicious (many legit sites use LE),
    // but phishing sites use them heavily. We just record the signal.
  }

  return result;
}

module.exports = { analyzeTls };
