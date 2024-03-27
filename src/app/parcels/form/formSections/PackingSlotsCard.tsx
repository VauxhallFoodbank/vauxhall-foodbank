import React from "react";
import { CardProps, errorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import DropdownListInput from "@/components/DataInput/DropdownListInput";
import { PackingSlotsLabelsAndValues } from "@/common/fetch";

interface PackingSlotsCardProps extends CardProps {
    packingSlotsLabelsAndValues: PackingSlotsLabelsAndValues;
}

const PackingSlotsCard: React.FC<PackingSlotsCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    packingSlotsLabelsAndValues,
}) => {
    return (
        <GenericFormCard
            title="Packing Slots"
            required={true}
            text="Which slot does the parcel need to be packed in?"
        >
            <DropdownListInput
                selectLabelId="packing-slot-select-label"
                labelsAndValues={packingSlotsLabelsAndValues}
                listTitle="Packing Slot"
                defaultValue={fields.packingSlot}
                onChange={valueOnChangeDropdownList(fieldSetter, errorSetter, "packingSlot")}
            />
            <ErrorText>{errorText(formErrors.packingSlot)}</ErrorText>
        </GenericFormCard>
    );
};

export default PackingSlotsCard;
