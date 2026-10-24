import { NextRequest, NextResponse } from 'next/server';
import { getRoles, saveRole, deleteRole } from '@/lib/db';

export async function GET() {
  try {
    const roles = getRoles();
    return NextResponse.json({ success: true, roles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '권한 목록 조회 실패', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role_code, role_name, description, is_system_role } = body;

    if (!role_code || !role_name) {
      return NextResponse.json(
        { success: false, message: '권한 코드와 권한명을 입력해주세요.' },
        { status: 400 }
      );
    }

    const saved = saveRole({
      id: id || undefined,
      role_code,
      role_name,
      description: description || '',
      is_system_role: Boolean(is_system_role),
    });

    return NextResponse.json({
      success: true,
      role: saved,
      message: id ? '권한 코드가 성공적으로 수정되었습니다.' : '신규 권한 코드가 등록되었습니다.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '권한 저장 실패', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: '삭제할 권한 ID가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const result = deleteRole(id);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '권한 삭제 실패', error: String(error) },
      { status: 500 }
    );
  }
}
