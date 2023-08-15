import { Metadata } from "next";
import React from "react";
import AddParcelForm from "@/app/parcels/add/AddParcelForm";

interface AddParcelParameters {
    params: { id: string };
}

const AddParcels: ({ params }: AddParcelParameters) => React.ReactElement = ({ params }) => {
    return (
        <main>
            <AddParcelForm id={params.id} />
        </main>
    );
};

export const metadata: Metadata = {
    title: "Add Parcels",
};

export default AddParcels;
