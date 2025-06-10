

// NextJS route definition: GET
import { NextResponse } from 'next/server';
import { parseItemsFromCSVWithAI } from '@/utils/import/parseCsvWithAI';
 // TODO: ACTUALLY DO IT
// define the route handler
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const csvString = url.searchParams.get('csv');
    
    if (!csvString) {
      return NextResponse.json({ error: 'CSV parameter is required' }, { status: 400 });
    }

    const items = await parseItemsFromCSVWithAI(csvString);
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error parsing CSV:', error);
    return NextResponse.json({ error: 'Failed to parse CSV' }, { status: 500 });
  }
}