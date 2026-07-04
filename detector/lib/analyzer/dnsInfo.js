const dns = require('dns').promises;

async function analyzeDns(domain) {
  const result = {
    resolves: false,
    ipv4: [],
    ipv6: [],
    mxRecords: [],
    txtRecords: [],
    hasSpf: false,
    hasDmarc: false,
    reasons: []
  };

  try {
    // A Records
    try {
      const aRecords = await dns.resolve4(domain);
      result.ipv4 = aRecords;
      if (aRecords.length > 0) result.resolves = true;
    } catch (e) {
      // Ignored
    }

    // AAAA Records
    try {
      const aaaaRecords = await dns.resolve6(domain);
      result.ipv6 = aaaaRecords;
      if (aaaaRecords.length > 0) result.resolves = true;
    } catch (e) {
      // Ignored
    }

    if (!result.resolves) {
      result.reasons.push('Domain does not resolve to any IP address');
      return result;
    }

    // MX Records
    try {
      const mx = await dns.resolveMx(domain);
      result.mxRecords = mx;
    } catch (e) {
      // Ignored
    }

    // TXT Records (SPF/DMARC)
    try {
      const txt = await dns.resolveTxt(domain);
      result.txtRecords = txt.map(record => record.join(''));

      for (const record of result.txtRecords) {
        if (record.includes('v=spf1')) {
          result.hasSpf = true;
        }
      }
    } catch (e) {
      // Ignored
    }

    try {
      const dmarcTxt = await dns.resolveTxt(`_dmarc.${domain}`);
      const dmarcRecords = dmarcTxt.map(record => record.join(''));
      for (const record of dmarcRecords) {
        if (record.includes('v=DMARC1')) {
          result.hasDmarc = true;
        }
      }
    } catch (e) {
      // Ignored
    }

    if (result.mxRecords.length === 0) {
      // Not necessarily malicious, but good to know
    } else {
      if (!result.hasSpf && !result.hasDmarc) {
        result.reasons.push('Domain has email records but lacks SPF/DMARC security policies');
      }
    }

  } catch (error) {
    result.reasons.push(`DNS lookup failed gracefully: ${error.message}`);
  }

  return result;
}

module.exports = { analyzeDns };
