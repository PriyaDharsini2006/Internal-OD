// src/app/api/meeting-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Fetch users with their meeting count, sorted by count in descending order
    const stayUsers = await prisma.user.findMany({
      where: {
        counts: {
            stayback_cnt: {
            gt: 0 // Only users with meeting count > 0
          }
        }
      },
      select: {
        name: true,
        email: true,
        counts: {
          select: {
            stayback_cnt: true
          }
        }
      },
      orderBy: {
        counts: {
            stayback_cnt: 'desc'
        }
      }
    });

    // Transform the data to match the component's expected structure
    const formattedUsers = stayUsers.map(user => ({
      name: user.name,
      email: user.email,
      stayback_cnt: user.counts?.stayback_cnt || 0
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
