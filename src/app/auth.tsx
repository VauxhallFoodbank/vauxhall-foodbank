"use client";

import React, { useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DatabaseAutoType } from "@/databaseUtils";
import { RoleUpdateContext } from "@/app/roles";
import { fetchUserRole } from "@/common/fetch";

interface Props {
    children: React.ReactNode;
}

export const pathsNotRequiringLogin: readonly string[] = [
    "/login",
    "/forgot-password",
    "/auth/reset-password",
] as const;

export const AuthRouting: React.FC<Props> = ({ children = <></> }) => {
    const supabase = createClientComponentClient<DatabaseAutoType>();
    const router = useRouter();
    const pathname = usePathname();
    const [loggedIn, setLoggedIn] = useState<boolean>();
    const { setRole } = useContext(RoleUpdateContext);

    // This fixes issues with navigation when the user has signed in but then signed out and caching still allows them to
    // access pages. It also fixes authentication flow issues on sign in and sign out
    const toRedirectTo = (): string | null => {
        const pathname = window.location.pathname;

        if (loggedIn === undefined) {
            return null;
        }

        if (loggedIn && pathname.startsWith("/login")) {
            return "/";
        }

        const currentPathRequiresLogin = pathsNotRequiringLogin.every(
            (pathNotRequiringLogin) => !pathname.startsWith(pathNotRequiringLogin)
        );

        if (!loggedIn && currentPathRequiresLogin) {
            return "/login";
        }

        return null;
    };

    const onRouteChange = (): void => {
        const redirect = toRedirectTo();
        if (redirect) {
            router.push(redirect);

            // if Client Side Routing is not working, fallback to changing the window location
            setTimeout(() => {
                const redirect = toRedirectTo();
                if (redirect) {
                    window.location.pathname = redirect;
                }
            }, 2500);
        }
    };

    const findUserRole: () => Promise<void> = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        const userRole = (await fetchUserRole(user!.id)) ?? "";
        setRole(userRole);
    };

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setLoggedIn(!!session?.user);
        });

        return subscription.unsubscribe;
    });

    useEffect(() => {
        onRouteChange();
        findUserRole();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- We don't need onRouteChange in the dependency array
    }, [loggedIn, pathname, router]);

    return <>{children}</>;
};
