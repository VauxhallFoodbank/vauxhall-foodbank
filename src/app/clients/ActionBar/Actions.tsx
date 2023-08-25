"use client";

import React, { useState } from "react";
import Menu from "@mui/material/Menu/Menu";
import MenuList from "@mui/material/MenuList/MenuList";
import MenuItem from "@mui/material/MenuItem/MenuItem";
import dayjs, { Dayjs } from "dayjs";
import { ClientsTableRow } from "@/app/clients/getClientsTableData";
import ActionsModal, {
    DayOverviewInput,
    DriverOverviewInput,
} from "@/app/clients/ActionBar/ActionsModal";
import {
    DayOverviewModalButton,
    DriverOverviewModalButton,
    ShippingLabelsModalButton,
    ShoppingListModalButton,
} from "@/app/clients/ActionBar/ActionsModalButton";
import { SelectChangeEvent } from "@mui/material";

const isNotMoreThanOne = (value: number): boolean => {
    return value < 1;
};

const doesNotEqualsOne = (value: number): boolean => {
    return value !== 1;
};

const doesNotEqualsZero = (value: number): boolean => {
    return value !== 0;
};

type PdfType =
    | "Download Shipping Labels"
    | "Download Shopping List"
    | "Download Driver Overview"
    | "Download Day Overview";

type AvailableActionsType = {
    [pdfKey in PdfType]: {
        showSelectedParcels: boolean;
        errorCondition: (value: number) => boolean;
        errorMessage: string;
    };
};

const availableActions: AvailableActionsType = {
    "Download Shipping Labels": {
        showSelectedParcels: true,
        errorCondition: isNotMoreThanOne,
        errorMessage: "Please select at least 1 row for download.",
    },
    "Download Shopping List": {
        showSelectedParcels: true,
        errorCondition: doesNotEqualsOne,
        errorMessage: "Please select only 1 row for download.",
    },
    "Download Driver Overview": {
        showSelectedParcels: true,
        errorCondition: isNotMoreThanOne,
        errorMessage: "Please select at least 1 row for download.",
    },
    "Download Day Overview": {
        showSelectedParcels: false,
        errorCondition: doesNotEqualsZero,
        errorMessage:
            "The day overview will show the parcels for a particular date and location. It will show not the currently selected parcel. Please unselect the parcels.",
    },
};

interface ActionsInputComponentProps {
    pdfType: PdfType;
    onDateChange: (newDate: Dayjs | null) => void;
    onDriverNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onCollectionCentreChange: (event: SelectChangeEvent) => void;
    setCollectionCentre: React.Dispatch<React.SetStateAction<string>>;
}

const ActionsInputComponent: React.FC<ActionsInputComponentProps> = ({
    pdfType,
    onDateChange,
    onDriverNameChange,
    onCollectionCentreChange,
    setCollectionCentre,
}) => {
    switch (pdfType) {
        case "Download Driver Overview":
            return (
                <DriverOverviewInput
                    onDateChange={onDateChange}
                    onDriverNameChange={onDriverNameChange}
                />
            );
        case "Download Day Overview":
            return (
                <DayOverviewInput
                    onDateChange={onDateChange}
                    onCollectionCentreChange={onCollectionCentreChange}
                    setCollectionCentre={setCollectionCentre}
                />
            );
        default:
            <></>;
    }
};

interface ActionsButtonProps {
    pdfType: PdfType;
    data: ClientsTableRow[];
    date: Dayjs;
    driverName: string;
    collectionCentre: string;
}

const ActionsButton: React.FC<ActionsButtonProps> = ({
    pdfType,
    data,
    date,
    driverName,
    collectionCentre,
}) => {
    switch (pdfType) {
        case "Download Shipping Labels":
            return <ShippingLabelsModalButton data={data} />;
        case "Download Shopping List":
            return <ShoppingListModalButton data={data} />;
        case "Download Driver Overview":
            return <DriverOverviewModalButton data={data} date={date} driverName={driverName} />;
        case "Download Day Overview":
            return (
                <DayOverviewModalButton collectionCentre={collectionCentre} date={date.toDate()} />
            );
        default:
            <></>;
    }
};

interface Props {
    selected: number[];
    data: ClientsTableRow[];
    actionAnchorElement: HTMLElement | null;
    setActionAnchorElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
    modalError: string | null;
    setModalError: React.Dispatch<React.SetStateAction<string | null>>;
}

const Actions: React.FC<Props> = ({
    selected,
    data,
    actionAnchorElement,
    setActionAnchorElement,
    modalError,
    setModalError,
}) => {
    const [selectedAction, setSelectedAction] = useState<PdfType | null>(null);
    const [date, setDate] = useState(dayjs(new Date()));
    const [driverName, setDriverName] = useState("");
    const [collectionCentre, setCollectionCentre] = useState("");

    const selectedData = Array.from(selected.map((index) => data[index]));

    const onDriverNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setDriverName(event.target.value);
    };

    const onCollectionCentreChange = (event: SelectChangeEvent): void => {
        setCollectionCentre(event.target.value);
    };

    const onDateChange = (newDate: Dayjs | null): void => {
        setDate(newDate!);
    };

    const onModalClose = (): void => {
        setSelectedAction(null);
        setModalError(null);
        setDate(dayjs(new Date()));
        setDriverName("");
    };

    const onMenuItemClick = (
        key: PdfType,
        errorCondition: (value: number) => boolean,
        errorMessage: string
    ): (() => void) => {
        return () => {
            if (errorCondition(selectedData.length)) {
                setActionAnchorElement(null);
                setModalError(errorMessage);
            } else {
                setSelectedAction(key);
                setActionAnchorElement(null);
                setModalError(null);
            }
        };
    };

    return (
        <>
            {Object.entries(availableActions).map(([key, value]) => {
                return (
                    selectedAction === key && (
                        <ActionsModal
                            key={key}
                            showSelectedParcels={value.showSelectedParcels}
                            isOpen
                            onClose={onModalClose}
                            data={selectedData}
                            header={key}
                            headerId="action-modal-header"
                            errorText={modalError}
                            inputComponent={
                                <ActionsInputComponent
                                    pdfType={key}
                                    onDateChange={onDateChange}
                                    onDriverNameChange={onDriverNameChange}
                                    onCollectionCentreChange={onCollectionCentreChange}
                                    setCollectionCentre={setCollectionCentre}
                                />
                            }
                        >
                            <ActionsButton
                                pdfType={selectedAction}
                                data={selectedData}
                                date={date}
                                driverName={driverName}
                                collectionCentre={collectionCentre}
                            />
                        </ActionsModal>
                    )
                );
            })}
            {actionAnchorElement && (
                <Menu
                    open
                    onClose={() => setActionAnchorElement(null)}
                    anchorEl={actionAnchorElement}
                >
                    <MenuList id="action-menu">
                        {Object.entries(availableActions).map(([key, value]) => {
                            return (
                                <MenuItem
                                    key={key}
                                    onClick={onMenuItemClick(
                                        key as PdfType,
                                        value.errorCondition,
                                        value.errorMessage
                                    )}
                                >
                                    {key}
                                </MenuItem>
                            );
                        })}
                    </MenuList>
                </Menu>
            )}
        </>
    );
};

export default Actions;
