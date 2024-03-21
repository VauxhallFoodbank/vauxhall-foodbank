"use client";

import { DatabaseEnums } from "@/databaseUtils";
import React, { useState, createContext } from "react";

interface Props {
    children: React.ReactNode;
}

export type Roles = DatabaseEnums["role"] | "";

type RolesInterface = {
    [key in Roles]: string[];
};

const pathsShownToCaller = ["/calendar", "/clients", "/parcels", "/update-password"];

const roleToShownPages: RolesInterface = {
    admin: pathsShownToCaller.concat("/admin", "/lists"),
    caller: pathsShownToCaller,
    "": ["/login", "/forgot-password", "/auth/reset-password"],
};

export const roleCanAccessPage = (role: Roles, url: string): boolean => {
    const accessList = roleToShownPages[role];
    return accessList.some((page) => url.startsWith(page));
};

interface RoleUpdateContextType {
    role: Roles;
    setRole: (_role: Roles) => void;
}

export const RoleUpdateContext = createContext<RoleUpdateContextType>({
    role: "",
    setRole: (_role) => {},
});

export const RoleManager: React.FC<Props> = ({ children }) => {
    const [role, setRole] = useState<Roles>("");

    return (
        <RoleUpdateContext.Provider value={{ role, setRole }}>
            {children}
        </RoleUpdateContext.Provider>
    );
};
