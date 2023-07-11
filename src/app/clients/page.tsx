"use client";
import supabase, { Schema } from "@/supabase";
import { Metadata } from "next";

import React, { useEffect, useState } from "react";
import DataViewer from "@/components/DataViewer/DataViewer";

const dataFetch: () => Promise<Schema["clients"][] | null> = async () => {
    const response = await supabase.from("clients").select();
    return response.data;
};

const Clients: () => Promise<React.ReactElement> = async () => {
    const [isOpen, setIsOpen] = useState(false);
    console.log("rendered");
    console.log(isOpen);

    useEffect(() => {
        setIsOpen(true);
        console.log("useEffect");
    }, []);

    const closeModal: () => void = () => {
        setIsOpen(false);
        console.log(isOpen);
    };

    const data = await dataFetch();
    return (
        <main>
            <h1> Clients Page </h1>

            {/* This should be a separate component which is passed data via props */}
            {/* <pre>{JSON.stringify(data, null, 4)}</pre> */}

            {data !== null && (
                <DataViewer
                    data={data[0]}
                    title="Client details"
                    isOpen={isOpen}
                    onRequestClose={closeModal}
                />
            )}
        </main>
    );
};

export const metadata: Metadata = {
    title: "Clients",
};

export default Clients;
