import { getToken } from './auth';

/**
 * Makes an authenticated API call
 * @param endpoint The API endpoint (e.g., '/api/vendor/dashboard')
 * @param options Optional fetch options (method, body, etc.)
 * @returns Promise with the JSON response
 */
export async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Set default headers with Authorization
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Make the API call
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Handle non-success responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    // Parse and return response
    return await response.json();
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Get data from an API endpoint
 */
export const fetchData = <T>(endpoint: string) => apiCall<T>(endpoint);

/**
 * Post data to an API endpoint
 */
export const postData = <T>(endpoint: string, data: any) => 
  apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

/**
 * Update data at an API endpoint
 */
export const updateData = <T>(endpoint: string, data: any) => 
  apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/**
 * Delete data at an API endpoint
 */
export const deleteData = <T>(endpoint: string) => 
  apiCall<T>(endpoint, {
    method: 'DELETE',
  }); 