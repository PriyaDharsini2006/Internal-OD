// src/app/api/staybacklogs/[id]/route.js
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const stayback = await prisma.stayback.findUnique({
      where: {
        id: id
      },
      include: {
        dateGroup: true
      }
    });

    if (!stayback) {
      return NextResponse.json(
        { message: 'Stayback not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stayback);
  } catch (error) {
    console.error('Error in /api/staybacks/[id]:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    // First, check if the stayback exists
    const existingStayback = await prisma.stayback.findUnique({
      where: { id: id }
    });

    if (!existingStayback) {
      return NextResponse.json(
        { message: 'Stayback not found' },
        { status: 404 }
      );
    }

    // Delete the stayback (this will cascade delete related dateGroups if set up in Prisma schema)
    const deletedStayback = await prisma.stayback.delete({
      where: { id: id }
    });

    return NextResponse.json(
      { 
        message: 'Stayback deleted successfully', 
        deletedStayback: deletedStayback 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting stayback:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

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
    const body = await request.json();

    // Validate input
    if (!body.title || body.title.trim() === '') {
      return NextResponse.json(
        { message: 'Title cannot be empty' },
        { status: 400 }
      );
    }

    // Check if the stayback exists
    const existingStayback = await prisma.stayback.findUnique({
      where: { id: id }
    });

    if (!existingStayback) {
      return NextResponse.json(
        { message: 'Stayback not found' },
        { status: 404 }
      );
    }

    // Update the stayback title
    const updatedStayback = await prisma.stayback.update({
      where: { id: id },
      data: {
        title: body.title.trim()
      },
      include: {
        dateGroup: true
      }
    });

    return NextResponse.json(updatedStayback, { status: 200 });
  } catch (error) {
    console.error('Error updating stayback:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}