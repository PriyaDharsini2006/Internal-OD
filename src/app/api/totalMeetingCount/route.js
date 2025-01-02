import prisma  from '@/lib/prisma'

export async function GET(req) {
  try {
    const searchParams = new URL(req.url).searchParams
    const year = parseInt(searchParams.get('year'))

    if (!year) {
      return new Response(JSON.stringify({ error: 'Year parameter is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const meetingCount = await prisma.meetingCnt.findUnique({
      where: { year },
      select: { meetingCount: true }
    })

    return new Response(JSON.stringify({ meetingCount: meetingCount?.meetingCount || 0 }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch meeting count' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}