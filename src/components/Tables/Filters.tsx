import React from "react";
import { TableHeaders } from "@/components/Tables/Table";

export interface Filter<Data, State> {
    shouldFilter: (data: Data, state: State) => boolean;
    filterComponent: (state: State, setState: (state: State) => void) => React.ReactElement;
    state: State;
    initialState: State;
}

export interface KeyedFilter<Data, Key extends keyof Data, State> extends Filter<Data, State> {
    key: Key;
    label: string;
}

export const isKeyedFilter = <Data, Key extends keyof Data, State>(
    filter: Filter<Data, State>
): filter is KeyedFilter<Data, Key, State> => {
    return "key" in filter;
};

export const keyedFilter = <Data, Key extends keyof Data, State>(
    key: Key,
    label: string,
    filter: Filter<Data, State>
): KeyedFilter<Data, Key, State> => {
    return {
        key,
        label,
        ...filter,
    };
};

export const headerLabelFromKey = <Data, Key extends keyof Data>(
    headers: TableHeaders<Data>,
    key: Key
): string => {
    return headers.find(([headerKey]) => headerKey === key)?.[1] ?? key.toString();
};

export const defaultToString = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }

    return JSON.stringify(value);
};
