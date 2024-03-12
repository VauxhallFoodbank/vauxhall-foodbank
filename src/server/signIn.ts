import { logError } from "@/logger/logger";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface SignInWithPasswordResponse {
    errorMessage?: string;
}

export async function signInWithPassword(credentials: {
    email: string;
    password: string;
}): Promise<SignInWithPasswordResponse> {
    const supabase = createClientComponentClient();
    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
        void logError("Sign in failed", { error });
        return { errorMessage: error.message };
    }

    return {};
}
