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
            
            // Fetch CoreTeam and Team emails
            const coreTeamEmails = await prisma.coreTeam.findMany({
                select: { email: true }
            });
            const teamLeadEmails = await prisma.team.findMany({
                select: { email: true }
            });
    
            const coreTeamSet = new Set(coreTeamEmails.map(item => item.email));
            const teamLeadSet = new Set(teamLeadEmails.map(item => item.email));
            
            const students = await prisma.user.findMany({
                where,
                select: {
                    id: true,
                    user_id: true,
                    name: true,
                    email: true,
                    sec: true,
                    year: true,
                    register: true,
                },
                orderBy: {
                    name: 'asc'
                }
            });
            
            // Count meetings and staybacks for each student
            const studentsWithCounts = await Promise.all(students.map(async (student) => {
                const meetingCount = await prisma.meeting.count({
                    where: {
                        students: {
                            has: student.email
                        }
                    }
                });
    
                const staybackCount = await prisma.stayback.count({
                    where: {
                        students: {
                            has: student.email
                        }
                    }
                });
                
                return {
                    ...student,
                    counts: {
                        meeting_cnt: meetingCount,
                        stayback_cnt: staybackCount
                    },
                    roles: {
                        isCoreLead: coreTeamSet.has(student.email),
                        isTeamLead: teamLeadSet.has(student.email)
                    }
                };
            }));
            
            return NextResponse.json(studentsWithCounts);
            
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