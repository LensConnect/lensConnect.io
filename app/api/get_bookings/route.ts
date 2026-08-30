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


        return NextResponse.json({ data, error: '', status: 200, success: true });
    }
    catch (err) {
        return NextResponse.json({ error: 'Failed to fetch photographer', status: 500, success: false })
    }
}