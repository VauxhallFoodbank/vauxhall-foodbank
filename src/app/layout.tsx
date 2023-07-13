import StyleManager from "@/app/themes";
import StyledComponentsRegistry from "./themes";
import NavBar from "@/components/NavBar";
import { Metadata } from "next";

import React from "react";

interface Props {
    children: React.FC;
}

const App: React.FC<Props> = ({ children }) => (
    <html lang="en">
        <body>
            <React.StrictMode>
                <StyledComponentsRegistry>
                    <StyleManager>
                        <>
                            <NavBar />
                            {children}
                        </>
                    </StyleManager>
                </StyledComponentsRegistry>
            </React.StrictMode>
        </body>
    </html>
);

export const metadata: Metadata = {
    title: {
        template: "%s | Vauxhall Foodbank",
        default: "Vauxhall Foodbank",
    },
    description: "Providing foodbank services to clients in south London.",
};

export default App;
