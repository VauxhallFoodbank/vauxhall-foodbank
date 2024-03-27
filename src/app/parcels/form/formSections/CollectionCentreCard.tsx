import React from "react";
import { CardProps, errorText, valueOnChangeDropdownList } from "@/components/Form/formFunctions";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { ErrorText } from "@/components/Form/formStyling";
import DropdownListInput from "@/components/DataInput/DropdownListInput";
import { CollectionCentresLabelsAndValues } from "@/common/fetch";

interface CollectionCentreCardProps extends CardProps {
    collectionCentresLabelsAndValues: CollectionCentresLabelsAndValues;
}
const CollectionCentreCard: React.FC<CollectionCentreCardProps> = ({
    fieldSetter,
    errorSetter,
    formErrors,
    fields,
    collectionCentresLabelsAndValues,
}) => {
    return (
        <GenericFormCard
            title="Collection Centre"
            required={true}
            text="What centre is the client collecting their parcel from?"
        >
            <>
                <DropdownListInput
                    selectLabelId="collection-centre-select-label"
                    labelsAndValues={collectionCentresLabelsAndValues}
                    listTitle="Collection Centre"
                    defaultValue={fields.collectionCentre || collectionCentresLabelsAndValues[0][0]}
                    onChange={valueOnChangeDropdownList(
                        fieldSetter,
                        errorSetter,
                        "collectionCentre"
                    )}
                />
                <ErrorText>{errorText(formErrors.collectionCentre)}</ErrorText>
            </>
        </GenericFormCard>
    );
};

export default CollectionCentreCard;
