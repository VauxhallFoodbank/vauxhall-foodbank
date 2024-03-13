import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import { UserRow } from "@/app/admin/page";
import styled from "styled-components";
import Modal from "@/components/Modal/Modal";
import { deleteUser } from "@/app/admin/adminActions";
import OptionButtonsDiv from "@/app/admin/common/OptionButtonsDiv";
import { SetAlertOptions } from "@/app/admin/common/SuccessFailureAlert";
import { v4 as uuidv4 } from "uuid";
import { logError, logInfo } from "@/logger/logger";

const DangerDialog = styled(Modal)`
    .MuiPaper-root > div:first-child {
        background-color: ${(props) => props.theme.error};
        text-transform: uppercase;
    }

    button {
        text-transform: uppercase;
    }
`;

interface Props {
    userToDelete: UserRow | null;
    setUserToDelete: (user: UserRow | null) => void;
    setAlertOptions: SetAlertOptions;
}

const DeleteUserDialog: React.FC<Props> = (props) => {
    if (props.userToDelete === null) {
        return <></>;
    }

    const onDeleteConfirm = async (): Promise<void> => {
        const { error } = await deleteUser(props.userToDelete!.id);

        if (!error) {
            props.setAlertOptions({
                success: true,
                message: (
                    <>
                        User <b>{props.userToDelete!.email}</b> deleted successfully.
                    </>
                ),
            });
            void logInfo(`${props.userToDelete?.email} deleted successfully.`);
        } else {
            props.setAlertOptions({
                success: false,
                message: <>Delete User Operation Failed</>,
            });
            const id = uuidv4();
            const meta = {
                error: error,
                id: id,
                location: "app/admin/deleteUser/DeleteUserDialog.tsx",
            };
            void logError("Error with delete: User", meta);
        }

        props.setUserToDelete(null);
    };

    const onDeleteCancel = (): void => {
        props.setUserToDelete(null);
    };

    return (
        <DangerDialog
            header="Delete User"
            headerId="deleteUserDialog"
            isOpen
            onClose={onDeleteCancel}
        >
            Are you sure you want to delete user <b>{props.userToDelete.email}</b>
            ?
            <br />
            <OptionButtonsDiv>
                <Button
                    color="error"
                    variant="outlined"
                    startIcon={<DeleteIcon />}
                    onClick={onDeleteConfirm}
                >
                    Confirm
                </Button>
                <Button color="secondary" onClick={onDeleteCancel}>
                    Cancel
                </Button>
            </OptionButtonsDiv>
        </DangerDialog>
    );
};

export default DeleteUserDialog;
