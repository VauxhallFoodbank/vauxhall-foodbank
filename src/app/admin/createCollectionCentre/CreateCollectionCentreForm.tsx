"use client";

import React, { useState } from "react";
import { CenterComponent, FormErrorText, StyledForm } from "@/components/Form/formStyling";
import Button from "@mui/material/Button";
import {
    checkErrorOnSubmit,
    Errors,
    FormErrors,
    setError,
    setField,
} from "@/components/Form/formFunctions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingCircleArrowRight } from "@fortawesome/free-solid-svg-icons";
import RefreshPageButton from "@/app/admin/common/RefreshPageButton";
import { InsertSchema } from "@/databaseUtils";
import NameCard from "@/app/admin/createCollectionCentre/NameCard";
import AcronymCard from "@/app/admin/createCollectionCentre/AcronymCard";
import supabase from "@/supabaseClient";
import { logErrorReturnLogId, logInfoReturnLogId } from "@/logger/logger";
import { DatabaseError } from "@/app/errorClasses";

const initialFields: InsertSchema["collection_centres"] = {
    name: "",
    acronym: "",
};

const initialFormErrors: FormErrors = {
    name: Errors.initial,
    acronym: Errors.initial,
};

const formSections = [NameCard, AcronymCard];

const getCustomErrorMessage = (errorCode: string): string | null => {
    if (errorCode === "23505") {
        return "A Collection Centre with this name/abbreviation has already been added. Please choose a different name/abbreviation";
    }
    return null;
};

const CreateCollectionCentreForm: React.FC<{}> = () => {
    const [fields, setFields] = useState(initialFields);
    const [formErrors, setFormErrors] = useState(initialFormErrors);

    const [submitErrorMessage, setSubmitErrorMessage] = useState("");
    const [submitDisabled, setSubmitDisabled] = useState(false);

    const [refreshRequired, setRefreshRequired] = useState(false);

    const fieldSetter = setField(setFields, fields);
    const errorSetter = setError(setFormErrors, formErrors);

    const submitForm = async (): Promise<void> => {
        setSubmitDisabled(true);

        if (checkErrorOnSubmit(formErrors, setFormErrors)) {
            setSubmitDisabled(false);
            return;
        }

        const { error } = await supabase.from("collection_centres").insert(fields);

        if (error) {
            const errorMessage =
                getCustomErrorMessage(error.code) ?? `${error.message}\n${Errors.external}`;
            setSubmitErrorMessage(errorMessage);
            setSubmitDisabled(false);

            const logId = await logErrorReturnLogId("Error with insert: collection centre", error);
            throw new DatabaseError("insert", "collection centres", logId);
        }

        setSubmitErrorMessage("");
        setSubmitDisabled(false);
        setRefreshRequired(true);
        void logInfoReturnLogId(`Collection centre: ${fields.name} has been created successfully.`);
    };

    return (
        <CenterComponent>
            <StyledForm>
                {formSections.map((Card, index) => (
                    <Card
                        key={index} // eslint-disable-line react/no-array-index-key
                        fields={fields}
                        fieldSetter={fieldSetter}
                        formErrors={formErrors}
                        errorSetter={errorSetter}
                    />
                ))}

                {refreshRequired ? (
                    <RefreshPageButton />
                ) : (
                    <Button
                        startIcon={<FontAwesomeIcon icon={faBuildingCircleArrowRight} />}
                        variant="contained"
                        onClick={submitForm}
                        disabled={submitDisabled}
                    >
                        Create Collection Centre
                    </Button>
                )}

                <FormErrorText>{submitErrorMessage}</FormErrorText>
            </StyledForm>
        </CenterComponent>
    );
};

export default CreateCollectionCentreForm;
