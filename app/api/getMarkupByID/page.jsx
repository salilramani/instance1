import { NextResponse } from 'next/server';
import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  console.log('Fetching data for ID:', id);

  try {
    const query = 'SELECT markup_url FROM users WHERE id = $1';
    const values = [id];
    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Markup not found' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (error) {
    console.error('Error fetching markup URL:', error);
    return NextResponse.json({ error: 'Error fetching markup URL' }, { status: 500 });
  }
}