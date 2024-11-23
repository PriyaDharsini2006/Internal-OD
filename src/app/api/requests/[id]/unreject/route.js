import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const prisma = new PrismaClient();
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    await prisma.$connect();
    isConnected = true;
  }
}

export async function PATCH(request, { params }) {
  try {
    await ensureConnection();

    // Extract request ID from URL params
    const requestId = params.id;

    // Update request status to 0 (active/pending)
    const updatedRequest = await prisma.oDRequest.update({
      where: { id: requestId },
      data: { 
        status: 0 
      },
      include: {
        user: {
          select: {
            name: true,
            sec: true,
            year: true
          }
        }
      }
    });

    return NextResponse.json({ 
      data: updatedRequest,
      message: 'Request successfully unrejected'
    });
  } catch (error) {
    console.error('Unreject request error:', error);
    return NextResponse.json(
      { message: 'Failed to unreject request', error: error.message },
      { status: 500 }
    );
  }
}