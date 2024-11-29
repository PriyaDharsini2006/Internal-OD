//api/meetings/[id]/students/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meetingId = parseInt(params.id);
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId }
    });

    // Here you might want to fetch present students logic based on your requirements
    return NextResponse.json({ 
      presentStudents: meeting.students || [] 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch meeting students' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req, { params }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const meetingId = params.id; // Keep as string, don't use parseInt()
      const { students } = await req.json(); 
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId } // Use original meetingId
      });
  
      if (!meeting) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
  
      // Check for duplicate before adding
      const updatedStudents = meeting.students.includes(email) 
        ? meeting.students 
        : [...meeting.students, email];
  
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { students: updatedStudents }
      });
  
      return NextResponse.json({ students: updatedStudents });
    } catch (error) {
      console.error('Detailed error:', error);
      return NextResponse.json(
        { error: 'Failed to add student to meeting', details: error.message }, 
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }

  export async function DELETE(req, { params }) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const meetingId = params.id; // Keep as string
      const { email } = await req.json();
  
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId }
      });
  
      if (!meeting) {
        return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
      }
  
      const updatedStudents = meeting.students.filter(e => e !== email);
  
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { students: updatedStudents }
      });
  
      return NextResponse.json({ students: updatedStudents });
    } catch (error) {
      console.error('Detailed DELETE error:', error);
      return NextResponse.json(
        { error: 'Failed to remove student from meeting', details: error.message }, 
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }