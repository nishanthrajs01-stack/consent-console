import { NextResponse } from 'next/server';
import { SAMPLE_CATALOG } from '@/lib/catalog';

export async function GET() {
  return NextResponse.json({
    success: true,
    catalog: SAMPLE_CATALOG,
  });
}
