import type { Actions } from "@sveltejs/kit";
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
    create: async ({ request, locals: { supabase } }) => {
        console.log('Creating device...');

        const formData = await request.formData();
        const deviceName = formData.get('deviceName') as string;
        const deviceTypeId = Number(formData.get('deviceTypeId'));

        // Get the user session - consider using getUser() instead for better security
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            console.error("User is not authenticated:", sessionError);
            return fail(401, { error: "User not authenticated" });
        }

        try {
            const response = await fetch(`https://beta.api.spaia.earth/my/device`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: deviceName,
                    typeId: deviceTypeId, // Use the form value instead of hardcoded 1
                    createdBy: session.user.id, // Use actual user ID instead of "bob"
                    serial: "",
                    notes: "beta 1"
                })
            });

            const responseData = await response.json();
            console.log("API response:", responseData);

            if (!response.ok || !responseData.serial) {
                console.error("API error:", responseData);
                return fail(response.status, {
                    error: responseData.message || "Failed to create device",
                    details: responseData
                });
            }

            // Return a plain serializable object
            return {
                success: true,
                device: {
                    id: responseData.id,
                    name: responseData.name,
                    serial: responseData.serial,
                    typeId: 1,
                    createdAt: responseData.createdAt
                }
            };

        } catch (error) {
            console.error("Fetch error:", error);
            return fail(500, {
                error: "Network error occurred while creating device",
                details: error instanceof Error ? error.message : String(error)
            });
        }
    },
};