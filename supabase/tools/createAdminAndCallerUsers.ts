import * as dotenv from "dotenv";
import { SupabaseClient } from "@supabase/supabase-js";
import { getLocalSupabaseClient } from "./getLocalSupabaseClient";

dotenv.config({ path: "./.env.local" });

createAdminAndCallerUsers();

type Role = "admin" | "caller";

async function createAdminAndCallerUsers(): Promise<void> {
    const supabase = getLocalSupabaseClient();

    await createUser(
        supabase,
        "admin@example.com",
        "admin123",
        "admin",
        "admin",
        "person",
        "0777777777777"
    );
    await createUser(
        supabase,
        "caller@example.com",
        "caller123",
        "caller",
        "caller",
        "person",
        "078888888888"
    );
}

async function createUser(
    supabase: SupabaseClient,
    email: string,
    password: string,
    role: Role,
    firstName: string,
    lastName: string,
    telephoneNumber: string
): Promise<void> {
    const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        phone_confirm: true,
        app_metadata: {
            role: role,
        },
    });

    if (error) {
        console.log(error);
        throw new Error(`Failed to create ${role} user: ${email}. ${error}`);
    }

    if (data) {
        const { error } = await supabase.from("profiles").insert({
            primary_key: data.user?.id,
            role: role,
            first_name: firstName,
            last_name: lastName,
            telephone_number: telephoneNumber,
        });
        if (error) {
            console.log(error);
        }
    }

    console.log(`Created a ${role} user: ${email} (${password})`);
}
