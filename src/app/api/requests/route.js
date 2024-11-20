// src/app/api/requests/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Create a single PrismaClient instance to be reused
const prisma = new PrismaClient();

// Initialize outside of handler to prevent multiple instances
let isConnected = false;

export async function POST(request) {
  try {
    // Connect only if not already connected
    if (!isConnected) {
      await prisma.$connect();
      isConnected = true;
    }

    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TeamLead') {
      return NextResponse.json(
        { message: 'Unauthorized - Team Lead access required' },
        { status: 401 }
      );
    }

    const { requests } = await request.json();

    // Get TeamLead ID - add select to optimize query
    const teamLead = await prisma.teamLead.findUnique({
      where: { email: session.user.email },
      select: { id: true }  // Only select what we need
    });

    if (!teamLead) {
      return NextResponse.json(
        { message: 'TeamLead record not found' },
        { status: 403 }
      );
    }

    const createdRequests = await prisma.$transaction(
      requests.map(request => 
        prisma.oDRequest.create({
          data: {
            user_id: request.user_id,
            reason: request.reason,
            description: request.description,
            teamlead_id: teamLead.id,
            from_time: request.from_time,
            to_time: request.to_time,
            request_type: request.request_type,
            status: 0,
          },
        })
      )
    );

    return NextResponse.json({
      message: 'Requests created successfully',
      data: createdRequests
    });
  } catch (error) {
    console.error('Request creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create requests', error: error.message },
      { status: 500 }
    );
  }
}
