import { NextRequest, NextResponse } from 'next/server';
import { getPolicyConfig, updatePolicyConfig } from '@/lib/activity-store';

export async function GET() {
  const config = getPolicyConfig();
  return NextResponse.json({
    success: true,
    config,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updatePolicyConfig(body);
    return NextResponse.json({
      success: true,
      config: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Invalid configuration payload' },
      { status: 400 }
    );
  }
}
