import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Extract team from query parameters
    const { searchParams } = new URL(request.url);
    const team = searchParams.get('team');

    if (!team) {
      return NextResponse.json(
        { message: 'Team parameter is required' },
        { status: 400 }
      );
    }

    // Find all staybacks for the specific team
    const teamStaybacks = await prisma.stayback.findMany({
      where: { team: team }
    });

    // Create a map to track student stayback counts for this specific team
    const studentStaybackCounts = new Map();

    // Count staybacks for each student only for this specific team
    teamStaybacks.forEach(stayback => {
      stayback.students.forEach(email => {
        const currentCount = studentStaybackCounts.get(email) || 0;
        studentStaybackCounts.set(email, currentCount + 1);
      });
    });

    // Fetch user details for students with stayback counts in this team
    const studentDetails = await Promise.all(
      Array.from(studentStaybackCounts.entries()).map(async ([email, staybackCount]) => {
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            name: true,
            email: true,
            register: true,
            sec: true
          }
        });

        return {
          ...user,
          stayback_count: staybackCount,
          section: user?.sec
        };
      })
    );

    // Filter out students with zero staybacks for this team
    const filteredStudentDetails = studentDetails
      .filter(student => student !== null && student.stayback_count > 0)
      .sort((a, b) => b.stayback_count - a.stayback_count);

    return NextResponse.json(filteredStudentDetails);
  } catch (error) {
    console.error('Error fetching team student stayback counts:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';