import React from "react";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import {
    CardProps,
    Errors,
    errorExists,
    ErrorSetter,
    errorText,
    FieldSetter,
    onChangeText,
} from "@/components/Form/formFunctions";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { selectChangeEventHandler } from "@/components/DataInput/inputHandlerFactories";

const getBaby = (fieldSetter: FieldSetter, errorSetter: ErrorSetter): selectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        if (input === "Yes") {
            errorSetter("nappySize", Errors.initial);
            fieldSetter("babyProducts", true);
            return;
        }
        errorSetter("nappySize", Errors.none);
        const babyProduct = input === "No" ? false : null;
        fieldSetter("babyProducts", babyProduct);
    };
};

const BabyProductCard: React.FC<CardProps> = ({ formErrors, errorSetter, fieldSetter, fields }) => {
    return (
        <GenericFormCard
            title="Baby Products"
            required={true}
            text="Includes Baby Food, Wet Wipes, Nappies etc."
        >
            <>
                <RadioGroupInput
                    labelsAndValues={[
                        ["Yes", "Yes"],
                        ["No", "No"],
                        ["Don't Know", "Don't Know"],
                    ]}
                    defaultValue="Don't Know"
                    onChange={getBaby(fieldSetter, errorSetter)}
                />
                {fields.babyProducts ? (
                    <>
                        <FreeFormTextInput
                            error={errorExists(formErrors.nappySize)}
                            helperText={errorText(formErrors.nappySize)}
                            label="Nappy Size"
                            onChange={onChangeText(fieldSetter, errorSetter, "nappySize", true)}
                        />
                    </>
                ) : (
                    <></>
                )}
            </>
        </GenericFormCard>
    );
};

export default BabyProductCard;