import { NextRequest, NextResponse } from 'next/server';
import { runPurchasingAgent } from '@/lib/agent';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await runPurchasingAgent(body);
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (err: any) {
    console.error('Agent execution error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Agent execution failed',
      },
      { status: 500 }
    );
  }
}
