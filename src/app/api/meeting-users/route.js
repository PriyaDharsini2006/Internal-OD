// src/app/api/meeting-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const meetingUsers = await prisma.user.findMany({
      where: {
        counts: {
          meeting_cnt: {
            gt: 0 
          }
        }
      },
      select: {
        name: true,
        email: true,
        counts: {
          select: {
            meeting_cnt: true
          }
        }
      },
      orderBy: {
        counts: {
          meeting_cnt: 'desc'
        }
      }
    });

    // Transform the data to match the component's expected structure
    const formattedUsers = meetingUsers.map(user => ({
      name: user.name,
      email: user.email,
      meeting_cnt: user.counts?.meeting_cnt || 0
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching meeting users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meeting users' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}