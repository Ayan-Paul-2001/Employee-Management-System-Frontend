import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    const headersList = headers();
    const authorization = headersList.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authorization.split(' ')[1];
    
    // For demo purposes, return user based on token
    // In a real app, you would validate the token and fetch user from database
    if (token === 'demo-token-12345') {
      return NextResponse.json({
        id: 1,
        fullName: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      });
    } else if (token === 'demo-token-67890') {
      return NextResponse.json({
        id: 2,
        fullName: 'Regular User',
        email: 'user@example.com',
        role: 'employee'
      });
    }
    
    return NextResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}