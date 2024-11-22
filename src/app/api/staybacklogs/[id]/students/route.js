// src/app/api/staybacklogs/[id]/students/route.js
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

    // Update the stayback with new student list
    const updatedStayback = await prisma.stayback.update({
      where: {
        id: id
      },
      data: {
        students: students
      }
    });

    // If adding a student, increment their stayback count
    if (action === 'add') {
      // Get the difference between old and new students
      const newStudents = students.filter(email => 
        !updatedStayback.students.includes(email)
      );

      // Update counts for new students
      await Promise.all(newStudents.map(email =>
        prisma.count.upsert({
          where: { email },
          update: {
            stayback_cnt: {
              increment: 1
            }
          },
          create: {
            email,
            stayback_cnt: 1,
            meeting_cnt: 0
          }
        })
      ));
    }

    // If removing a student, decrement their stayback count
    if (action === 'remove') {
      const removedStudents = updatedStayback.students.filter(email => 
        !students.includes(email)
      );

      await Promise.all(removedStudents.map(email =>
        prisma.count.update({
          where: { email },
          data: {
            stayback_cnt: {
              decrement: 1
            }
          }
        })
      ));
    }

    return NextResponse.json(updatedStayback);
  } catch (error) {
    console.error('Error in /api/staybacks/[id]/students:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}