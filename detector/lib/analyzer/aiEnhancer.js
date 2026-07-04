const { GoogleGenerativeAI } = require('@google/generative-ai');

async function enhanceWithAi(state, apiKey) {
  if (!apiKey) return null;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const summaryData = {
      url: state.url,
      domainAgeDays: state.whoisInfo?.domainAgeDays,
      tlsValid: state.tlsInfo?.isCurrentlyValid,
      hasSpf: state.dnsInfo?.hasSpf,
      riskScore: state.scores?.riskScore,
      trustScore: state.scores?.trustScore,
      pageTitle: state.contentInfo?.pageInfo?.title,
      riskHighlights: state.scores?.riskHighlights,
      trustSignals: state.scores?.trustSignals,
    };

    const prompt = `
    You are a cybersecurity expert analyzing a website for phishing or malicious intent.
    Here is a summary of the technical analysis of the site:
    ${JSON.stringify(summaryData, null, 2)}

    Based on this data, provide an assessment.
    You must return ONLY a raw JSON object with no markdown formatting or comments.
    Format:
    {
      "ai_verdict": "Safe" | "Suspicious" | "Phishing",
      "ai_confidence": number 0-100,
      "ai_summary": "Short 1-2 sentence explanation of why",
      "ai_red_flags": ["list", "of", "flags"],
      "ai_trust_indicators": ["list", "of", "trusts"]
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    let cleaned = text;
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace('```json', '');
    if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);

    const parsed = JSON.parse(cleaned.trim());
    return parsed;
  } catch (error) {
    console.error("AI Enhancement failed:", error.message);
    return null; // Graceful fallback
  }
}

module.exports = { enhanceWithAi };
