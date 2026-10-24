import { NextRequest, NextResponse } from 'next/server';
import { getMenuPermissions, updateMenuPermissions } from '@/lib/db';
import { MenuPermissionItem } from '@/lib/types';

export async function GET() {
  try {
    const permissions = getMenuPermissions();
    return NextResponse.json({ success: true, permissions });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '메뉴별 권한 조회 실패', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { success: false, message: '올바른 권한 데이터 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    const updated = updateMenuPermissions(permissions as MenuPermissionItem[]);
    return NextResponse.json({
      success: true,
      permissions: updated,
      message: '메뉴별 권한 설정이 성공적으로 저장되었습니다.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '메뉴별 권한 저장 실패', error: String(error) },
      { status: 500 }
    );
  }
}
