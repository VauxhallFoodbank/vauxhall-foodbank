"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "@/components/Modal/Modal";
import dayjs, { Dayjs } from "dayjs";
import { ParcelsTableRow } from "@/app/parcels/getParcelsTableData";
import { Button, SelectChangeEvent } from "@mui/material";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import { DatePicker } from "@mui/x-date-pickers";
import DropdownListInput from "@/components/DataInput/DropdownListInput";
import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { statusType } from "./Statuses";
import SelectedParcelsOverview from "./SelectedParcelsOverview";
import { logErrorReturnLogId } from "@/logger/logger";

export type ActionType = "pdfDownload" | "deleteParcel" | "generateMap";

interface ActionsModalProps extends React.ComponentProps<typeof Modal> {
    selectedParcels: ParcelsTableRow[];
    errorText: string | null;
    inputComponent?: React.ReactElement;
    showSelectedParcels: boolean;
    actionType: ActionType;
    onDeleteParcels: (parcels: ParcelsTableRow[]) => void;
}

const Centerer = styled.div`
    display: flex;
    justify-content: center;
`;

const Heading = styled.div`
    font-size: 1.2rem;
    margin: 0.3rem;
`;

const Paragraph = styled.p`
    font-size: 1rem;
    margin: 0.3rem;
`;

const ModalInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
`;

const ConfirmButtons = styled.div`
    display: flex;
    flex-direction: row;
    gap: 2rem;
    align-items: stretch;
`;

interface ShippingLabelsInputProps {
    onLabelQuantityChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ShippingLabelsInput: React.FC<ShippingLabelsInputProps> = ({
    onLabelQuantityChange,
}) => {
    return (
        <>
            <Heading>Shipping Labels</Heading>
            <FreeFormTextInput type="number" onChange={onLabelQuantityChange} label="Quantity" />
        </>
    );
};

interface ShoppingListsConfirmationProps {
    parcels: ParcelsTableRow[];
}

export const ShoppingListsConfirmation: React.FC<ShoppingListsConfirmationProps> = ({
    parcels,
}) => {
    const maxPostcodesToShow = 4;
    const statusToFind: statusType = "Shopping List Downloaded";

    const printedListPostcodes = parcels
        .filter((parcel) => parcel.lastStatus?.name.startsWith(statusToFind))
        .map((parcel) => parcel.addressPostcode);

    return printedListPostcodes.length > 0 ? (
        <>
            <Heading>Shopping Lists</Heading>
            <Paragraph>
                Lists have already been printed for {printedListPostcodes.length} parcels with
                postcodes:
                {printedListPostcodes.slice(0, maxPostcodesToShow).join(", ")}
                {printedListPostcodes.length > maxPostcodesToShow ? ", ..." : "."}
            </Paragraph>
            <Paragraph>Are you sure you want to print again?</Paragraph>
        </>
    ) : (
        <></>
    );
};

interface DriverOverviewInputProps {
    onDateChange: (newDate: Dayjs | null) => void;
    onDriverNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const DriverOverviewInput: React.FC<DriverOverviewInputProps> = ({
    onDateChange,
    onDriverNameChange,
}) => {
    return (
        <>
            <Heading>Delivery Information</Heading>
            <FreeFormTextInput onChange={onDriverNameChange} label="Driver's Name" />
            <DatePicker defaultValue={dayjs()} onChange={onDateChange} disablePast />
        </>
    );
};

interface DayOverviewInputProps {
    onDateChange: (newDate: Dayjs | null) => void;
    onCollectionCentreChange: (event: SelectChangeEvent) => void;
    setCollectionCentre: React.Dispatch<React.SetStateAction<string>>;
}

export const DayOverviewInput: React.FC<DayOverviewInputProps> = ({
    onDateChange,
    onCollectionCentreChange,
    setCollectionCentre,
}) => {
    const [collectionCentres, setCollectionCentres] = useState<[string, string][] | null>(null);

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("collection_centres")
                .select("primary_key, name");
            if (error) {
                const logId = await logErrorReturnLogId(
                    "Error with fetch: Collection centres",
                    error
                );
                throw new DatabaseError("fetch", "collection centres", logId);
            }

            const transformedData: [string, string][] = data.map((item) => [
                item.name,
                item.primary_key,
            ]);
            setCollectionCentres(transformedData);
            setCollectionCentre(transformedData[0][1]);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Heading>Location</Heading>
            {collectionCentres && (
                <DropdownListInput
                    selectLabelId="collection-centre-select-label"
                    onChange={onCollectionCentreChange}
                    labelsAndValues={collectionCentres}
                    defaultValue={collectionCentres[0][1]}
                />
            )}
            <Heading>Date</Heading>
            <DatePicker onChange={onDateChange} />
        </>
    );
};

const ActionsModal: React.FC<ActionsModalProps> = (props) => {
    const [loading, setLoading] = useState(false);
    const [loadPdf, setLoadPdf] = useState(false);
    const maxParcelsToShow = 5;

    useEffect(() => {
        if (loading && !loadPdf) {
            setLoadPdf(true);
            setLoading(false);
        }
    }, [loading, loadPdf]);

    const [numberOfParcelsToDelete] = useState<number>(props.selectedParcels.length);

    return (
        <Modal {...props}>
            <ModalInner>
                {!loadPdf && props.inputComponent}
                {props.errorText && <small>{props.errorText}</small>}
                {loadPdf ? (
                    <>
                        {props.actionType === "pdfDownload" ? (
                            <Heading> The PDF is ready to be downloaded. </Heading>
                        ) : (
                            <Heading>
                                {numberOfParcelsToDelete === 1 ? "Parcel" : "Parcels"} deleted
                            </Heading>
                        )}

                        <Centerer>{props.children}</Centerer>
                    </>
                ) : (
                    <>
                        {props.actionType === "deleteParcel" && (
                            <Heading>
                                Are you sure you want to delete the selected parcel{" "}
                                {numberOfParcelsToDelete === 1 ? "request" : "requests"}?
                            </Heading>
                        )}
                        {props.showSelectedParcels && (
                            <SelectedParcelsOverview
                                parcels={props.selectedParcels}
                                maxParcelsToShow={maxParcelsToShow}
                            />
                        )}
                        {props.actionType === "pdfDownload" ? (
                            <Centerer>
                                <Button
                                    disabled={loading}
                                    variant="contained"
                                    onClick={() => setLoadPdf(true)}
                                >
                                    {loading ? "Loading..." : "Create PDF"}
                                </Button>
                            </Centerer>
                        ) : (
                            <Centerer>
                                <ConfirmButtons>
                                    <Button
                                        disabled={loading}
                                        variant="contained"
                                        onClick={props.onClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={loading}
                                        variant="contained"
                                        onClick={() => {
                                            setLoading(true);
                                            props.onDeleteParcels(props.selectedParcels);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </ConfirmButtons>
                            </Centerer>
                        )}
                    </>
                )}
            </ModalInner>
        </Modal>
    );
};

export default ActionsModal;
