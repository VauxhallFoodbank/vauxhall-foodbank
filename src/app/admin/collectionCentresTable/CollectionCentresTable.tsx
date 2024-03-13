"use client";

import React, { useState } from "react";
import Table, { TableHeaders } from "@/components/Tables/Table";
import styled from "styled-components";
import Modal from "@/components/Modal/Modal";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshPageButton from "@/app/admin/common/RefreshPageButton";
import { Schema } from "@/databaseUtils";
import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { v4 as uuidv4 } from "uuid";
import { logError } from "@/logger/logger";

const DangerDialog = styled(Modal)`
    & .header {
        background-color: ${(props) => props.theme.error};
        text-transform: uppercase;
    }

    button {
        text-transform: uppercase;
    }
`;

export const OptionButtonDiv = styled.div`
    display: flex;
    padding-top: 1rem;
    gap: 1rem;
    justify-content: center;
`;

const collectionCentresTableHeaderKeysAndLabels: TableHeaders<Schema["collection_centres"]> = [
    ["primary_key", "Centre ID"],
    ["name", "Name"],
    ["acronym", "Acronym"],
];

interface Props {
    collectionCentreData: Schema["collection_centres"][];
}

const CollectionCentresTables: React.FC<Props> = (props) => {
    const [collectionCentreToDelete, setCollectionCentreToDelete] =
        useState<Schema["collection_centres"]>();
    const [refreshRequired, setRefreshRequired] = useState(false);

    const collectionCentreOnDelete = (rowIndex: number): void => {
        setCollectionCentreToDelete(props.collectionCentreData[rowIndex]); // TODO VFB-25 Change onDelete in table to return row
    };

    const onCollectionCentreDeleteConfirmation = async (): Promise<void> => {
        const { error } = await supabase
            .from("collection_centres")
            .delete()
            .eq("name", collectionCentreToDelete!.name);

        if (error) {
            const id = uuidv4();
            const meta = {
                error: error,
                id: id,
                location: "app/admin/collectionCentresTable/CollectionCentresTable.tsx",
            };
            void logError("Error with delete: Collection centre data", meta);
            throw new DatabaseError("delete", "collection centre data");
        }

        setCollectionCentreToDelete(undefined);
        setRefreshRequired(true);
    };

    const onCollectionCentreDeleteCancellation = (): void => {
        setCollectionCentreToDelete(undefined);
    };

    return (
        <>
            <Table
                data={props.collectionCentreData}
                headerKeysAndLabels={collectionCentresTableHeaderKeysAndLabels}
                onDelete={collectionCentreOnDelete}
                defaultShownHeaders={["name", "acronym"]}
                filters={["name", "acronym"]}
                toggleableHeaders={["primary_key"]}
                checkboxConfig={{ displayed: false }}
            />

            {refreshRequired && (
                <OptionButtonDiv>
                    <RefreshPageButton />
                </OptionButtonDiv>
            )}

            <DangerDialog
                header="Delete Collection Centre"
                headerId="deleteCollectionCentreDialog"
                isOpen={collectionCentreToDelete !== undefined}
                onClose={onCollectionCentreDeleteCancellation}
            >
                Are you sure you want to delete collection centre
                <b>{collectionCentreToDelete ? ` ${collectionCentreToDelete.name}` : ""}</b>?
                <OptionButtonDiv>
                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        onClick={onCollectionCentreDeleteConfirmation}
                    >
                        Confirm
                    </Button>
                    <Button color="secondary" onClick={onCollectionCentreDeleteCancellation}>
                        Cancel
                    </Button>
                </OptionButtonDiv>
            </DangerDialog>
        </>
    );
};

export default CollectionCentresTables;
