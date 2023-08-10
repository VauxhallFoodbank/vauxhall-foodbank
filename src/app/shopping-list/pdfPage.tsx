"use client";

import { Button, NoSsr } from "@mui/material";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import React from "react";
import ShoppingListPDF from "@/components/ShoppingList/shoppingListPDF";
import { ShoppingListProps } from "@/components/ShoppingList/dataPreparation";

const ShoppingListPage: React.FC<{ data: ShoppingListProps }> = ({ data }) => {
    return (
        <>
            <NoSsr>
                <PDFDownloadLink
                    document={<ShoppingListPDF {...data} />}
                    fileName="shopping-list.pdf"
                >
                    <Button>Save PDF</Button>
                </PDFDownloadLink>
                <PDFViewer width="1000" height="1200">
                    <ShoppingListPDF {...data} />
                </PDFViewer>
            </NoSsr>
        </>
    );
};

export default ShoppingListPage;
