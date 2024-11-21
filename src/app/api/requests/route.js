// src/app/api/requests/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

async function validateSession(session, requiredRole = null) {
  if (!session) {
    return { error: 'Unauthorized - Please login', status: 401 };
  }
  if (requiredRole && session.user.role !== requiredRole) {
    return { error: `Unauthorized - ${requiredRole} access required`, status: 403 };
  }
  return null;
}

async function updateUserCounts(prisma, userId, requestType) {
  // First get the user's email using the user_id
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: { email: true }
  });

  if (!user) return null;

  // Check if count record exists
  const existingCount = await prisma.count.findUnique({
    where: { email: user.email }
  });

  if (existingCount) {
    // Update existing count
    return await prisma.count.update({
      where: { email: user.email },
      data: {
        stayback_cnt: requestType === 'Stayback Request' 
          ? existingCount.stayback_cnt + 1 
          : existingCount.stayback_cnt,
        meeting_cnt: requestType === 'Meeting Request'
          ? existingCount.meeting_cnt + 1
          : existingCount.meeting_cnt
      }
    });
  } else {
    // Create new count record
    return await prisma.count.create({
      data: {
        email: user.email,
        stayback_cnt: requestType === 'Stayback Request' ? 1 : 0,
        meeting_cnt: requestType === 'Meeting Request' ? 1 : 0,
      }
    });
  }
}

export async function POST(request) {
  try {
    await ensureConnection();
    const session = await getServerSession(authOptions);
    
    const sessionError = await validateSession(session, 'TeamLead');
    if (sessionError) {
      return NextResponse.json({ message: sessionError.error }, { status: sessionError.status });
    }

    const { requests } = await request.json();

    const teamLead = await prisma.teamLead.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!teamLead) {
      return NextResponse.json(
        { message: 'TeamLead record not found' },
        { status: 403 }
      );
    }

    // Use transaction to ensure both request creation and count updates succeed
    const result = await prisma.$transaction(async (tx) => {
      const createdRequests = [];
      const updatedCounts = [];

      for (const request of requests) {
        // Create the request
        const createdRequest = await tx.oDRequest.create({
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
        });
        createdRequests.push(createdRequest);

        // Update counts if it's a stayback or meeting request
        if (['Stayback Request', 'Meeting Request'].includes(request.request_type)) {
          const updatedCount = await updateUserCounts(tx, request.user_id, request.request_type);
          if (updatedCount) {
            updatedCounts.push(updatedCount);
          }
        }
      }

      return { createdRequests, updatedCounts };
    });

    return NextResponse.json({
      message: 'Requests created and counts updated successfully',
      data: result.createdRequests,
      updatedCounts: result.updatedCounts
    });
  } catch (error) {
    console.error('Request creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create requests', error: error.message },
      { status: 500 }
    );
  }
}

// Get all OD requests
export async function GET(request) {
  try {
    await ensureConnection();
    const session = await getServerSession(authOptions);
    
    const sessionError = await validateSession(session);
    if (sessionError) {
      return NextResponse.json({ message: sessionError.error }, { status: sessionError.status });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    // Build where clause based on filters
    const where = {};
    if (status) where.status = parseInt(status);
    if (userId) where.user_id = userId;

    // Fetch requests with related user and teamLead data
    const requests = await prisma.oDRequest.findMany({
      where,
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
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error('Request fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch requests', error: error.message },
      { status: 500 }
    );
  }
}

// Update request status or attendance
export async function PATCH(request) {
  try {
    await ensureConnection();
    const session = await getServerSession(authOptions);
    
    const sessionError = await validateSession(session);
    if (sessionError) {
      return NextResponse.json({ message: sessionError.error }, { status: sessionError.status });
    }

    const { id, status, attendance } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Build update data based on what's provided
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (attendance !== undefined) updateData.attendance = attendance;

    const updatedRequest = await prisma.oDRequest.update({
      where: { id },
      data: updateData,
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
      message: 'Request updated successfully',
      data: updatedRequest
    });
  } catch (error) {
    console.error('Request update error:', error);
    return NextResponse.json(
      { message: 'Failed to update request', error: error.message },
      { status: 500 }
    );
  }
}