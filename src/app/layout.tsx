import StyleManager from "@/app/themes";
import { Metadata } from "next";

import React from "react";
import NavigationBar from "@/components/NavBar/NavigationBar";

interface Props {
    children: React.ReactElement;
}

const App: React.FC<Props> = ({ children }) => (
    <html lang="en">
        <body>
            <React.StrictMode>
                <StyleManager>
                    <NavigationBar>{children}</NavigationBar>
                </StyleManager>
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
