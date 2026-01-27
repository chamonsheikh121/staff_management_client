import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = 'http://localhost:5000';

// GET - Fetch all services from backend
export async function GET() {
  try {
    const token = cookies().get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/services`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to fetch services' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { message: 'Failed to fetch services', error },
      { status: 500 }
    );
  }
}

// POST - Create a new service on backend
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

    const response = await fetch(`${API_URL}/services`, {
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
        { message: data.message || 'Failed to create service' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { message: 'Failed to create service', error },
      { status: 500 }
    );
  }
}

// PUT - Update a service on backend
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
        { message: 'Service ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/services/${id}`, {
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
        { message: data.message || 'Failed to update service' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { message: 'Failed to update service', error },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service on backend
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
        { message: 'Service ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { message: error.message || 'Failed to delete service' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { message: 'Failed to delete service', error },
      { status: 500 }
    );
  }
}
