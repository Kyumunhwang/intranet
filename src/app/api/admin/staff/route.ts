import { NextRequest, NextResponse } from 'next/server';
import { saveProfile, getProfiles, logAuditAction } from '@/lib/db';

export async function GET() {
  const profiles = getProfiles();
  return NextResponse.json({ success: true, profiles });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = saveProfile(body);
    logAuditAction({
      action_category: 'ADMIN_CHANGE',
      action_detail: `교직원 정보 등록/수정 완료 [${updated.name_kr} (${updated.name_en || ''}) / ${updated.subject || ''} / ${updated.email}]`,
      client_ip: '211.104.88.24',
    });
    return NextResponse.json({ success: true, profile: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '교직원 정보 저장 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
