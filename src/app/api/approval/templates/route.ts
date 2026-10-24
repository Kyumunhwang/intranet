import { NextResponse } from 'next/server';
import { getApprovalTemplates } from '@/lib/db';

export async function GET() {
  try {
    const templates = getApprovalTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '양식 서식 목록 조회 실패', error: String(error) },
      { status: 500 }
    );
  }
}
