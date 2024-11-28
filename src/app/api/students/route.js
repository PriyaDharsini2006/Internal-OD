// // app/api/students/route.js
// export const dynamic = 'force-dynamic';
// export const fetchCache = 'force-no-store';
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]/route';
// import prisma from '@/lib/prisma';

// export async function GET(request) {
//     try {
//         const session = await getServerSession(authOptions);
        
//         if (!session) {
//             return NextResponse.json(
//                 { message: 'Unauthorized' },
//                 { status: 401 }
//             );
//         }

//         const searchParams = request.nextUrl.searchParams;
//         const search = searchParams.get('search') || '';
//         const section = searchParams.get('section');
//         const year = searchParams.get('year');

//         console.log('Search parameters:', { search, section, year });

//         const where = {};
        
//         if (search) {
//             where.OR = [
//                 { name: { contains: search, mode: 'insensitive' } },
//                 { email: { contains: search, mode: 'insensitive' } },
//             ];
//         }
        
//         if (section && section !== 'all') {
//             where.sec = section;
//         }
        
//         if (year && year !== 'all') {
//             where.year = parseInt(year);
//         }

//         const students = await prisma.user.findMany({
//             where,
//             select: {
//                 id: true,
//                 user_id: true,
//                 name: true,
//                 email: true,
//                 sec: true,
//                 year: true
//             },
//             orderBy: {
//                 name: 'asc'
//             }
//         });

//         console.log(`Found ${students.length} students`);
//         return NextResponse.json(students);
        
//     } catch (error) {
//         console.error('Detailed error in /api/students:', {
//             message: error.message,
//             code: error.code,
//             stack: error.stack
//         });
        
//         return NextResponse.json(
//             { 
//                 message: 'Failed to fetch students',
//                 details: error.message
//             },
//             { status: 500 }
//         );
//     }
// }
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }
        
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const section = searchParams.get('section');
        const year = searchParams.get('year');
        
        console.log('Search parameters:', { search, section, year });
        
        const where = {};
        
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        
        if (section && section !== 'all') {
            where.sec = section;
        }
        
        if (year && year !== 'all') {
            where.year = parseInt(year);
        }
        
        const students = await prisma.user.findMany({
            where,
            select: {
                id: true,
                user_id: true,
                name: true,
                email: true,
                sec: true,
                year: true,
                register: true, // Add this line to include register column
                counts: {
                    select: {
                        stayback_cnt: true,
                        meeting_cnt: true,
                        email: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        console.log(`Found ${students.length} students`);
        return NextResponse.json(students);
        
    } catch (error) {
        console.error('Detailed error in /api/students:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        return NextResponse.json(
            {
                message: 'Failed to fetch students',
                details: error.message
            },
            { status: 500 }
        );
    }
}