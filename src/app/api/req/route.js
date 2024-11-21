import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    await prisma.$connect();
    isConnected = true;
  }
}

export async function GET(request) {
  try {
    await ensureConnection();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Build where clause based on status
    const where = status ? { status: parseInt(status) } : {};

    // Fetch approved requests with related user data
    const requests = await prisma.oDRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            sec: true,
            year: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ 
      data: requests,
      message: 'Requests fetched successfully'
    });
  } catch (error) {
    console.error('Static request fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch requests', error: error.message },
      { status: 500 }
    );
  }
}