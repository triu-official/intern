const CONSTANTS = {
  SHORTENERS: new Set([
    'bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'ow.ly', 'is.gd', 'buff.ly',
    'adf.ly', 'bit.do', 'mcaf.ee', 'su.pr', 'v.gd', 's.id', 'cutt.ly', 'rb.gy'
  ]),

  SUSPICIOUS_KEYWORDS: [
    'login', 'secure', 'update', 'verify', 'account', 'banking', 'wallet',
    'support', 'confirm', 'auth', 'billing', 'password', 'credential',
    'service', 'free', 'bonus', 'gift', 'prize', 'winner'
  ],

  SUSPICIOUS_TLDS: new Set([
    'xyz', 'top', 'loan', 'win', 'club', 'gq', 'ml', 'cf', 'tk', 'ga',
    'date', 'faith', 'review', 'party', 'click', 'link', 'work', 'trade'
  ]),

  TARGET_BRANDS: [
    'google', 'apple', 'microsoft', 'amazon', 'facebook', 'paypal', 'netflix',
    'yahoo', 'whatsapp', 'instagram', 'linkedin', 'twitter', 'dropbox', 'github',
    'chase', 'bankofamerica', 'wellsfargo', 'citibank', 'americanexpress',
    'binance', 'coinbase', 'metamask', 'dhl', 'fedex', 'ups', 'usps'
  ]
};

module.exports = CONSTANTS;
