import { NextResponse } from 'next/server';
import { runFullAnalysis } from '../../../lib/analyzer/index';
import { insertAnalysis } from '../../../lib/db';
import { checkRateLimit } from '../../../lib/rateLimit';
import { getRequestIp } from '../../../lib/utils/network';
import { loggerBus } from '../../../lib/logger';

export async function POST(request) {
  try {
    const ip = getRequestIp(request);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json({
        error: 'rate_limited',
        message: `Too many requests. Please try again in ${rateLimit.resetInSeconds} seconds.`
      }, { status: 429 });
    }

    const body = await request.json();
    const { url, sessionId } = body;

    if (!url) {
      return NextResponse.json({ error: 'invalid_input', message: 'URL is required' }, { status: 400 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'invalid_input', message: 'Session ID is required' }, { status: 400 });
    }

    loggerBus.clearSession(sessionId);

    const result = await runFullAnalysis(url, sessionId);
    const id = insertAnalysis(result);

    return NextResponse.json({
      success: true,
      analysisId: id,
      result: result
    });

  } catch (error) {
    return NextResponse.json({
      error: 'analysis_failed',
      message: error.message
    }, { status: 500 });
  }
}
