import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TeamLead') {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const requests = await prisma.oDRequest.findMany({
      where: { 
        status: parseInt(status || '0') 
      },
      include: {
        user: true,
        attendance_detail: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ 
      data: requests,
      message: 'Requests fetched successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch requests error:', error);
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}