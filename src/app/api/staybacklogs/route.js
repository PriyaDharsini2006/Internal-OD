// src/app/api/staybacklogs/route.js
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all staybacks grouped by date
    const staybackDates = await prisma.staybackDate.findMany({
      include: {
        staybacks: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(staybackDates || []);
  } catch (error) {
    console.error('Error in /api/staybacks:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
