// src/app/api/user/[user_id]/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: params.user_id },
      select: { name: true, email: true }
    });

    return NextResponse.json(user || { name: 'Unknown', email: '' });
  } catch (error) {
    return NextResponse.json(
      { message: 'User not found', error: error.message },
      { status: 404 }
    );
  }
}
