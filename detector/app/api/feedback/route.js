import { NextResponse } from 'next/server';
import { updateAnalysisFeedback } from '../../../lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { analysisId, feedback, note } = body;

    if (!analysisId || !feedback) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    if (feedback !== 'satisfied' && feedback !== 'not_satisfied') {
      return NextResponse.json({ success: false, error: 'Invalid feedback value' }, { status: 400 });
    }

    updateAnalysisFeedback(analysisId, feedback, note || '');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
