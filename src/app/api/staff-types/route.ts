import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = 'http://52.63.153.21:3000';

// GET - Fetch all staff types from backend
export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/staff-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to fetch staff types' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching staff types:', error);
    return NextResponse.json(
      { message: 'Failed to fetch staff types', error },
      { status: 500 }
    );
  }
}

// POST - Create a new staff type on backend
export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${API_URL}/staff-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to create staff type' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating staff type:', error);
    return NextResponse.json(
      { message: 'Failed to create staff type', error },
      { status: 500 }
    );
  }
}

// PUT - Update a staff type on backend
export async function PUT(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { message: 'Staff type ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/staff-types/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || 'Failed to update staff type' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating staff type:', error);
    return NextResponse.json(
      { message: 'Failed to update staff type', error },
      { status: 500 }
    );
  }
}

// DELETE - Delete a staff type on backend
export async function DELETE(request: NextRequest) {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Staff type ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/staff-types/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to delete staff type' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error deleting staff type:', error);
    return NextResponse.json(
      { message: 'Failed to delete staff type', error },
      { status: 500 }
    );
  }
}
