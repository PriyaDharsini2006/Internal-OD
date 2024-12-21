//api/od-request/bulk-action/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { requestIds, action, from_time, to_time } = await request.json();

    // Validate input
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return NextResponse.json({ error: 'Invalid request IDs' }, { status: 400 });
    }

    // Verify that all selected requests have status 0 (pending)
    const pendingRequestsCount = await prisma.oDRequest.count({
      where: {
        id: { in: requestIds },
        status: 0
      }
    });

    if (pendingRequestsCount !== requestIds.length) {
      return NextResponse.json({ 
        error: 'Selected requests must all be in pending status' 
      }, { status: 400 });
    }

    let result;
    switch(action) {
      case 'approve':
        result = await prisma.oDRequest.updateMany({
          where: { id: { in: requestIds } },
          data: { 
            status: 1,  // Approved status
            attendance: true  // Set attendance to true when approved
          }
        });
        break;
      
      case 'reject':
        result = await prisma.oDRequest.updateMany({
          where: { id: { in: requestIds } },
          data: { 
            status: -1  // Rejected status
          }
        });
        break;
      
      case 'modify':
        if (!from_time || !to_time) {
          return NextResponse.json({ 
            error: 'From time and to time are required for modification' 
          }, { status: 400 });
        }
        
        // Create a full datetime by combining current date with provided times
        const createDateTime = (timeString) => {
          const [hours, minutes] = timeString.split(':');
          const now = new Date();
          now.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          return now;
        };

        result = await prisma.oDRequest.updateMany({
          where: { id: { in: requestIds } },
          data: {
            from_time: createDateTime(from_time),
            to_time: createDateTime(to_time)
          }
        });
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error processing bulk action:', error);
    return NextResponse.json({ 
      error: 'Failed to process bulk action', 
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}