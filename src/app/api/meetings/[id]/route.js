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
