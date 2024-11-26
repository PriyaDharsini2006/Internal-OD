// api/attendance/[id]/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'TeamLead') {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { id } = params;
    const { attendanceType } = await req.json();

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { message: 'Request ID is required' }, 
        { status: 400 }
      );
    }

    // Find the original request to get date and other details
    const originalRequest = await prisma.oDRequest.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!originalRequest) {
      return NextResponse.json(
        { message: 'Request not found' }, 
        { status: 404 }
      );
    }

    // Determine which attendance field to update
    const updateData = attendanceType === 'forenoon' 
      ? { forenoon: true } 
      : { afternoon: true };

    // Upsert attendance details
    const attendanceDetail = await prisma.attendanceDetail.upsert({
      where: { request_id: id },
      update: updateData,
      create: {
        request_id: id,
        date: originalRequest.from_time,
        forenoon: attendanceType === 'forenoon',
        afternoon: attendanceType === 'afternoon'
      }
    });

    // Optionally update the ODRequest attendance if both are marked
    const updatedAttendanceDetail = await prisma.attendanceDetail.findUnique({
      where: { request_id: id }
    });

    if (updatedAttendanceDetail.forenoon && updatedAttendanceDetail.afternoon) {
      await prisma.oDRequest.update({
        where: { id },
        data: { attendance: true }
      });
    }

    return NextResponse.json(attendanceDetail, { status: 200 });
  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}