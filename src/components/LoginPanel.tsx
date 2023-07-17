"use client";

import { DatabaseAutoType } from "@/supabase";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import React from "react";
import styled, { useTheme } from "styled-components";

const MiddleDiv = styled.div`
    max-width: 400px;
    border: solid 1px ${props => props.theme.foregroundColor};
    border-radius: 10px;
    padding: 50px;
    margin: auto;
`;

const LoginPanel: React.FC<{}> = () => {
    const supabase = createClientComponentClient<DatabaseAutoType>();
    const theme = useTheme();

    return (
        <MiddleDiv>
            <Auth
                supabaseClient={supabase}
                providers={[]}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                inputLabelText: theme.foregroundColor,
                                anchorTextColor: theme.foregroundColor,
                                defaultButtonBackground: theme.primaryColor,
                                brand: theme.primaryColor,
                                brandAccent: theme.secondaryColor,
                                brandButtonText: theme.primaryForegroundColor,                              
                            },
                        },
                    },
                }}
                redirectTo="http://localhost:3000/auth/callback"
            />
        </MiddleDiv>
    );
};

export default LoginPanel;
