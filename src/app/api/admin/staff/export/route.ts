import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getProfiles, getDepartments, getPositions, getRoles } from '@/lib/db';

export async function GET() {
  try {
    const profiles = getProfiles();
    const departments = getDepartments();
    const positions = getPositions();
    const roles = getRoles();

    // 1. 현재 DB의 실제 교직원 데이터를 바탕으로 엑셀 행 매핑
    const rows = profiles.map((p) => {
      const dept = departments.find((d) => d.id === p.primary_dept_id);
      const pos = positions.find((pos) => pos.id === p.primary_position_id);
      const role = roles.find((r) => r.id === p.primary_role_id);
      const empType =
        p.employment_type === 'REGULAR'
          ? '정규직원'
          : p.employment_type === 'PART_TIME'
          ? '파트교사'
          : '외부강사';

      return {
        '사번': p.employee_no || '',
        '교사명': p.name_kr || '',
        '교사영어명': p.name_en || '',
        '직책': pos ? pos.position_name : p.subject || '',
        '부서': dept ? dept.dept_name : '',
        '권한': role ? role.role_name : '',
        '고용형태': empType,
        '담당과목': p.subject || '',
        '내선': p.extension_no || '',
        '휴대전화': p.phone || '',
        '이메일': p.email || '',
        '잔여연차': p.remaining_leave_days ?? 15,
      };
    });

    // 2. 통합 '교직원DB' 시트 생성
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [
      { wch: 14 }, // 사번
      { wch: 12 }, // 교사명
      { wch: 16 }, // 교사영어명
      { wch: 14 }, // 직책
      { wch: 24 }, // 부서
      { wch: 18 }, // 권한
      { wch: 12 }, // 고용형태
      { wch: 16 }, // 담당과목
      { wch: 10 }, // 내선
      { wch: 16 }, // 휴대전화
      { wch: 28 }, // 이메일
      { wch: 10 }, // 잔여연차
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '교직원DB');

    // 3. 기존 roster.xlsx 양식과의 100% 호환을 위한 'faculties' 시트도 동시 제공
    const facultiesRows = profiles.map((p) => ({
      '교사명': p.name_kr || '',
      '교사영어명': p.name_en || '',
      '직책': positions.find((pos) => pos.id === p.primary_position_id)?.position_name || p.subject || '',
      '부서': departments.find((d) => d.id === p.primary_dept_id)?.dept_name || '',
      '권한': roles.find((r) => r.id === p.primary_role_id)?.role_name || '',
      '내선': p.extension_no || '',
      '휴대전화': p.phone || '',
      '이메일': p.email || '',
    }));
    const wsFaculties = XLSX.utils.json_to_sheet(facultiesRows);
    wsFaculties['!cols'] = [
      { wch: 12 },
      { wch: 16 },
      { wch: 14 },
      { wch: 22 },
      { wch: 16 },
      { wch: 10 },
      { wch: 16 },
      { wch: 28 },
    ];
    XLSX.utils.book_append_sheet(wb, wsFaculties, 'faculties');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const today = new Date().toISOString().split('T')[0];
    const filename = `등대글로벌스쿨_교직원DB_Template_${today}.xlsx`;
    const encodedFilename = encodeURIComponent(filename);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    console.error('Failed to export staff DB template:', error);
    return NextResponse.json(
      { success: false, message: '교직원 DB 엑셀 서식 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
