// app/api/students/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, sec, year } = await req.json();

    // Create student (User)
    const student = await prisma.user.create({
      data: {
        user_id: email.split('@')[0], // Generate user_id from email
        name,
        email,
        sec,
        year
      }
    });

    // Optionally create a Count record for the student
    await prisma.count.create({
      data: {
        email,
        stayback_cnt: 0,
        meeting_cnt: 0
      }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error('Student creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create student', details: error.message }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const students = await prisma.user.findMany({
      include: {
        counts: true // Optional: include associated count data
      }
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error('Students fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students', details: error.message }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}