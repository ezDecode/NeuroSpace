/**
 * Utility functions for cleaning up duplicate file records
 */

export async function cleanupDuplicateFiles(): Promise<{ duplicates_removed: number; message: string }> {
  try {
    const response = await fetch('/api/files/cleanup-duplicates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorMessage = 'Failed to cleanup duplicate files';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch (jsonError) {
        console.error('Failed to parse cleanup error response:', jsonError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Cleanup duplicates error:', error);
    throw error;
  }
}
