import { NextRequest, NextResponse } from 'next/server';
import { changeTeacherPassword } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, oldPassword, newPassword } = body;

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: '모든 비밀번호 항목을 입력해 주십시오.' },
        { status: 400 }
      );
    }

    const result = changeTeacherPassword(email, oldPassword, newPassword);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '비밀번호 변경 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
