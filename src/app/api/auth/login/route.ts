import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // For demo purposes, hardcoded credentials
    // In a real app, you would validate against a database
    if (email === 'admin@example.com' && password === 'password') {
      return NextResponse.json({
        user: {
          id: 1,
          fullName: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        },
        accessToken: 'demo-token-12345'
      }, { status: 200 });
    } else if (email === 'user@example.com' && password === 'password') {
      return NextResponse.json({
        user: {
          id: 2,
          fullName: 'Regular User',
          email: 'user@example.com',
          role: 'employee'
        },
        accessToken: 'demo-token-67890'
      }, { status: 200 });
    }

    // If credentials don't match
    return NextResponse.json(
      { message: 'Invalid email or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}