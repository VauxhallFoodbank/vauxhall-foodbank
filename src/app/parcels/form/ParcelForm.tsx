"use client";

import React, { useEffect, useState } from "react";
import {
    Errors,
    FormErrors,
    setError,
    setField,
    checkErrorOnSubmit,
    Fields,
} from "@/components/Form/formFunctions";
import { CenterComponent, StyledForm, FormErrorText } from "@/components/Form/formStyling";

import { useRouter } from "next/navigation";

import VoucherNumberCard from "@/app/parcels/form/formSections/VoucherNumberCard";
import PackingDateCard from "@/app/parcels/form/formSections/PackingDateCard";
import PackingTimeCard from "@/app/parcels/form/formSections/PackingTimeCard";
import ShippingMethodCard from "@/app/parcels/form/formSections/ShippingMethodCard";
import CollectionDateCard from "@/app/parcels/form/formSections/CollectionDateCard";
import CollectionTimeCard from "@/app/parcels/form/formSections/CollectionTimeCard";
import CollectionCentreCard from "@/app/parcels/form/formSections/CollectionCentreCard";
import { insertParcel, updateParcel } from "@/app/parcels/form/clientDatabaseFunctions";
import { IconButton, Button } from "@mui/material";
import Title from "@/components/Title/Title";
import { Schema } from "@/databaseUtils";
import dayjs, { Dayjs } from "dayjs";
import { CollectionCentresLabelsAndValues } from "@/common/fetch";
import getExpandedClientDetails, {
    ExpandedClientDetails,
} from "@/app/clients/getExpandedClientDetails";
import Modal from "@/components/Modal/Modal";
import InformationIcon from "@/components/Icons/InformationIcon";
import Icon from "@/components/Icons/Icon";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { ContentDiv, OutsideDiv } from "@/components/Modal/ModalFormStyles";
import DataViewer from "@/components/DataViewer/DataViewer";
import { useTheme } from "styled-components";

export interface ParcelFields extends Fields {
    clientId: string | null;
    voucherNumber: string | null;
    packingDate: string | null;
    packingTime: string | null;
    shippingMethod: string | null;
    collectionDate: string | null;
    collectionTime: string | null;
    collectionCentre: string | null;
}

export const initialParcelFields: ParcelFields = {
    clientId: null,
    voucherNumber: "",
    packingDate: null,
    packingTime: null,
    shippingMethod: "",
    collectionDate: null,
    collectionTime: null,
    collectionCentre: null,
};

export const initialParcelFormErrors: FormErrors = {
    voucherNumber: Errors.none,
    packingDate: Errors.initial,
    packingTime: Errors.initial,
    shippingMethod: Errors.initial,
    collectionDate: Errors.initial,
    collectionTime: Errors.initial,
    collectionCentre: Errors.initial,
};

interface ParcelFormProps {
    initialFields: ParcelFields;
    initialFormErrors: FormErrors;
    clientId?: string;
    editMode: boolean;
    parcelId?: string;
    deliveryPrimaryKey: Schema["collection_centres"]["primary_key"];
    collectionCentresLabelsAndValues: CollectionCentresLabelsAndValues;
}

const withCollectionFormSections = [
    VoucherNumberCard,
    PackingDateCard,
    PackingTimeCard,
    ShippingMethodCard,
    CollectionDateCard,
    CollectionTimeCard,
    CollectionCentreCard,
];

const noCollectionFormSections = [
    VoucherNumberCard,
    PackingDateCard,
    PackingTimeCard,
    ShippingMethodCard,
];

const mergeDateAndTime = (date: string, time: string): Dayjs => {
    // dayjs objects are immutable so the setter methods return a new object
    const dayjsTime = dayjs(time);
    return dayjs(date).hour(dayjsTime.hour()).minute(dayjsTime.minute());
};

// TODO VFB-55:
// The param deliveryPrimaryKey will need to remain until VFB-55 is done.

