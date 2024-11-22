// app/api/staybacks/route.js
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

    const { team, title, date, students } = await req.json();

    // Create stayback
    const stayback = await prisma.stayback.create({
      data: {
        team,
        title,
        date,
        students
      }
    });

    // Update stayback count for selected students
    await Promise.all(students.map(async (email) => {
      await prisma.count.upsert({
        where: { email },
        update: { stayback_cnt: { increment: 1 } },
        create: { 
          email, 
          meeting_cnt: 0,
          stayback_cnt: 1 
        }
      });
    }));

    return NextResponse.json(stayback, { status: 201 });
  } catch (error) {
    console.error('Stayback creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create stayback', details: error.message }, 
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

    const staybacks = await prisma.stayback.findMany();
    return NextResponse.json(staybacks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch staybacks' }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
