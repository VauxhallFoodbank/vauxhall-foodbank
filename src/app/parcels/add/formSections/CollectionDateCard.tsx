import React from "react";
import { CardProps, onChangeDateOrTime, errorText } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { ErrorText } from "@/components/Form/formStyling";

const CollectionDateCard: React.FC<CardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
}) => {
    return (
        <GenericFormCard
            title="Collection Date"
            required={true}
            text="What date is the client collecting their parcel?"
        >
            <>
                <DesktopDatePicker
                    onChange={(value: any): void => {
                        onChangeDateOrTime(fieldSetter, errorSetter, "collectionDate", value);
                    }}
                    label="Date"
                    value={fields.collectionDate || null}
                    disablePast
                />
                <ErrorText>{errorText(formErrors.collectionDate)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionDateCard;
