import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req, res) {
    if (req.method === 'POST') {
      try {
        // Import Prisma dynamically to avoid global import issues
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
  
        // Truncate the ODRequest table
        await prisma.oDRequest.deleteMany({});
        
        res.status(200).json({ message: 'Table truncated successfully' });
      } catch (error) {
        console.error('Error truncating table:', error);
        res.status(500).json({ error: 'Failed to truncate table' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  }