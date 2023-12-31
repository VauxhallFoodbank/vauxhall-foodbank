import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { CardProps, errorExists, errorText, onChangeText } from "@/components/Form/formFunctions";

const NameCard: React.FC<CardProps> = ({ fieldSetter, formErrors, errorSetter }) => {
    return (
        <GenericFormCard
            title="Name"
            text="Please enter the name of the collection centre."
            required
        >
            <FreeFormTextInput
                label="Name"
                error={errorExists(formErrors.name)}
                helperText={errorText(formErrors.name)}
                onChange={onChangeText(fieldSetter, errorSetter, "name", true)}
            />
        </GenericFormCard>
    );
};

export default NameCard;
