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

    // Find all meetings for the specific team
    const teamMeetings = await prisma.meeting.findMany({
      where: { team: team }
    });

    // Create a map to track student meeting counts for this specific team
    const studentMeetingCounts = new Map();

    // Count meetings for each student only for this specific team
    teamMeetings.forEach(meeting => {
      meeting.students.forEach(email => {
        const currentCount = studentMeetingCounts.get(email) || 0;
        studentMeetingCounts.set(email, currentCount + 1);
      });
    });

    // Fetch user details for students with meeting counts in this team
    const studentDetails = await Promise.all(
      Array.from(studentMeetingCounts.entries()).map(async ([email, meetingCount]) => {
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            name: true,
            email: true,
            register: true,
            year: true,
            sec: true
          }
        });

        return {
          ...user,
          meeting_count: meetingCount,
          section: user?.sec // Renamed to match the component
        };
      })
    );

    // Filter out students with zero meetings for this team
    const filteredStudentDetails = studentDetails
      .filter(student => student !== null && student.meeting_count > 0)
      .sort((a, b) => b.meeting_count - a.meeting_count);

    return NextResponse.json(filteredStudentDetails);
  } catch (error) {
    console.error('Error fetching team student meeting counts:', error);
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