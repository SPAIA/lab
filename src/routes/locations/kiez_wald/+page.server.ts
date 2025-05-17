import type { ApiResponse, Device } from '$lib/types';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    const response = await fetch(
        `https://beta.api.spaia.earth/devices/user/kiez-wald`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        }
    );

    // Validate response status
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    // Parse and type-cast the response
    const result: ApiResponse<{ data: Device[], pagination: { totalCount: number } }> = await response.json();
    return { devices: result.data, pagination: result.pagination };
}