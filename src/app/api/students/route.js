// app/api/students/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Get search parameters
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';
        const section = searchParams.get('section');
        const year = searchParams.get('year');

        // Build where clause
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
                user_id: true,  // Include user_id as it's needed for requests
                name: true,
                email: true,
                sec: true,
                year: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        return NextResponse.json(
            { message: 'Failed to fetch students', error: error.message },
            { status: 500 }
        );
    }
}