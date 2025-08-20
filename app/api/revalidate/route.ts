import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token');
  
  if (token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  try {
    const { path, tag } = await request.json();
    
    if (path) {
      revalidatePath(path);
    }
    
    if (tag) {
      revalidateTag(tag);
    }
    
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to revalidate' }, 
      { status: 500 }
    );
  }
}