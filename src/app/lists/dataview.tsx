"use client";

import Table from "@/components/Tables/Table";
import supabase from "@/supabase";
import React from "react";
import { styled } from "styled-components";

const TableDiv = styled.div`
    margin: 20px;
    padding: 20px;
    background-color: ${(props) => props.theme.surfaceBackgroundColor};

    border: solid 1px ${(props) => props.theme.surfaceForegroundColor};
    border-radius: 1rem;
`;

const StyledTable = styled(Table)`
    width: 100%;
    background-color: transparent;
`;

type ListRow = { [headerKey: string]: string };

const ListsDataView = async (): Promise<React.ReactElement> => {
    const rawData = (await supabase.from("lists").select("*")).data;

    const data = rawData?.map((row) => {
        const data: ListRow = {
            item_name: row.item_name,
        };
        const tooltips: ListRow = {};

        for (let i = 1; i <= 10; i++) {
            const header = `${i}_quantity`;
            // type cast required as the type system can't infer that the header is a key of row
            data[header] = (row as ListRow)[header];
        }

        return {
            data,
            tooltips,
        };
    });

    if (data === null || data === undefined || data.length === 0) {
        throw new Error("No data found");
    }

    const headers = {
        item_name: "Description",
        "1_quantity": "Single",
        "2_quantity": "Family of 2",
        "3_quantity": "Family of 3",
        "4_quantity": "Family of 4",
        "5_quantity": "Family of 5",
        "6_quantity": "Family of 6",
        "7_quantity": "Family of 7",
        "8_quantity": "Family of 8",
        "9_quantity": "Family of 9",
        "10_quantity": "Family of 10+",
    };

    return (
        <TableDiv>
            <StyledTable checkboxes={false} headers={headers} data={data}></StyledTable>
        </TableDiv>
    );
};

export default ListsDataView;
