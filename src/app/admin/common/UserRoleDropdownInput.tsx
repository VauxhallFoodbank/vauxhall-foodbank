import React from "react";
import DropdownListInput from "@/components/DataInput/DropdownListInput";
import { Database } from "@/databaseTypesFile";
import { SelectChangeEventHandler } from "@/components/DataInput/inputHandlerFactories";

const roleLabelsAndValues: [string, string][] = [
    ["Caller", "caller"],
    ["Admin", "admin"],
];

interface Props {
    defaultValue: Database["public"]["Enums"]["role"];
    onChange: SelectChangeEventHandler;
}

const UserRoleDropdownInput: React.FC<Props> = (props) => {
    return (
        <DropdownListInput
            selectLabelId="user-role-select-label"
            listTitle="User Role"
            defaultValue={props.defaultValue}
            labelsAndValues={roleLabelsAndValues}
            onChange={props.onChange}
        />
    );
};

export default UserRoleDropdownInput;
