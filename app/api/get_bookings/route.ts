import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/app/src';
import { booking } from '@/app/src/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('photographerId') || searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'No photographer with this id found', status: 404, success: false });
        }

        const [data] = await db.execute(sql`
            SELECT b.*, u.fullname as client_name
            FROM booking b
            LEFT JOIN users u ON b.clientId = u.id
            WHERE b.photographerId = ${id}
        `);

        if (!Array.isArray(data)) {
            return NextResponse.json([]);
        }


        const bookingResult = data.map((booking) => ({
            id: booking.id,
            clientId: booking.clientId,
            photographerId: booking.photographerId,
            startTime: booking.startTime,
            startDate: booking.startDate,
            durationHours: booking.durationHours,
            status: booking.status,
            totalPrice: booking.totalPrice,
            type: booking.type,
            location: booking.location,
            messages: booking.messages,
            created_at: booking.createdAt,
            client_name: booking.client_name,
        }))


        return NextResponse.json({ data: bookingResult, error: '', status: 200, success: true });
    }
    catch (err) {
        return NextResponse.json({ error: 'Failed to fetch photographer', status: 500, success: false })
    }
}