'use server';

import { getUser, createUser } from '@/app/db';
import { redirect } from 'next/navigation';

export async function register(data: any) {
  try {
    let user = await getUser(data.email);

    if (user.length > 0) {
      return { message: 'A user with this identifier already exists' };
    }

    await createUser(data.email, data.password);
    return { message: 'success' };
  } catch (error) {
    console.error('Registration error:', error);
    return { message: 'Registration failed. Please try again.' };
  }
}
