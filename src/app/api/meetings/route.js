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

    const { team, title, from_time, to_time, date, students, years } = await req.json();

    const meeting = await prisma.meeting.create({
      data: {
        team,
        title,
        from_time,
        to_time,
        date,
        students,
        years
      }
    });

    // Update student meeting counts
    await Promise.all(students.map(email => 
      prisma.count.upsert({
        where: { email },
        update: { meeting_cnt: { increment: 1 } },
        create: { 
          email, 
          meeting_cnt: 1,
          stayback_cnt: 0 
        }
      })
    ));

    await Promise.all(years.map(year =>
      prisma.meetingCnt.upsert({
        where: { year },
        update: { meetingCount: { increment: 1 } },
        create: { year, meetingCount: 1 }
      })
    ));

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    console.error('Meeting creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create meeting', details: error.message }, 
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

    const meetings = await prisma.meeting.findMany();
    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch meetings' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}