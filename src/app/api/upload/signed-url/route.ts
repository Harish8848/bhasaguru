import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateSignedUploadUrl } from '@/lib/cloudinary-upload';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'bhasaguru';

    const signedData = generateSignedUploadUrl(folder);

    return NextResponse.json({
      success: true,
      data: signedData,
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    return NextResponse.json(
      { error: 'Failed to generate signed URL' },
      { status: 500 }
    );
  }
}