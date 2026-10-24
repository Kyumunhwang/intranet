import { NextRequest, NextResponse } from 'next/server';
import { getApprovalTemplates, saveApprovalTemplate, deleteApprovalTemplate } from '@/lib/db';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      template_name,
      template_category,
      description,
      content_html,
      auto_deduct_leave,
      steps_count,
      file_name,
      file_url,
    } = body;

    if (!template_name) {
      return NextResponse.json(
        { success: false, message: '서식 명칭을 입력해주세요.' },
        { status: 400 }
      );
    }

    const steps = [];
    const count = Math.max(2, Math.min(5, Number(steps_count) || 3));
    steps.push({ order: 1, role_desc: '기안자', type: 'DRAFTER' });
    if (count === 2) {
      steps.push({ order: 2, role_desc: '부서장 (결재)', type: 'APPROVAL' });
    } else if (count === 3) {
      steps.push({ order: 2, role_desc: '부서장 (중간)', type: 'APPROVAL' });
      steps.push({ order: 3, role_desc: '교장 (최종)', type: 'APPROVAL' });
    } else if (count === 4) {
      steps.push({ order: 2, role_desc: '부서장', type: 'APPROVAL' });
      steps.push({ order: 3, role_desc: '행정실장', type: 'APPROVAL' });
      steps.push({ order: 4, role_desc: '교장 (최종)', type: 'APPROVAL' });
    } else {
      steps.push({ order: 2, role_desc: '담당교감', type: 'APPROVAL' });
      steps.push({ order: 3, role_desc: '부서장', type: 'APPROVAL' });
      steps.push({ order: 4, role_desc: '행정실장', type: 'APPROVAL' });
      steps.push({ order: 5, role_desc: '교장 (최종)', type: 'APPROVAL' });
    }

    const saved = saveApprovalTemplate({
      id: id || undefined,
      template_name,
      template_category: template_category || 'DRAFT',
      description: description || '',
      content_html: content_html || '',
      auto_deduct_leave: Boolean(auto_deduct_leave),
      default_approval_steps: steps,
      file_name: file_name || '',
      file_url: file_url || '',
    });

    return NextResponse.json({
      success: true,
      template: saved,
      message: id ? '양식 서식이 성공적으로 변경되었습니다.' : '신규 양식 서식이 성공적으로 생성되었습니다.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '양식 서식 저장 실패', error: String(error) },
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
        { success: false, message: '삭제할 서식 ID가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    const result = deleteApprovalTemplate(id);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '서식 삭제 실패', error: String(error) },
      { status: 500 }
    );
  }
}
