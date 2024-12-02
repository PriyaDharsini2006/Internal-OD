export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { action, students } = await request.json();

    // Validate the request
    if (!action || !Array.isArray(students)) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Retrieve the current meeting to get the existing students
    const currentMeeting = await prisma.meeting.findUnique({
      where: { id: id }
    });

    if (!currentMeeting) {
      return NextResponse.json(
        { message: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Update the meeting with new student list
    const updatedMeeting = await prisma.meeting.update({
      where: { id: id },
      data: { students: students }
    });

    // Determine added and removed students
    const currentStudents = currentMeeting.students || [];
    const addedStudents = students.filter(email => !currentStudents.includes(email));
    const removedStudents = currentStudents.filter(email => !students.includes(email));

    // Update counts for added students
    if (addedStudents.length > 0) {
      await Promise.all(addedStudents.map(email =>
        prisma.count.upsert({
          where: { email },
          update: {
            meeting_cnt: { increment: 1 }
          },
          create: {
            email,
            meeting_cnt: 1,
            stayback_cnt: 0
          }
        })
      ));
    }

    // Update counts for removed students
    if (removedStudents.length > 0) {
      await Promise.all(removedStudents.map(async (email) => {
        const existingCount = await prisma.count.findUnique({
          where: { email }
        });

        if (existingCount && existingCount.meeting_cnt > 0) {
          await prisma.count.update({
            where: { email },
            data: {
              meeting_cnt: { decrement: 1 }
            }
          });
        }
      }));
    }

    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Error in /api/meetings/[id]/students:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}