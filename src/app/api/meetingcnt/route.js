//api/meetingcnt/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
      // Add some detailed logging
      console.log('Attempting to fetch meeting users');
  
      const meetingUsers = await prisma.user.findMany({
        where: {
          counts: {
            meeting_cnt: {
              gt: 0 
            }
          }
        },
        // Try using include instead of select
        include: {
          counts: true
        },
        orderBy: {
          counts: {
            meeting_cnt: 'desc'
          }
        }
      });
  
      // Add logging to see what's actually being returned
      console.log('Raw meetingUsers:', JSON.stringify(meetingUsers, null, 2));
  
      // More flexible data transformation
      const formattedUsers = meetingUsers.map(user => {
        console.log('Individual user:', JSON.stringify(user, null, 2));
        return {
          name: user.name,
          email: user.email,
          section: user.sec || user.section || 'N/A',
          year: user.year,
          register: user.register || 'N/A',
          meeting_cnt: user.counts?.meeting_cnt || 0
        };
      });
  
      console.log('Formatted users:', JSON.stringify(formattedUsers, null, 2));
  
      return NextResponse.json(formattedUsers);
    } catch (error) {
      console.error('Detailed error fetching meeting users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch meeting users', details: error.message }, 
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }