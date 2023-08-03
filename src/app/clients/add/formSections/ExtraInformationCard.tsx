import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { CardProps, onChangeText } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";

const ExtraInformationCard: React.FC<CardProps> = ({ errorSetter, fieldSetter }) => {
    return (
        <GenericFormCard
            title="Extra Information"
            required={false}
            text="Is there anything else you need to tell us about the client? Comments relating to food or anything else. Please add any delivery instructions to the 'Delivery Instructions' section above."
        >
            <FreeFormTextInput
                label="For example, Tea allergy"
                onChange={onChangeText(fieldSetter, errorSetter, "extraInformation")}
            />
        </GenericFormCard>
    );
};

export default ExtraInformationCard;
