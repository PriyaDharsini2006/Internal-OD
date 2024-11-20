// src/app/api/requests/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'TeamLead') {
      return NextResponse.json(
        { message: 'Unauthorized - Team Lead access required' },
        { status: 401 }
      );
    }

    const { requests } = await request.json();

    // Get TeamLead ID
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

    // Process all requests in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      const createdRequests = [];

      for (const request of requests) {
        // Create the OD request
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

        // Update counts for Stayback and Meeting requests
        if (request.request_type === 'Stayback Request' || request.request_type === 'Meeting Request') {
          // Get user email
          const user = await tx.user.findUnique({
            where: { user_id: request.user_id },
            select: { email: true }
          });

          if (!user) {
            throw new Error(`User not found for user_id: ${request.user_id}`);
          }

          // Determine which count to increment
          const countField = request.request_type === 'Stayback Request' ? 'stayback_cnt' : 'meeting_cnt';

          // Update or create count record
          await tx.count.upsert({
            where: { email: user.email },
            create: {
              email: user.email,
              [countField]: 1,
              [countField === 'stayback_cnt' ? 'meeting_cnt' : 'stayback_cnt']: 0
            },
            update: {
              [countField]: {
                increment: 1
              }
            },
          });
        }
      }

      return createdRequests;
    });

    return NextResponse.json({
      message: 'Requests created successfully',
      data: result
    });

  } catch (error) {
    console.error('Request creation error:', error);
    return NextResponse.json(
      { message: 'Failed to create requests', error: error.message },
      { status: 500 }
    );
  } finally {
    // No need to handle connection management as it's handled by the shared prisma instance
  }
}