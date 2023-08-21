// @ts-nocheck (for Deno references, annoyingly cannot get around for now)
/* global Deno */

import { type Handler, serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@latest";
import { corsHeaders } from "../_shared/cors.ts";

interface DeleteUserRequestBody {
    userId: string;
}

serve(async (req: Handler): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const generateHeaders = (status: number): any => ({
        ...corsHeaders,
        "Content-Type": "application/json",
        status,
    });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
            headers: {
                Authorization: req.headers.get("Authorization")!,
            },
        },
    });

    // -- Prevent Non-Admin Access -- //
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        return new Response(
            JSON.stringify({ error: userError.message }),
            generateHeaders(userError.status ?? 400)
        );
    }

    if (user === null) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), generateHeaders(401));
    }

    if (user.app_metadata.role !== "admin") {
        return new Response(JSON.stringify({ error: "Forbidden" }), generateHeaders(403));
    }

    // -- Process Request -- //
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const requestBody: DeleteUserRequestBody = await req.json();

    const { data, error } = await supabaseAdmin.auth.admin.deleteUser(requestBody.userId);

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            generateHeaders(error.status ?? 400)
        );
    }

    return new Response(JSON.stringify(data.user), generateHeaders(200));
});