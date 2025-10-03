import { connectMongooseDB } from '@/db/mongoose';

export async function withDB<T>(
  callback: () => Promise<T>
): Promise<T> {
  try {
    await connectMongooseDB();
    return await callback();
  } catch (error) {
    console.error('Database operation failed:', error);
    
    return {
      success: false,
      errors: {
        _form: ['An unexpected error occurred. Please try again later.'],
      },
    } as T;
  }
}
