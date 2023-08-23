import React, { useState } from "react";
import { EditHeader, EditOption } from "@/app/admin/manageUser/ManageUserModal";
import UserRoleDropdownInput from "@/app/admin/common/UserRoleDropdownInput";
import { getDropdownListHandler } from "@/components/DataInput/inputHandlerFactories";
import { UserRow } from "@/app/admin/page";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OptionButtonsDiv from "@/app/admin/common/OptionButtonsDiv";
import { faUserPen } from "@fortawesome/free-solid-svg-icons/faUserPen";
import { updateUser } from "@/app/admin/adminActions";
import { AlertOptions } from "@/app/admin/common/SuccessFailureAlert";

interface Props {
    userToEdit: UserRow;
    onCancel: () => void;
    onConfirm: (alertOptions: AlertOptions) => void;
}

const EditUserForm: React.FC<Props> = (props) => {
    const [role, setRole] = useState<string>(props.userToEdit.userRole);

    const onEditConfirm = async (): Promise<void> => {
        const response = await updateUser({
            userId: props.userToEdit.id,
            attributes: { app_metadata: { role } },
        });

        if (response.error === null) {
            props.onConfirm({
                success: true,
                message: (
                    <>
                        User <b>{props.userToEdit.email}</b> updated successfully.
                    </>
                ),
            });
        } else {
            props.onConfirm({ success: false, message: <>Edit User Operation Failed</> });
        }
    };

    return (
        <>
            <EditOption>
                <EditHeader>Role</EditHeader>
                <UserRoleDropdownInput
                    defaultValue={props.userToEdit.userRole}
                    onChange={getDropdownListHandler((role: string) => setRole(role))}
                />
            </EditOption>

            <OptionButtonsDiv>
                <Button
                    variant="outlined"
                    startIcon={<FontAwesomeIcon icon={faUserPen} />}
                    onClick={onEditConfirm}
                >
                    Confirm Edit
                </Button>
                <Button color="secondary" onClick={props.onCancel}>
                    Cancel
                </Button>
            </OptionButtonsDiv>
        </>
    );
};

export default EditUserForm;
