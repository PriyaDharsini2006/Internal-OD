//api/requests/[id]/unreject/route.js
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Log the params to verify the ID
    console.log('Params:', params);
    const { id } = params;

    // Validate ID
    if (!id) {
      console.error('No ID provided');
      return NextResponse.json(
        { message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Attempt to update
    const updatedRequest = await prisma.oDRequest.update({
      where: { id: id }, // Explicitly use id parameter
      data: { 
        status: 0 // Change back to pending status
      }
    });

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error) {
    console.error('Detailed unreject error:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error', 
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}