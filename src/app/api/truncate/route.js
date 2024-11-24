import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Handle GET request for cron-job.org
export async function GET(request) {
  try {
    const prisma = new PrismaClient();
    
    // Truncate the ODRequest table
    await prisma.oDRequest.deleteMany({});
    
    // Disconnect from Prisma client
    await prisma.$disconnect();
    
    return NextResponse.json(
      { message: 'Table truncated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error truncating table:', error);
    return NextResponse.json(
      { error: 'Failed to truncate table', details: error.message },
      { status: 500 }
    );
  }
}

// Keep POST method as an alternative
export async function POST(request) {
  try {
    const prisma = new PrismaClient();
    
    // Truncate the ODRequest table
    await prisma.oDRequest.deleteMany({});
    
    // Disconnect from Prisma client
    await prisma.$disconnect();
    
    return NextResponse.json(
      { message: 'Table truncated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error truncating table:', error);
    return NextResponse.json(
      { error: 'Failed to truncate table', details: error.message },
      { status: 500 }
    );
  }
}