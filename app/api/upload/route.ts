import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { generateUploadURL } from '@/lib/s3';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { fileName, contentType } = await req.json();
    
    const { uploadURL, key } = await generateUploadURL(fileName, contentType);
    
    return NextResponse.json({ uploadURL, key });
  } catch (error) {
    console.log("[UPLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 