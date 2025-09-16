import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, role } = body;

    // Validate required fields
    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // For demo purposes, just return success
    // In a real app, you would save to a database
    return NextResponse.json({
      user: {
        id: Math.floor(Math.random() * 1000) + 3, // Random ID
        fullName,
        email,
        role
      },
      message: 'Registration successful'
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}