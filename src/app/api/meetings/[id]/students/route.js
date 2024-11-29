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

    // Update the meeting with new student list
    const updatedMeeting = await prisma.meeting.update({
      where: {
        id: id
      },
      data: {
        students: students
      }
    });

    // If adding a student, increment their meeting count
    if (action === 'add') {
      // Get the difference between old and new students
      const newStudents = students.filter(email => 
        !updatedMeeting.students.includes(email)
      );

      // Update counts for new students
      await Promise.all(newStudents.map(email =>
        prisma.count.upsert({
          where: { email },
          update: {
            meeting_cnt: {
              increment: 1
            }
          },
          create: {
            email,
            meeting_cnt: 1,
            stayback_cnt: 0
          }
        })
      ));
    }

    // If removing a student, decrement their meeting count
    if (action === 'remove') {
      const removedStudents = updatedMeeting.students.filter(email => 
        !students.includes(email)
      );
    
      console.log('Removed students:', removedStudents);
    
      if (removedStudents.length > 0) {
        await Promise.all(removedStudents.map(async (email) => {
          try {
            await prisma.count.update({
              where: { email },
              data: {
                meeting_cnt: {
                  decrement: 1
                }
              }
            });
          } catch (updateError) {
            console.error(`Failed to update count for ${email}:`, updateError);
          }
        }));
      }
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