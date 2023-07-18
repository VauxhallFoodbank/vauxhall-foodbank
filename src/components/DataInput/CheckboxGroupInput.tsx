"use client";

import React from "react";
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from "@mui/material";

interface Props {
    labelsAndKeys: [string, string][];
    groupLabel?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckboxInput: React.FC<Props> = (props) => {
    return (
        <FormControl>
            <FormLabel>{props.groupLabel}</FormLabel>
            <FormGroup>
                {props.labelsAndKeys.map(([label, key]) => {
                    return (
                        <FormControlLabel
                            key={key}
                            label={label}
                            control={<Checkbox name={key} onChange={props.onChange} />}
                        />
                    );
                })}
            </FormGroup>
        </FormControl>
    );
};

export default CheckboxInput;