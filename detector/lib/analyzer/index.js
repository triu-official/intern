const { validateUrl, extractDomain } = require('../utils/url');
const { extractUrlFeatures } = require('./urlFeatures');
const { analyzeDns } = require('./dnsInfo');
const { analyzeWhois } = require('./whoisInfo');
const { analyzeTls } = require('./tlsInfo');
const { fetchPage } = require('./pageFetcher');
const { inspectContent } = require('./contentInspector');
const { crawlDomain } = require('./crawler');
const { computeScores } = require('./scorer');
const { enhanceWithAi } = require('./aiEnhancer');
const { createSessionLogger } = require('../logger');

async function runFullAnalysis(rawUrl, sessionId) {
  const logger = createSessionLogger(sessionId);
  const state = {};

  try {
    // 1. Validation
    logger.info('URL_PARSE', `Validating input URL: ${rawUrl}`);
    const validResult = validateUrl(rawUrl);
    if (!validResult.valid) {
      logger.error('URL_PARSE', `Invalid URL: ${validResult.error}`);
      throw new Error(`Invalid URL: ${validResult.error}`);
    }
    const normalizedUrl = validResult.url;
    const domain = extractDomain(normalizedUrl);
    state.url = normalizedUrl;
    state.domain = domain;
    logger.success('URL_PARSE', `URL validated and normalized`, { normalizedUrl, domain });

    // 2. URL Features
    logger.info('URL_FEATURES', `Extracting heuristic features from URL`);
    const urlFeatResult = extractUrlFeatures(normalizedUrl, domain);
    state.urlFeatures = urlFeatResult;
    logger.success('URL_FEATURES', `Extracted features`, urlFeatResult.features);

    // 3. DNS
    logger.info('DNS', `Performing DNS lookups for ${domain}`);
    const dnsResult = await analyzeDns(domain);
    state.dnsInfo = dnsResult;
    logger.success('DNS', `DNS analysis complete`, { resolves: dnsResult.resolves, ips: dnsResult.ipv4.length });

    // 4. WHOIS
    logger.info('WHOIS', `Performing WHOIS lookup for ${domain}`);
    const whoisResult = await analyzeWhois(domain);
    state.whoisInfo = whoisResult;
    logger.success('WHOIS', `WHOIS lookup complete`, { age: whoisResult.domainAgeDays, registrar: whoisResult.registrar });

    // 5. TLS
    logger.info('TLS', `Inspecting TLS certificate for ${domain}`);
    const tlsResult = await analyzeTls(normalizedUrl);
    state.tlsInfo = tlsResult;
    logger.success('TLS', `TLS inspection complete`, { valid: tlsResult.isCurrentlyValid, selfSigned: tlsResult.isSelfSigned });

    // 6. Fetch Page
    logger.info('FETCH', `Safely fetching ${normalizedUrl}`);
    const fetchResult = await fetchPage(normalizedUrl);
    state.fetchInfo = fetchResult;
    if (fetchResult.reachability === 'reachable') {
      logger.success('FETCH', `Page fetched successfully. Final URL: ${fetchResult.finalUrl}`);
    } else {
      logger.warn('FETCH', `Failed to fetch page`, { error: fetchResult.errorType, msg: fetchResult.errorMessage });
    }

    // 7. Content Inspection
    let contentResult = null;
    if (fetchResult.html) {
      logger.info('CONTENT', `Inspecting HTML content`);
      contentResult = inspectContent(fetchResult.html, fetchResult.finalUrl);
      state.contentInfo = contentResult;
      logger.success('CONTENT', `Content inspection complete`);
    }

    // 8. Crawler
    let crawlerResult = null;
    if (fetchResult.html && fetchResult.finalUrl) {
      logger.info('CRAWL', `Running bounded crawl on ${fetchResult.finalUrl}`);
      crawlerResult = await crawlDomain(fetchResult.finalUrl, fetchResult.html);
      state.crawlerInfo = crawlerResult;
      logger.success('CRAWL', `Crawl complete. Found ${crawlerResult.pages.length} same-domain pages`);
    }

    // 9. Scoring
    logger.info('SCORE', `Computing risk and trust scores`);
    const scores = computeScores(state);
    state.scores = scores;
    logger.success('SCORE', `Scoring complete: ${scores.label} (Risk: ${scores.riskScore})`);

    // 10. AI Enhancement
    let aiResult = null;
    if (process.env.GEMINI_API_KEY) {
      logger.info('AI', `Requesting AI enhancement from Gemini`);
      aiResult = await enhanceWithAi(state, process.env.GEMINI_API_KEY);
      if (aiResult) {
        state.aiInfo = aiResult;
        logger.success('AI', `AI enhancement complete`, { verdict: aiResult.ai_verdict });
      } else {
        logger.warn('AI', `AI enhancement failed or returned null`);
      }
    }

    // Aggregate Reasons
    const allReasons = [
      ...(state.urlFeatures?.reasons || []),
      ...(state.dnsInfo?.reasons || []),
      ...(state.whoisInfo?.reasons || []),
      ...(state.tlsInfo?.reasons || []),
      ...(state.contentInfo?.reasons || []),
      ...(state.crawlerInfo?.additionalReasons || [])
    ];

    // Build Final Output Format for DB
    const finalResult = {
      raw_url: rawUrl,
      normalized_url: state.url,
      domain: state.domain,
      risk_score: state.scores.riskScore,
      label: state.scores.label,
      verdict_text: state.scores.verdictText,
      reachability: state.fetchInfo.reachability,
      redirect_chain: state.fetchInfo.redirectChain,
      reasons: allReasons,
      trust_score: state.scores.trustScore,
      trust_signals: state.scores.trustSignals,
      features_summary: {
        url: state.urlFeatures?.features,
        dns: { ipv4: state.dnsInfo?.ipv4, hasSpf: state.dnsInfo?.hasSpf, hasDmarc: state.dnsInfo?.hasDmarc },
        tls: state.tlsInfo?.hasTls ? { valid: state.tlsInfo.isCurrentlyValid, issuer: state.tlsInfo.issuer, daysToExpiry: state.tlsInfo.daysToExpiry } : null,
        whois: state.whoisInfo?.rawAvailable ? { ageDays: state.whoisInfo.domainAgeDays, registrar: state.whoisInfo.registrar } : null,
        content: state.contentInfo?.signals,
        crawler: state.crawlerInfo ? { pages: state.crawlerInfo.pages.length, internalLinks: state.crawlerInfo.internalLinkCount } : null,
        ai: state.aiInfo
      },
      deep_analysis: {
        pageInfo: state.contentInfo?.pageInfo,
        crawlPages: state.crawlerInfo?.pages
      },
      status_code: state.fetchInfo.statusCode,
      error_type: state.fetchInfo.errorType,
      error_message: state.fetchInfo.errorMessage,
      session_id: sessionId
    };

    logger.success('COMPLETE', 'Analysis pipeline completed successfully');
    return finalResult;

  } catch (error) {
    logger.error('FAILED', `Analysis pipeline failed: ${error.message}`);
    throw error;
  }
}

module.exports = { runFullAnalysis };
