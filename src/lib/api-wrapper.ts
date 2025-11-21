import { NextRequest, NextResponse } from 'next/server';

export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error: any) {
      console.error('API Error:', error);

      // Handle different types of errors
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (error.message === 'Forbidden: Admin access required') {
        return NextResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 }
        );
      }

      if (error.message === 'Forbidden: Moderator access required') {
        return NextResponse.json(
          { success: false, message: 'Forbidden' },
          { status: 403 }
        );
      }

      // Default error response
      return NextResponse.json(
        { success: false, message: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
