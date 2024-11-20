// // src/app/api/requests/route.js
// import { NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// // Create a single PrismaClient instance to be reused
// const prisma = new PrismaClient();

// // Initialize outside of handler to prevent multiple instances
// let isConnected = false;

// export async function POST(request) {
//   try {
//     // Connect only if not already connected
//     if (!isConnected) {
//       await prisma.$connect();
//       isConnected = true;
//     }

//     const session = await getServerSession(authOptions);
    
//     if (!session || session.user.role !== 'TeamLead') {
//       return NextResponse.json(
//         { message: 'Unauthorized - Team Lead access required' },
//         { status: 401 }
//       );
//     }

//     const { requests } = await request.json();

//     // Get TeamLead ID - add select to optimize query
//     const teamLead = await prisma.teamLead.findUnique({
//       where: { email: session.user.email },
//       select: { id: true }  // Only select what we need
//     });

//     if (!teamLead) {
//       return NextResponse.json(
//         { message: 'TeamLead record not found' },
//         { status: 403 }
//       );
//     }

//     const createdRequests = await prisma.$transaction(
//       requests.map(request => 
//         prisma.oDRequest.create({
//           data: {
//             user_id: request.user_id,
//             reason: request.reason,
//             description: request.description,
//             teamlead_id: teamLead.id,
//             from_time: request.from_time,
//             to_time: request.to_time,
//             request_type: request.request_type,
//             status: 0,
//           },
//         })
//       )
//     );

//     return NextResponse.json({
//       message: 'Requests created successfully',
//       data: createdRequests
//     });
//   } catch (error) {
//     console.error('Request creation error:', error);
//     return NextResponse.json(
//       { message: 'Failed to create requests', error: error.message },
//       { status: 500 }
//     );
//   }
// }
// src/app/api/requests/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();
let isConnected = false;

// Helper function to ensure database connection
async function ensureConnection() {
  if (!isConnected) {
    await prisma.$connect();
    isConnected = true;
  }
}

// Helper function to validate session
async function validateSession(session, requiredRole = null) {
  if (!session) {
    return { error: 'Unauthorized - Please login', status: 401 };
  }
  if (requiredRole && session.user.role !== requiredRole) {
    return { error: `Unauthorized - ${requiredRole} access required`, status: 403 };
  }
  return null;
}

// Create new OD requests (existing POST endpoint)
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