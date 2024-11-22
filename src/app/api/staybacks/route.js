// app/api/staybacks/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { team, title, date, students } = await req.json();
    
    // First, find or create the StaybackDate for the given date
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const staybackDate = await prisma.staybackDate.upsert({
      where: {
        date: dateStart
      },
      update: {},
      create: {
        date: dateStart
      }
    });

    // Create stayback with the dateGroup relation
    const stayback = await prisma.stayback.create({
      data: {
        team,
        title,
        dateGroupId: staybackDate.id,
        students
      },
      include: {
        dateGroup: true
      }
    });

    // Update stayback count for selected students
    await Promise.all(students.map(async (email) => {
      await prisma.count.upsert({
        where: { email },
        update: { stayback_cnt: { increment: 1 } },
        create: { 
          email, 
          meeting_cnt: 0,
          stayback_cnt: 1 
        }
      });
    }));

    return NextResponse.json(stayback, { status: 201 });
  } catch (error) {
    console.error('Stayback creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create stayback', details: error.message }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const staybacks = await prisma.stayback.findMany({
      include: {
        dateGroup: true
      },
      orderBy: {
        dateGroup: {
          date: 'desc'
        }
      }
    });

    // Group staybacks by date
    const groupedStaybacks = staybacks.reduce((acc, stayback) => {
      const date = stayback.dateGroup.date.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(stayback);
      return acc;
    }, {});

    return NextResponse.json(groupedStaybacks);
  } catch (error) {
    console.error('Stayback fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch staybacks', details: error.message }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}