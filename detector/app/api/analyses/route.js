import { NextResponse } from 'next/server';
import { listRecentAnalyses } from '../../../lib/db';

export async function GET() {
  try {
    const analyses = listRecentAnalyses(20);
    return NextResponse.json({ success: true, data: analyses });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
