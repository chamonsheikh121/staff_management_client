import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://52.63.153.21:3000';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const { id, staffId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_URL}/appointments/${id}/assign-staff/${staffId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error assigning staff:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to assign staff' },
      { status: 500 }
    );
  }
}
