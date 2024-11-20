import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
      // Check if request body exists
      if (!request.body) {
        console.error('No request body');
        return NextResponse.json({ error: 'No request body' }, { status: 400 });
      }
  
      // Log request headers and content type
      const contentType = request.headers.get('content-type');
      console.log('Content-Type:', contentType);
  
      // Try to parse the request body with error handling
      let requestBody;
      try {
        requestBody = await request.text(); // First try to get raw text
        console.log('Raw request body:', requestBody);
        
        // Then parse the text as JSON
        requestBody = JSON.parse(requestBody);
      } catch (parseError) {
        console.error('Parsing error:', parseError);
        return NextResponse.json({ 
          error: 'Failed to parse request body', 
          details: parseError.message 
        }, { status: 400 });
      }
  
      // Validate parsed request body
      if (!requestBody) {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
  
      const { requestIds, action, from_time, to_time } = requestBody;
  
      // Log parsed payload
      console.log('Parsed payload:', JSON.stringify(requestBody, null, 2));
  
      // Existing validation and processing logic...
      if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
        return NextResponse.json({ error: 'Invalid request IDs' }, { status: 400 });
      }
  
      switch(action) {
        case 'approve':
          return await bulkApproveRequests(requestIds);
        case 'reject':
          return await bulkRejectRequests(requestIds);
        case 'modify':
          if (!from_time || !to_time) {
            return NextResponse.json({ error: 'From and to times are required for modify action' }, { status: 400 });
          }
          return await modifyRequestTimings(requestIds, from_time, to_time);
        default:
          return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return NextResponse.json({ 
        error: 'Failed to process bulk action', 
        details: error.message 
      }, { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }

// Bulk approve requests
async function bulkApproveRequests(requestIds) {
  const approvedRequests = await prisma.oDRequest.updateMany({
    where: {
      id: { in: requestIds.map(id => parseInt(id)) }
    },
    data: {
      status: 1  // Approved status
    }
  });

  return NextResponse.json(approvedRequests, { status: 200 });
}

// Bulk reject requests
async function bulkRejectRequests(requestIds) {
  const rejectedRequests = await prisma.oDRequest.updateMany({
    where: {
      id: { in: requestIds.map(id => parseInt(id)) }
    },
    data: {
      status: -1  // Rejected status
    }
  });

  return NextResponse.json(rejectedRequests, { status: 200 });
}

// Modify request timings
async function modifyRequestTimings(requestIds, from_time, to_time) {
  const updatedRequests = await prisma.oDRequest.updateMany({
    where: {
      id: { in: requestIds.map(id => parseInt(id)) }
    },
    data: {
      from_time: new Date(from_time),
      to_time: new Date(to_time)
    }
  });

  return NextResponse.json(updatedRequests, { status: 200 });
}