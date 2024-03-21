/* eslint-disable import/no-unresolved */
// @ts-nocheck (for Deno references, annoyingly cannot get around for now)
/* global Deno */

import { type Handler, serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@latest";
import { corsHeaders, generateCorsOptionsForJsonResponse } from "../_shared/cors.ts";
import { logError } from "@/logger/logger";
import { fetchUserRole } from "@/common/fetch";

interface CreateUserRequestBody {
    email: string;
    password: string;
    role: "admin" | "caller";
    firstName: string;
    lastName: string;
    telephoneNumber: string;
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

    const requestBody: CreateUserRequestBody = await req.json();

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: requestBody.email,
        password: requestBody.password,
        app_metadata: {
            role: requestBody.role,
        },
        email_confirm: true,
    });

    if (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            generateCorsOptionsForJsonResponse(error.status ?? 400)
        );
    }

    if (data) {
        const { error } = await supabase.from("profiles").insert({
            primary_key: data.user?.id,
            role: requestBody.role,
            first_name: requestBody.firstName,
            last_name: requestBody.lastName,
            telephone_number: requestBody.telephoneNumber,
        });
        if (error) {
            void logError("Error with insert: Profiles - create user", error);
        }
    }

    return new Response(JSON.stringify(data.user), generateCorsOptionsForJsonResponse(200));
});
