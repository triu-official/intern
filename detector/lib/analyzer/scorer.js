function computeScores(state) {
  let riskScore = 0;
  let trustScore = 0;
  const riskHighlights = [];
  const trustSignals = [];

  // URL Features
  if (state.urlFeatures) {
    if (state.urlFeatures.features.isLong) riskScore += 10;
    if (state.urlFeatures.features.subdomainCount > 2) riskScore += 15;
    if (state.urlFeatures.features.isIpHostname) {
      riskScore += 40;
      riskHighlights.push('Hostname is an IP address');
    }
    if (state.urlFeatures.features.suspiciousCharCount > 0) riskScore += (state.urlFeatures.features.suspiciousCharCount * 5);
    if (state.urlFeatures.features.foundKeywords && state.urlFeatures.features.foundKeywords.length > 0) {
      riskScore += 15;
      riskHighlights.push('Contains suspicious keywords in URL');
    }
    if (state.urlFeatures.features.isShortener) {
      riskScore += 20;
      riskHighlights.push('Uses link shortener');
    }
    if (state.urlFeatures.features.isSuspiciousTld) {
      riskScore += 30;
      riskHighlights.push('Uses high-risk TLD');
    }
    if (state.urlFeatures.features.isHttp) {
      riskScore += 20;
      riskHighlights.push('No HTTPS');
    }
    if (state.urlFeatures.features.isPunycode) {
      riskScore += 50;
      riskHighlights.push('Punycode domain (homograph attack risk)');
    }
    if (state.urlFeatures.features.impersonatedBrands && state.urlFeatures.features.impersonatedBrands.length > 0) {
      riskScore += 40;
      riskHighlights.push('Potential brand impersonation');
    }
  }

  // WHOIS
  if (state.whoisInfo) {
    if (state.whoisInfo.domainAgeDays !== null) {
      if (state.whoisInfo.domainAgeDays < 30) {
        riskScore += 35;
        riskHighlights.push('Domain is very new (< 30 days)');
      } else if (state.whoisInfo.domainAgeDays < 90) {
        riskScore += 15;
      } else if (state.whoisInfo.domainAgeDays > 365) {
        trustScore += 2;
        trustSignals.push('Domain registered for over a year');
      }
    }
    if (!state.whoisInfo.rawAvailable) {
      riskScore += 10;
    }
  }

  // DNS
  if (state.dnsInfo) {
    if (!state.dnsInfo.resolves) {
      riskScore += 40;
      riskHighlights.push('Domain does not resolve in DNS');
    } else {
      trustScore += 1;
    }
    if (state.dnsInfo.hasSpf || state.dnsInfo.hasDmarc) {
      trustScore += 2;
      trustSignals.push('Has SPF/DMARC email security records');
    }
  }

  // TLS
  if (state.tlsInfo) {
    if (state.tlsInfo.hasTls) {
      if (!state.tlsInfo.isCurrentlyValid) {
        riskScore += 30;
        riskHighlights.push('TLS certificate is invalid or expired');
      } else if (state.tlsInfo.isSelfSigned) {
        riskScore += 20;
        riskHighlights.push('TLS certificate is self-signed');
      } else {
        trustScore += 2;
        trustSignals.push('Valid TLS certificate');
      }
    }
  }

  // Content
  if (state.contentInfo && state.contentInfo.signals) {
    const s = state.contentInfo.signals;
    if (s.hasPasswordForm) {
      // Password forms are inherently risky if other signals are bad
      if (riskScore > 20) {
        riskScore += 20;
        riskHighlights.push('Asks for password on a risky site');
      }
    }
    if (s.hasExternalFormAction) {
      riskScore += 30;
      riskHighlights.push('Form submits data externally');
    }
    if (s.iframeCount > 2) riskScore += 10;
    if (s.totalLinks > 0 && s.deadLinks / s.totalLinks > 0.5) {
      riskScore += 15;
      riskHighlights.push('High percentage of dead links');
    }

    if (s.hasFavicon) trustScore += 1;
    if (s.hasPrivacy) {
      trustScore += 2;
      trustSignals.push('Has Privacy Policy');
    } else {
      riskScore += 5;
    }
    if (s.hasContact) {
      trustScore += 2;
      trustSignals.push('Has Contact information');
    } else {
      riskScore += 5;
    }
    if (s.hasCurrentCopyright) trustScore += 1;
    if (s.socialLinksCount > 0) {
      trustScore += 1;
      trustSignals.push('Has linked social profiles');
    }
  }

  // Fetch / Reachability
  if (state.fetchInfo) {
    if (state.fetchInfo.reachability !== 'reachable') {
      riskScore += 20;
      riskHighlights.push(`Page unreachable (${state.fetchInfo.errorType})`);
    }
  }

  // Cap scores
  riskScore = Math.min(100, Math.max(0, riskScore));
  trustScore = Math.min(10, Math.max(0, trustScore));

  let label = 'Safe';
  let verdictText = 'This website appears to be safe and legitimate.';

  if (riskScore >= 60) {
    label = 'Phishing';
    verdictText = 'CRITICAL RISK: This website exhibits strong signs of being a phishing or malicious site. Do not enter credentials.';
  } else if (riskScore >= 25) {
    label = 'Suspicious';
    verdictText = 'WARNING: This website has suspicious characteristics. Proceed with caution and do not share sensitive information.';
  } else {
    if (trustScore < 3 && riskScore > 10) {
      label = 'Suspicious';
      verdictText = 'This website has few trust indicators. Exercise basic caution.';
    }
  }

  return { riskScore, trustScore, label, verdictText, riskHighlights, trustSignals };
}

module.exports = { computeScores };
