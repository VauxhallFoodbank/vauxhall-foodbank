import React from "react";
import { SelectChangeEvent } from "@mui/material";

type valueSetter = {
    (value: any): void;
};

type booleanSetter = {
    (checked: boolean): void;
};

type changeEventHandler = {
    (event: React.ChangeEvent<HTMLInputElement>): void;
};

type selectChangeEventHandler = {
    (event: SelectChangeEvent<unknown>): void;
};

const getValueChangeHandler = (setValue: valueSetter): changeEventHandler => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue((event.target as HTMLInputElement).value);
    };
};

export const getFreeFormTextHandler = (setValue: valueSetter): changeEventHandler => {
    return getValueChangeHandler(setValue);
};

export const getRadioGroupHandler = (setValue: valueSetter): changeEventHandler => {
    return getValueChangeHandler(setValue);
};

export const getDropdownListHandler = (setValue: valueSetter): selectChangeEventHandler => {
    return (event: SelectChangeEvent<unknown>) => {
        setValue(event.target.value);
    };
};

export const getCheckboxHandler = (setBoolean: booleanSetter): changeEventHandler => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
        setBoolean((event.target as HTMLInputElement).checked);
    };
};