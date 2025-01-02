import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingId = params.id;
    const result = await prisma.$transaction(async (tx) => {
      const meeting = await tx.meeting.findUnique({
        where: { id: meetingId },
        select: { students: true, years: true }
      });

      if (!meeting) {
        throw new Error('Meeting not found');
      }

      if (meeting.students?.length > 0) {
        await Promise.all(meeting.students.map(email => 
          tx.count.updateMany({
            where: { email, meeting_cnt: { gt: 0 } },
            data: { meeting_cnt: { decrement: 1 } }
          })
        ));
      }

      if (meeting.years?.length > 0) {
        for (const year of meeting.years) {
          await tx.meetingCnt.update({
            where: { year },
            data: { meetingCount: { decrement: 1 } }
          });
        }
      }

      return await tx.meeting.delete({
        where: { id: meetingId }
      });
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('Meeting deletion error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete meeting', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingId = params.id;
    const body = await req.json();
    const { title, date, from_time, to_time, team, years } = body;

    if (title && title.trim() === '') {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }

    // Get current meeting data before update
    const currentMeeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { years: true }
    });

    if (!currentMeeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    const updateData = {};
    if (title) updateData.title = title.trim();
    if (team) updateData.team = team.trim();
    if (years) updateData.years = years;
    if (date) updateData.date = new Date(date).toISOString();
    if (from_time) updateData.from_time = new Date(from_time).toISOString();
    if (to_time) updateData.to_time = new Date(to_time).toISOString();

    // Handle year count updates only if years are being modified
    if (years) {
      const yearsToRemove = currentMeeting.years.filter(y => !years.includes(y));
      const yearsToAdd = years.filter(y => !currentMeeting.years.includes(y));

      // Decrement count for removed years
      if (yearsToRemove.length > 0) {
        await Promise.all(yearsToRemove.map(year => 
          prisma.meetingCnt.update({
            where: { year },
            data: { meetingCount: { decrement: 1 } }
          })
        ));
      }

      // Increment count for added years
      if (yearsToAdd.length > 0) {
        await Promise.all(yearsToAdd.map(year => 
          prisma.meetingCnt.upsert({
            where: { year },
            create: { year, meetingCount: 1 },
            update: { meetingCount: { increment: 1 } }
          })
        ));
      }
    }

    const updatedMeeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: updateData
    });

    return NextResponse.json(updatedMeeting, { status: 200 });
  } catch (error) {
    console.error('Meeting update error:', error);
    return NextResponse.json(
      { error: 'Failed to update meeting', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}