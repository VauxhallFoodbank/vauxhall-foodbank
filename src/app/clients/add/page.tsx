import { Metadata } from "next";

import React from "react";
import AddClientForm, { AddClientFields } from "@/app/clients/add/AddClientForm";
import { Errors, FormErrors } from "@/components/Form/formFunctions";

const AddClients: () => React.ReactElement = () => {
    const initialFields: AddClientFields = {
        fullName: "",
        phoneNumber: "",
        addressLine1: "",
        addressLine2: "",
        addressTown: "",
        addressCounty: "",
        addressPostcode: "",
        adults: [
            { gender: "other", quantity: 0 },
            { gender: "male", quantity: 0 },
            { gender: "female", quantity: 0 },
        ],
        numberChildren: 0,
        children: [],
        dietaryRequirements: {},
        feminineProducts: {},
        babyProducts: null,
        nappySize: "",
        petFood: {},
        otherItems: {},
        deliveryInstructions: "",
        extraInformation: "",
        attentionFlag: false,
        signpostingCall: false,
    };

    const initialFormErrors: FormErrors = {
        fullName: Errors.initial,
        phoneNumber: Errors.none,
        addressLine1: Errors.initial,
        addressPostcode: Errors.initial,
        adults: Errors.initial,
        numberChildren: Errors.initial,
        nappySize: Errors.none,
    };

    return (
        <main>
            <AddClientForm
                initialFields={initialFields}
                initialFormErrors={initialFormErrors}
                editMode={false}
            />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Add Clients",
};

export default AddClients;
