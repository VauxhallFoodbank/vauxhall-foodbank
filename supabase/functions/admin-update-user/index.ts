/* eslint-disable import/no-unresolved */
// @ts-nocheck (for Deno references, annoyingly cannot get around for now)
/* global Deno */

import { type Handler, serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@latest";
import { corsHeaders, generateCorsOptionsForJsonResponse } from "../_shared/cors.ts";
import { AdminUserAttributes } from "https://esm.sh/@supabase/gotrue-js@latest";
import { fetchUserRole } from "@/common/fetch";

interface UpdateUserRequestBody {
    userId: string;
    attributes: AdminUserAttributes;
}

serve(async (req: Handler): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

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
            generateCorsOptionsForJsonResponse(userError.status ?? 400)
        );
    }

    if (user === null) {
        return new Response(
            JSON.stringify({ error: "Unauthorized" }),
            generateCorsOptionsForJsonResponse(401)
        );
    }

    const userRole = await fetchUserRole(user!.id);
    if (userRole !== "admin") {
        return new Response(
            JSON.stringify({ error: "Forbidden" }),
            generateCorsOptionsForJsonResponse(403)
        );
    }

    // -- Process Request -- //
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const requestBody: UpdateUserRequestBody = await req.json();

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        requestBody.userId,
        requestBody.attributes
    );

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            generateCorsOptionsForJsonResponse(error.status ?? 400)
        );
    }

    return new Response(JSON.stringify(data.user), generateCorsOptionsForJsonResponse(200));
});
