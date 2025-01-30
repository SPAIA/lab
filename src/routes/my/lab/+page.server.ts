import type { ApiResponse, Device } from '$lib/types';
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
    const { data: { user } } = await supabase.auth.getUser()
    let session = await supabase.auth.getSession()
    console.log(session.data.session.access_token)
    const response = await fetch(
        `https://beta.api.spaia.earth/my/devices`,
        {
            method: 'GET',
            headers: {
                'authorization': `Bearer ${session.data.session.access_token}`,
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

    return { user, devices: result.data, pagination: result.pagination };
}