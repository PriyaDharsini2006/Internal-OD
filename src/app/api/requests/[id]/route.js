// src/app/api/requests/[id]/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();
let isConnected = false;

// Get specific request by ID
export async function GET(request, { params }) {
  try {
    if (!isConnected) {
      await prisma.$connect();
      isConnected = true;
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    const odRequest = await prisma.oDRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            sec: true,
            year: true
          }
        },
        request_by: {
          select: {
            email: true
          }
        }
      }
    });

    if (!odRequest) {
      return NextResponse.json(
        { message: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: odRequest });
  } catch (error) {
    console.error('Request fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch request', error: error.message },
      { status: 500 }
    );
  }
}

// Update attendance for specific request
export async function PATCH(request, { params }) {
  try {
    if (!isConnected) {
      await prisma.$connect();
      isConnected = true;
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { attendance } = await request.json();

    const updatedRequest = await prisma.oDRequest.update({
      where: { id },
      data: { attendance },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Attendance updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Attendance update error:', error);
    return NextResponse.json(
      { message: 'Failed to update attendance', error: error.message },
      { status: 500 }
    );
  }
}