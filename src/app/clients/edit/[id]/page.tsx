import { Metadata } from "next";

import React from "react";
import supabase from "@/supabaseServer";
import ClientForm from "@/app/clients/form/ClientForm";
import { Errors, FormErrors } from "@/components/Form/formFunctions";
import autofill from "@/app/clients/edit/[id]/autofill";
import { fetchClient, fetchFamily } from "@/common/fetch";

interface EditClientsParameters {
    params: { id: string };
}

const EditClients: ({ params }: EditClientsParameters) => Promise<React.ReactElement> = async ({
    params,
}: EditClientsParameters) => {
    const clientData = await fetchClient(params.id, supabase);
    const familyData = await fetchFamily(clientData.family_id, supabase);
    const initialFields = autofill(clientData, familyData);
    const initialFormErrors: FormErrors = {
        fullName: Errors.none,
        phoneNumber: Errors.none,
        addressLine1: Errors.none,
        addressPostcode: Errors.none,
        adults: Errors.none,
        numberChildren: Errors.none,
        nappySize: Errors.none,
    };
    return (
        <main>
            <ClientForm
                initialFields={initialFields}
                initialFormErrors={initialFormErrors}
                editMode
                clientID={params.id}
            />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Edit Clients",
};

export default EditClients;
