"use client";

import Table, { ColumnDisplayFunctions, ColumnStyles } from "@/components/Tables/Table";
import React, { useState } from "react";
import styled from "styled-components";
import EditModal, { EditModalState } from "@/app/lists/EditModal";
import supabase from "@/supabaseClient";
import { Schema } from "@/database_utils";
import ConfirmDialog from "@/components/Modal/Confirm";
import Snackbar from "@mui/material/Snackbar/Snackbar";
import Alert from "@mui/material/Alert/Alert";
import Button from "@mui/material/Button";
import TooltipCell from "@/app/lists/TooltipCell";
import TableSurface from "@/components/Tables/TableSurface";
import CommentBox from "@/app/lists/CommentBox";

interface ListRow {
    itemName: string;
    "1": QuantityAndNotes;
    "2": QuantityAndNotes;
    "3": QuantityAndNotes;
    "4": QuantityAndNotes;
    "5": QuantityAndNotes;
    "6": QuantityAndNotes;
    "7": QuantityAndNotes;
    "8": QuantityAndNotes;
    "9": QuantityAndNotes;
    "10": QuantityAndNotes;
}

interface QuantityAndNotes {
    quantity: string;
    notes: string | null;
}

interface Props {
    data: Schema["lists"][];
    comment: string;
}

export const headerKeysAndLabels = [
    ["itemName", "Description"],
    ["1", "Single"],
    ["2", "Family of 2"],
    ["3", "Family of 3"],
    ["4", "Family of 4"],
    ["5", "Family of 5"],
    ["6", "Family of 6"],
    ["7", "Family of 7"],
    ["8", "Family of 8"],
    ["9", "Family of 9"],
    ["10", "Family of 10"],
] satisfies [keyof ListRow, string][];

const displayQuantityAndNotes = (data: QuantityAndNotes): React.ReactElement => {
    return <TooltipCell cellValue={data.quantity} tooltipValue={data.notes ?? ""} />;
};

const listDataViewColumnDisplayFunctions = {
    ...Object.fromEntries(
        headerKeysAndLabels.slice(1).map(([key]) => [key, displayQuantityAndNotes])
    ),
} satisfies ColumnDisplayFunctions<ListRow>;

const listsColumnStyleOptions: ColumnStyles<ListRow> = {
    itemName: {
        minWidth: "8rem",
    },
    ...Object.fromEntries(
        headerKeysAndLabels.slice(1).map(([key]) => [
            key,
            {
                minWidth: "10rem",
                center: true,
            },
        ])
    ),
};

const ListsDataView: React.FC<Props> = (props) => {
    const [modal, setModal] = useState<EditModalState>();
    const [toDelete, setToDelete] = useState<number | null>(null);
    // need another setState otherwise the modal content changes before the close animation finishes
    const [toDeleteModalOpen, setToDeleteModalOpen] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    if (props.data === null) {
        throw new Error("No data found");
    }

    const rows = props.data.map((row) => {
        const newRow = {
            itemName: row.item_name,
            ...Object.fromEntries(
                headerKeysAndLabels.slice(1).map(([key]) => [
                    key,
                    {
                        quantity: row[`${key}_quantity` as keyof Schema["lists"]],
                        notes: row[`${key}_notes` as keyof Schema["lists"]],
                    },
                ])
            ),
        } as ListRow; // this cast is needed here as the type system can't infer what Object.fromEntries will return
        return newRow;
    });

    const toggleableHeaders = headerKeysAndLabels.map(([key]) => key);

    // remove description header
    toggleableHeaders.shift();

    const onEdit = (index: number): void => {
        setModal(props.data[index]);
    };

    const onDeleteButtonClick = (index: number): void => {
        setToDelete(index);
        setToDeleteModalOpen(true);
    };

    const onConfirmDeletion = async (): Promise<void> => {
        if (toDelete !== null) {
            const data = props.data[toDelete];
            const { error } = await supabase
                .from("lists")
                .delete()
                .eq("primary_key", data.primary_key);

            if (error) {
                setErrorMsg(error.message);
            } else {
                window.location.reload();
            }
        }
    };

    return (
        <>
            <ConfirmDialog
                message={`Are you sure you want to delete ${
                    toDelete ? props.data[toDelete].item_name : ""
                }?`}
                isOpen={toDeleteModalOpen}
                onConfirm={onConfirmDeletion}
                onCancel={() => {
                    setToDeleteModalOpen(false);
                }}
            />

            <Snackbar
                message={errorMsg}
                autoHideDuration={3000}
                onClose={() => setErrorMsg(null)}
                open={errorMsg !== null}
            >
                <SnackBarDiv>
                    <Alert severity="error">{errorMsg}</Alert>
                </SnackBarDiv>
            </Snackbar>
            <EditModal onClose={() => setModal(undefined)} data={modal} key={modal?.primary_key} />
            <TableSurface>
                <CommentBox originalComment={props.comment} />
                <Table<ListRow>
                    checkboxes={false}
                    headerKeysAndLabels={headerKeysAndLabels}
                    toggleableHeaders={toggleableHeaders}
                    data={rows}
                    reorderable
                    filters={["itemName"]}
                    pagination={false}
                    onEdit={onEdit}
                    onDelete={onDeleteButtonClick}
                    sortable={[]}
                    columnDisplayFunctions={listDataViewColumnDisplayFunctions}
                    columnStyleOptions={listsColumnStyleOptions}
                />
                <ButtonMargin>
                    <Button variant="contained" onClick={() => setModal(null)}>
                        + Add
                    </Button>
                </ButtonMargin>
            </TableSurface>
        </>
    );
};

export const SnackBarDiv = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;

    & .MuiAlert-standard {
        border-radius: 0.2rem;
        padding: 0 1rem;
    }
`;

const ButtonMargin = styled.div`
    margin: 15px 5px 5px 0;
`;

export default ListsDataView;
