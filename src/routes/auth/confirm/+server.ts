import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from '@sveltejs/kit'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
    console.log("got here")
    const token_hash = url.searchParams.get('token_hash')
    const type = url.searchParams.get('type') as EmailOtpType | null
    const next = url.searchParams.get('next') ?? '/'

    /**
     * Clean up the redirect URL by deleting the Auth flow parameters.
     *
     * `next` is preserved for now, because it's needed in the error case.
     */
    const redirectTo = new URL(url)
    redirectTo.pathname = next
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: token_hash, type: type })
        if (!error) {
            redirectTo.searchParams.delete('next')
            redirect(303, redirectTo)
        } else {
            console.log("errorxx ", error)
        }
    }

    redirectTo.pathname = '/auth/error'
    redirect(303, redirectTo)
}