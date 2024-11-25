// api/attendance/[id]/route.js
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

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
    const { attendance } = await req.json();

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Update attendance
    const updatedRequest = await prisma.oDRequest.update({
      where: { id: id },
      data: { attendance }
    });

    return NextResponse.json(updatedRequest, { status: 200 });
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