const ParcelForm: React.FC<ParcelFormProps> = ({
    initialFields,
    initialFormErrors,
    clientId,
    editMode,
    parcelId,
    deliveryPrimaryKey,
    collectionCentresLabelsAndValues,
}) => {
    const router = useRouter();
    const [fields, setFields] = useState(initialFields);
    const [formErrors, setFormErrors] = useState(initialFormErrors);
    const [submitError, setSubmitError] = useState(Errors.none);
    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const [clientDetails, setClientDetails] = useState<ExpandedClientDetails | null>(null);
    const theme = useTheme();

    useEffect(() => {
        if (initialFields.clientId) {
            getExpandedClientDetails(initialFields.clientId).then((response) =>
                setClientDetails(response)
            );
        }
    }, [initialFields]);

    const formSections =
        fields.shippingMethod === "Collection"
            ? withCollectionFormSections
            : noCollectionFormSections;

    const fieldSetter = setField(setFields, fields);
    const errorSetter = setError(setFormErrors, formErrors);

    const submitForm = async (): Promise<void> => {
        setSubmitErrorMessage("");
        setSubmitDisabled(true);
        let inputError;
        if (fields.shippingMethod === "Collection") {
            inputError = checkErrorOnSubmit(formErrors, setFormErrors);
        } else {
            inputError = checkErrorOnSubmit(formErrors, setFormErrors, [
                "voucherNumber",
                "packingDate",
                "packingTime",
                "shippingMethod",
            ]);
        }
        if (inputError) {
            setSubmitError(Errors.submit);
            setSubmitDisabled(false);
            return;
        }

        const packingDateTime = mergeDateAndTime(
            fields.packingDate!,
            fields.packingTime!
        ).toISOString();

        let collectionDateTime = null;
        if (fields.shippingMethod === "Collection") {
            collectionDateTime = mergeDateAndTime(
                fields.collectionDate!,
                fields.collectionTime!
            ).toISOString();
        }

        const isDelivery = fields.shippingMethod === "Delivery";

        const formToAdd = {
            client_id: (clientId || fields.clientId)!,
            packing_datetime: packingDateTime,
            voucher_number: fields.voucherNumber,
            collection_centre: isDelivery ? deliveryPrimaryKey : fields.collectionCentre,
            collection_datetime: collectionDateTime,
        };

        try {
            if (editMode) {
                await updateParcel(formToAdd, parcelId!);
            } else {
                await insertParcel(formToAdd);
            }
            router.push("/parcels/");
        } catch (error: unknown) {
            if (error instanceof Error) {
                setSubmitError(Errors.external);
                setSubmitErrorMessage(error.message);
            }
        }
        setSubmitDisabled(false);
    };

    // @ts-ignore
    return (
        <CenterComponent>
            <StyledForm>
                <Title>Parcel Form</Title>
                <div>
                    {clientDetails?.fullName}
                    <IconButton
                        aria-label="Button for Client Information"
                        type="button"
                        size="large"
                        onClick={() => {
                            setModalIsOpen(true);
                        }}
                    >
                        <InformationIcon color={theme.primary.background[3]} />
                    </IconButton>
                </div>
                {formSections.map((Card, index) => {
                    return (
                        <Card
                            key={index}
                            formErrors={formErrors}
                            errorSetter={errorSetter}
                            fieldSetter={fieldSetter}
                            fields={fields}
                            collectionCentresLabelsAndValues={collectionCentresLabelsAndValues}
                        />
                    );
                })}
                <CenterComponent>
                    <Button variant="contained" onClick={submitForm} disabled={submitDisabled}>
                        Submit
                    </Button>
                </CenterComponent>
                <FormErrorText>{submitErrorMessage || submitError}</FormErrorText>
            </StyledForm>
            <Modal
                header={
                    <>
                        <Icon icon={faUser} color={theme.primary.background[2]} />
                        Client Details
                    </>
                }
                isOpen={modalIsOpen}
                onClose={() => setModalIsOpen(false)}
                headerId="clientsDetailModal"
            >
                <OutsideDiv>
                    <ContentDiv>
                        <DataViewer data={{ ...clientDetails } ?? {}} />
                    </ContentDiv>
                </OutsideDiv>
            </Modal>
        </CenterComponent>
    );
};

export default ParcelForm;
