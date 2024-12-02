import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
    try {
      // Add some detailed logging
      console.log('Attempting to fetch stayback users');
  
      const staybackUsers = await prisma.user.findMany({
        where: {
          counts: {
            stayback_cnt: {
              gt: 0 
            }
          }
        },
        include: {
          counts: true
        },
        orderBy: {
          counts: {
            stayback_cnt: 'desc'
          }
        }
      });
  
      // Add logging to see what's actually being returned
      console.log('Raw staybackUsers:', JSON.stringify(staybackUsers, null, 2));
  
      // More flexible data transformation
      const formattedUsers = staybackUsers.map(user => {
        console.log('Individual user:', JSON.stringify(user, null, 2));
        return {
          name: user.name,
          email: user.email,
          section: user.sec || user.section || 'N/A',
          year: user.year,
          register: user.register || 'N/A',
          stayback_cnt: user.counts?.stayback_cnt || 0
        };
      });
  
      console.log('Formatted users:', JSON.stringify(formattedUsers, null, 2));
  
      return NextResponse.json(formattedUsers);
    } catch (error) {
      console.error('Detailed error fetching stayback users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stayback users', details: error.message }, 
        { status: 500 }
      );
    } finally {
      await prisma.$disconnect();
    }
  }