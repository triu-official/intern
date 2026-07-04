const net = require('net');

const TLD_SERVERS = {
  'com': 'whois.verisign-grs.com',
  'net': 'whois.verisign-grs.com',
  'org': 'whois.pir.org',
  'io': 'whois.nic.io',
  'co': 'whois.nic.co',
  'in': 'whois.registry.in',
  'xyz': 'whois.nic.xyz',
  'info': 'whois.afilias.net',
  'uk': 'whois.nic.uk',
  'us': 'whois.nic.us'
};

function queryWhoisSocket(domain, server) {
  return new Promise((resolve) => {
    let rawData = '';
    const client = new net.Socket();

    const timeoutId = setTimeout(() => {
      client.destroy();
      resolve(null);
    }, 8000); // 8 second timeout

    client.connect(43, server, () => {
      client.write(`${domain}\r\n`);
    });

    client.on('data', (data) => {
      rawData += data.toString();
    });

    client.on('close', () => {
      clearTimeout(timeoutId);
      resolve(rawData);
    });

    client.on('error', () => {
      clearTimeout(timeoutId);
      client.destroy();
      resolve(null);
    });
  });
}

function parseWhoisText(text) {
  const result = {
    registrar: null,
    creationDate: null,
    expiryDate: null,
    nameServers: []
  };

  if (!text) return result;

  const lines = text.split('\n');
  for (let line of lines) {
    line = line.trim();
    const lowerLine = line.toLowerCase();

    if (lowerLine.startsWith('registrar:') && !result.registrar) {
      result.registrar = line.split(':')[1].trim();
    } else if ((lowerLine.startsWith('creation date:') || lowerLine.startsWith('created on:')) && !result.creationDate) {
      result.creationDate = line.split(/:(.+)/)[1].trim();
    } else if ((lowerLine.startsWith('registry expiry date:') || lowerLine.startsWith('expiration date:')) && !result.expiryDate) {
      result.expiryDate = line.split(/:(.+)/)[1].trim();
    } else if (lowerLine.startsWith('name server:')) {
      const ns = line.split(/:(.+)/)[1].trim();
      if (ns && !result.nameServers.includes(ns)) {
        result.nameServers.push(ns);
      }
    }
  }

  return result;
}

async function analyzeWhois(domain) {
  const result = {
    rawAvailable: false,
    registrar: null,
    creationDate: null,
    expiryDate: null,
    nameServers: [],
    domainAgeDays: null,
    reasons: []
  };

  const parts = domain.split('.');
  const tld = parts[parts.length - 1];
  const server = TLD_SERVERS[tld] || 'whois.iana.org'; // Fallback to IANA

  let rawText = await queryWhoisSocket(domain, server);

  if (server === 'whois.iana.org' && rawText) {
    // Basic chase if IANA refers to another WHOIS server
    const match = rawText.match(/whois:\s+([^\s]+)/i);
    if (match && match[1]) {
      rawText = await queryWhoisSocket(domain, match[1].trim());
    }
  }

  if (rawText && rawText.length > 50) {
    result.rawAvailable = true;
    const parsed = parseWhoisText(rawText);

    result.registrar = parsed.registrar;
    result.creationDate = parsed.creationDate;
    result.expiryDate = parsed.expiryDate;
    result.nameServers = parsed.nameServers;

    if (result.creationDate) {
      const creationDateObj = new Date(result.creationDate);
      if (!isNaN(creationDateObj.getTime())) {
        const diffTime = Math.abs(new Date() - creationDateObj);
        result.domainAgeDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (result.domainAgeDays < 30) {
          result.reasons.push(`Domain is extremely new (${result.domainAgeDays} days old)`);
        } else if (result.domainAgeDays < 90) {
          result.reasons.push(`Domain was registered recently (${result.domainAgeDays} days ago)`);
        }
      }
    }
  } else {
    result.reasons.push('WHOIS lookup failed or timed out. This may hide domain ownership details.');
  }

  return result;
}

module.exports = { analyzeWhois };
