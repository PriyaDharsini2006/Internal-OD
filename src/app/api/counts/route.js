import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json(
          { message: 'Unauthorized' },
          { status: 401 }
        );
      }
  
      // Add logging to debug prisma connection
      console.log('Attempting to fetch counts...');
      
      const counts = await prisma.count.findMany({
        select: {
          email: true,
          stayback_cnt: true,
          meeting_cnt: true,
        },
      });
      
      console.log('Counts fetched:', counts);
      
      // Always return an array, even if empty
      return NextResponse.json(counts || []);
      
    } catch (error) {
      console.error('Detailed error in /api/counts:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      return NextResponse.json(
        { 
          message: 'Internal server error',
          details: error.message
        },
        { status: 500 }
      );
    }
  }