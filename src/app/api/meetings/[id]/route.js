//api/meetings/[id]/route.js
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

    // Find the meeting to get the list of students before deleting
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      select: { students: true }
    });

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Decrement meeting count for associated students
    if (meeting.students && meeting.students.length > 0) {
      await Promise.all(meeting.students.map(async (email) => {
        await prisma.count.updateMany({
          where: { 
            email,
            meeting_cnt: { gt: 0 } // Ensure we don't go below 0
          },
          data: { 
            meeting_cnt: { decrement: 1 } 
          }
        });
      }));
    }
    

    // Delete the meeting
    const deletedMeeting = await prisma.meeting.delete({
      where: { id: meetingId }
    });

    return NextResponse.json(deletedMeeting, { status: 200 });
  } catch (error) {
    console.error('Meeting deletion error:', error);
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
    const { title, date, from_time, to_time, team } = body;

    // Validate input
    if (title && title.trim() === '') {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 });
    }

    // Create update data object with only provided fields
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (team) updateData.team = team.trim();

    // Convert date strings to proper ISO datetime format
    if (date) {
      updateData.date = new Date(date).toISOString();
    }
    if (from_time) {
      updateData.from_time = new Date(from_time).toISOString();
    }
    if (to_time) {
      updateData.to_time = new Date(to_time).toISOString();
    }

    // Update the meeting
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