// src/routes/auth/callback/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const error_description = url.searchParams.get('error_description');

    // Log incoming request details
    console.log('Callback params:', {
        code,
        error,
        error_description,
        fullUrl: url.toString()
    });

    if (error) {
        console.error('Auth callback error:', error_description);
        throw redirect(303, `/login?error=${encodeURIComponent(error_description)}`);
    }

    if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            console.error('Session exchange error:', error);
            throw redirect(303, `/login?error=${encodeURIComponent(error.message)}`);
        }

        // Log successful authentication
        console.log('Authentication successful:', data);
        throw redirect(303, '/');
    }

    // If we get here, something went wrong
    console.error('No code or error in callback');
    throw redirect(303, '/login?error=invalid_callback');
};