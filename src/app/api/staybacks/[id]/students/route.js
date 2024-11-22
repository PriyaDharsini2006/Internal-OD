// app/api/staybacks/[id]/students/route.js
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

    const staybackId = params.id;
    const stayback = await prisma.stayback.findUnique({
      where: { id: staybackId }
    });

    return NextResponse.json({ 
      presentStudents: stayback.students || [] 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stayback students' }, 
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

    const staybackId = params.id;
    const { email } = await req.json();

    const stayback = await prisma.stayback.findUnique({
      where: { id: staybackId }
    });

    if (!stayback) {
      return NextResponse.json({ error: 'Stayback not found' }, { status: 404 });
    }

    const updatedStudents = stayback.students.includes(email)
      ? stayback.students
      : [...stayback.students, email];

    await prisma.stayback.update({
      where: { id: staybackId },
      data: { students: updatedStudents }
    });

    return NextResponse.json({ students: updatedStudents });
  } catch (error) {
    console.error('Detailed error:', error);
    return NextResponse.json(
      { error: 'Failed to add student to stayback', details: error.message },
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

    const staybackId = params.id;
    const { email } = await req.json();

    const stayback = await prisma.stayback.findUnique({
      where: { id: staybackId }
    });

    if (!stayback) {
      return NextResponse.json({ error: 'Stayback not found' }, { status: 404 });
    }

    const updatedStudents = stayback.students.filter(e => e !== email);

    await prisma.stayback.update({
      where: { id: staybackId },
      data: { students: updatedStudents }
    });

    return NextResponse.json({ students: updatedStudents });
  } catch (error) {
    console.error('Detailed DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove student from stayback', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}