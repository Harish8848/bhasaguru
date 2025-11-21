import { NextResponse } from 'next/server';

export class ApiResponse {
  static success<T>(data: T, message?: string, status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
      },
      { status }
    );
  }

  static error(message: string, status: number = 400, errors?: any) {
    return NextResponse.json(
      {
        success: false,
        message,
        errors,
      },
      { status }
    );
  }

  static unauthorized(message: string = 'Unauthorized') {
    return this.error(message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return this.error(message, 403);
  }

  static notFound(message: string = 'Not found') {
    return this.error(message, 404);
  }

  static serverError(message: string = 'Internal server error') {
    return this.error(message, 500);
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ) {
    return NextResponse.json({
      success: true,
      message,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  }
}
