"use client";

import React from "react";
import { MenuItem, InputLabel, Select, FormControl, SelectChangeEvent } from "@mui/material";

interface Props {
    labelsAndValues: [string, string][];
    listTitle?: string;
    defaultValue?: string;
    onChange?: (event: SelectChangeEvent) => void;
    selectLabelId: string;
}

const DropdownListInput: React.FC<Props> = (props) => {
    return (
        <FormControl fullWidth>
            <InputLabel id={props.selectLabelId}>{props.listTitle}</InputLabel>
            <Select
                defaultValue={props.defaultValue ?? ""}
                onChange={props.onChange}
                labelId={props.selectLabelId}
            >
                {props.labelsAndValues.map(([label, value]) => {
                    return (
                        <MenuItem key={value} value={value}>
                            {label}
                        </MenuItem>
                    );
                })}
            </Select>
        </FormControl>
    );
};

export default DropdownListInput;
