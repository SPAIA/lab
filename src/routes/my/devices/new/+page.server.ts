import type { Actions, RequestEvent } from "@sveltejs/kit";

export const actions: Actions = {
    create: async ({ request, locals: { supabase } }: RequestEvent) => {
        console.log('Creating device...');

        const formData = await request.formData();
        const deviceName = formData.get('deviceName') as string;
        const deviceTypeId = Number(formData.get('deviceTypeId')); // Assuming you have this in the form

        // Get the user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            console.error("User is not authenticated:", sessionError);
            return { error: "User not authenticated" };
        }

        try {
            const response = await fetch(`https://beta.api.spaia.earth/my/device`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${sessionData.session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: deviceName,
                    typeId: 1,
                    createdBy: "bob",
                    serial: "",
                    notes: "beta 1"
                })
            });
            const responseJson = await response.json();
            console.log("API response:", responseJson);
            if (!responseJson.serial) {
                console.error("API error:", JSON.stringify(responseJson));
                return { error: responseJson.error || "Failed to create device" };
            }

            // Wrap it in a data property for SvelteKit
            return new Response(responseJson, {
                status: 200
            });

        } catch (error) {
            console.error("Fetch error:", error);
            return { error: "Network error occurred while creating device" };
        }
    },
};