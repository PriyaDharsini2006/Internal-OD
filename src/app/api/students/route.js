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
        const [coreTeamEmails, teamLeadEmails, meetingCounts, staybackCounts] = await Promise.all([
            prisma.coreTeam.findMany({ select: { email: true } }),
            prisma.team.findMany({ select: { email: true } }),
            prisma.meeting.groupBy({
                by: ['students'],
                _count: { students: true }
            }),
            prisma.stayback.groupBy({
                by: ['students'],
                _count: { students: true }
            })
        ]);

        const coreTeamSet = new Set(coreTeamEmails.map(item => item.email));
        const teamLeadSet = new Set(teamLeadEmails.map(item => item.email));

        // Convert grouped counts to a more usable format
        const meetingCountMap = meetingCounts.reduce((acc, group) => {
            group.students.forEach(email => {
                acc[email] = (acc[email] || 0) + group._count.students;
            });
            return acc;
        }, {});

        const staybackCountMap = staybackCounts.reduce((acc, group) => {
            group.students.forEach(email => {
                acc[email] = (acc[email] || 0) + group._count.students;
            });
            return acc;
        }, {});

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

        // Add counts and roles to students
        const studentsWithCounts = students.map(student => ({
            ...student,
            counts: {
                meeting_cnt: meetingCountMap[student.email] || 0,
                stayback_cnt: staybackCountMap[student.email] || 0
            },
            roles: {
                isCoreLead: coreTeamSet.has(student.email),
                isTeamLead: teamLeadSet.has(student.email)
            }
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