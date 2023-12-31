import { Database } from "@/databaseTypesFile";

export type DatabaseAutoType = Database;

type Tables = Database["public"]["Tables"];

export type Schema = {
    [key in keyof Tables]: Tables[key]["Row"];
};

export type InsertSchema = {
    [key in keyof Tables]: Tables[key]["Insert"];
};

export type UpdateSchema = {
    [key in keyof Tables]: Tables[key]["Update"];
};

export type DatabaseEnums = Database["public"]["Enums"];
