"use client";

import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import TableFilterBar, { FilterText } from "@/components/Tables/TableFilterBar";
import { styled } from "styled-components";
import { NoSsr } from "@mui/material";
import SpeechBubbleIcon from "../Icons/SpeechBubbleIcon";

export interface Datum {
    data: { [headerKey: string]: string[] | string | number | boolean | null | undefined };
    tooltips?: { [headerKey: string]: string };
}

interface Row {
    rowId: number;
    [headerKey: string]: string | number | boolean;
}

interface Headers {
    [headerKey: string]: string;
}

interface Props {
    data: Datum[];
    headers: Headers;
    checkboxes?: boolean;
}

const RowDiv = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
`;

const Spacer = styled.div`
    width: 2rem;
`;

const doesRowIncludeFilterText = (row: Row, filterText: FilterText, headers: Headers): boolean => {
    for (const headerKey of Object.keys(headers)) {
        if (
            !(row[headerKey] ?? "")
                .toString()
                .toLowerCase()
                .includes((filterText[headerKey] ?? "").toLowerCase())
        ) {
            return false;
        }
    }
    return true;
};

const dataToFilteredRows = (data: Datum[], filterText: FilterText, headers: Headers): Row[] => {
    const rows = dataToRows(data, headers);
    const filteredRows = filterRows(rows, filterText, headers);

    return filteredRows;
};

const dataToRows = (data: Datum[], headers: Headers): Row[] => {
    return data.map((datum: Datum, currentIndex: number) => {
        const row: Row = { rowId: currentIndex };

        for (const headerKey of Object.keys(headers)) {
            const databaseValue = datum.data[headerKey] ?? "";
            row[headerKey] = Array.isArray(databaseValue)
                ? databaseValue.join(", ")
                : databaseValue;
        }

        return row;
    });
};

const filterRows = (rows: Row[], filterText: FilterText, headers: Headers): Row[] => {
    return rows.filter((row) => doesRowIncludeFilterText(row, filterText, headers));
};

const Table: React.FC<Props> = (props) => {
    const [filterText, setFilterText] = useState<FilterText>({});

    const [selectCheckBoxes, setSelectCheckBoxes] = useState(
        new Array<boolean>(props.data.length).fill(false)
    );

    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);

    const toggleOwnCheckBox = (rowId: number): void => {
        const selectCheckBoxesCopy = [...selectCheckBoxes];
        selectCheckBoxesCopy[rowId] = !selectCheckBoxesCopy[rowId];
        setSelectCheckBoxes(selectCheckBoxesCopy);
    };

    const toggleAllCheckBox = (): void => {
        setSelectCheckBoxes(new Array<boolean>(props.data.length).fill(!selectAllCheckBox));
        setSelectAllCheckBox(!selectAllCheckBox);
    };

    useEffect(() => {
        const allChecked = selectCheckBoxes.every((item) => item);
        if (allChecked !== selectAllCheckBox) {
            setSelectAllCheckBox(allChecked);
        }
    }, [selectCheckBoxes, selectAllCheckBox]);

    const columns: TableColumn<Row>[] = Object.entries(props.headers).map(
        ([headerKey, headerName]) => {
            return {
                name: headerName,
                selector: (row: Row) => row[headerKey],
                sortable: true,
                cell(row, rowIndex, column, id) {
                    const tooltip = props.data[rowIndex].tooltips?.[headerKey];
                    const tooltipElement = tooltip ? (
                        <>
                            <Spacer />
                            <SpeechBubbleIcon onHoverText={tooltip} />
                        </>
                    ) : null;
                    return (
                        <RowDiv key={id}>
                            {row[headerKey]}
                            {tooltipElement}
                        </RowDiv>
                    );
                },
            };
        }
    );

    if (props.checkboxes) {
        columns.unshift({
            name: (
                <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={selectAllCheckBox}
                    onClick={toggleAllCheckBox}
                />
            ),
            cell: (row: Row) => (
                <input
                    type="checkbox"
                    aria-label={`Select row ${row.rowId}`}
                    checked={selectCheckBoxes[row.rowId]}
                    onClick={() => toggleOwnCheckBox(row.rowId)}
                />
            ),
            width: "47px",
        });
    }

    const onFilter = (event: React.ChangeEvent<HTMLInputElement>, filterField: string): void => {
        setFilterText({ ...filterText, [filterField]: event.target.value });
    };

    const handleClear = (): void => {
        if (filterText) {
            setFilterText({});
        }
    };

    return (
        <Styling>
            <NoSsr>
                <StyledDataTable
                    columns={columns as any}
                    data={dataToFilteredRows(props.data, filterText, props.headers)}
                    keyField="rowId"
                    subHeader
                    subHeaderComponent={
                        <TableFilterBar
                            filterText={filterText}
                            onFilter={onFilter}
                            handleClear={handleClear}
                            headers={props.headers}
                        />
                    }
                    pagination
                    persistTableHead
                />
            </NoSsr>
        </Styling>
    );
};

const Styling = styled.div`
    // the component with the filter bars
    & > header {
        background-color: transparent;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
        column-gap: 5px;
        row-gap: 2px;
        align-items: center;
        justify-content: start;
        padding: 10px;

        // the clear button
        & > button {
            position: absolute;
            right: 5px;
            bottom: 0px;
            border-radius: 0.4rem;
        }
    }

    // the entire table component including the header and the pagination bar
    & > div {
        border-radius: 0;
        background-color: transparent;

        // the pagination bar
        > nav {
            background-color: transparent;
            color: ${(props) => props.theme.surfaceForegroundColor};
            border-top: solid 1px ${(props) => props.theme.foregroundColor};
        }
    }

    // the table itself
    & .rdt_TableCell,
    & .rdt_TableCol_Sortable,
    & .rdt_TableRow,
    & .rdt_TableHeadRow,
    & .rdt_Table {
        font-size: 0.9rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background-color: transparent;
        color: ${(props) => props.theme.surfaceForegroundColor};
    }

    & .rdt_TableCell {
        // the div containing the text
        & > div {
            white-space: normal;
        }
    }

    & .rdt_TableRow {
        border-bottom-color: ${(props) => props.theme.disabledColor}!important;
    }

    & .rdt_TableHeadRow {
        border-color: ${(props) => props.theme.foregroundColor};
    }

    // the icons in the pagination bar
    & svg {
        fill: ${(props) => props.theme.disabledColor};
    }

    // formatting all children to adhere to the theme
    & > div {
        background-color: ${(props) => props.theme.surfaceBackgroundColor};
        color: ${(props) => props.theme.surfaceForegroundColor};
        border-color: ${(props) => props.theme.disabledColor};
    }

    // the filter bars
    & input[type="text"] {
        color: ${(props) => props.theme.surfaceForegroundColor};

        &::placeholder {
            color: ${(props) => props.theme.disabledColor};
        }

        background-color: ${(props) => props.theme.surfaceBackgroundColor};
        margin: 1px 2px 1px 2px;

        padding: 4px 1px 4px 8px;

        border-radius: 10px;
        width: 10rem;
        border: solid 1px ${(props) => props.theme.disabledColor};
    }
`;

const StyledDataTable = styled(DataTable)`
    & .rdt_TableCell,
    & .rdt_TableCol_Sortable {
        font-size: 0.9rem;
        width: 7rem;
    }

    border-radius: 0;
    background-color: transparent;
`;

export default Table;
