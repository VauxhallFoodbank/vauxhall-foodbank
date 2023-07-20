"use client";

import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import TableFilterBar, { FilterText } from "@/components/Tables/TableFilterBar";

export interface Datum {
    [headerKey: string]: string[] | string | number | boolean | null;
}

interface Row {
    rowId: number;
    [headerKey: string]: string[] | string | number | boolean;
}

interface Headers {
    [headerKey: string]: string;
}

interface Props {
    data: Datum[];
    headers: Headers;
}

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
            row[headerKey] = datum[headerKey] ?? "";
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

    // Fixes hydration error by re-rendering when the DOM is ready - https://nextjs.org/docs/messages/react-hydration-error
    const [domLoaded, setDomLoaded] = useState(false);
    useEffect(() => {
        setDomLoaded(true);
    }, []);

    const columns: TableColumn<Row>[] = Object.entries(props.headers).map(
        ([headerKey, headerName]) => {
            return {
                name: headerName,
                selector: (row: Row) => row[headerKey],
                sortable: true,
            };
        }
    );

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

    const onFilter = (event: React.ChangeEvent<HTMLInputElement>, filterField: string): void => {
        setFilterText({ ...filterText, [filterField]: event.target.value });
    };

    const handleClear = (): void => {
        if (filterText) {
            setFilterText({});
        }
    };

    if (!domLoaded) {
        return <></>;
    }

    return (
        <DataTable
            columns={columns}
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
    );
};

export default Table;
