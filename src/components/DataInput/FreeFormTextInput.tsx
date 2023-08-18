"use client";

import React from "react";
import { TextField } from "@mui/material";
interface Props {
    label?: string;
    defaultValue?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    error?: boolean;
    helperText?: string;
    value?: string;
    multiline?: boolean;
    maxRows?: number;
    minRows?: number;
}

const FreeFormTextInput: React.FC<Props> = (props) => {
    return <TextField {...props} />;
};
export default FreeFormTextInput;
