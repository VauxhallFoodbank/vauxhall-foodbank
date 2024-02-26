import * as dotenv from "dotenv";
import { SupabaseClient } from "@supabase/supabase-js";
import { getLocalSupabaseClient } from "./getLocalSupabaseClient";

dotenv.config({ path: "./.env.local" });

createAdminUser();

type Role = "admin" | "caller";

async function createAdminUser(): Promise<void> {
    const supabase = getLocalSupabaseClient();

    await createUser(supabase, "admin@example.com", "admin123", "admin");
    await createUser(supabase, "caller@example.com", "caller123", "caller");
}

async function createUser(
    supabase: SupabaseClient,
    email: string,
    password: string,
    role: Role
): Promise<void> {
    const { error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        phone_confirm: true,
        app_metadata: {
            role: role,
        },
    });

    if (error) {
        throw new Error(`Failed to create ${role} user: ${email}. ${error}`);
    }

    console.log(`Created a ${role} user: ${email} (${password})`);
}