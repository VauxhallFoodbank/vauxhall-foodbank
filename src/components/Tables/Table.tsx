"use client";

import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import TableFilterBar, { FilterText } from "@/components/Tables/TableFilterBar";
import { styled } from "styled-components";
import { NoSsr } from "@mui/material";
import SpeechBubbleIcon from "../Icons/SpeechBubbleIcon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesUp, faAnglesDown, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { ListRow } from "@/app/lists/dataview";

export interface Datum {
    data: ListRow;
    tooltips: ListRow;
}

interface Row {
    rowId: number;
    [headerKey: string]: string | number | boolean;
}

interface Props {
    data: Datum[];
    // headers is an object of header keys and header labels
    headers: [string, string][];
    checkboxes?: boolean;
    reorderable?: boolean;
    /// filters is an array of the header keys to filter by
    filters?: string[];
    pagination?: boolean;
    defaultShownHeaders?: string[];
    toggleableHeaders?: string[];
}

const RowDiv = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
`;

const Spacer = styled.div`
    width: 2rem;
`;

const doesRowIncludeFilterText = (
    row: Row,
    filterText: FilterText,
    headers: [string, string][]
): boolean => {
    for (const [headerKey, _headerLabel] of headers) {
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

const dataToFilteredRows = (
    data: Datum[],
    filterText: FilterText,
    headers: [string, string][]
): Row[] => {
    const rows = dataToRows(data, headers);
    const filteredRows = filterRows(rows, filterText, headers);
    return filteredRows;
};

const dataToRows = (data: Datum[], headers: [string, string][]): Row[] => {
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

const filterRows = (rows: Row[], filterText: FilterText, headers: [string, string][]): Row[] => {
    return rows.filter((row) => doesRowIncludeFilterText(row, filterText, headers));
};

const Table: React.FC<Props> = (props) => {
    const [shownHeaderKeys, setShownHeaderKeys] = useState(
        props.defaultShownHeaders ?? props.headers.map(([key, _value]) => key)
    );

    const shownHeaders = props.headers.filter(([key, _value]) => shownHeaderKeys.includes(key));

    const [data, setData] = useState(props.data);

    const [filterText, setFilterText] = useState<FilterText>({});

    const [selectCheckBoxes, setSelectCheckBoxes] = useState(
        new Array<boolean>(data.length).fill(false)
    );

    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);

    const toggleOwnCheckBox = (rowId: number): void => {
        const selectCheckBoxesCopy = [...selectCheckBoxes];
        selectCheckBoxesCopy[rowId] = !selectCheckBoxesCopy[rowId];
        setSelectCheckBoxes(selectCheckBoxesCopy);
    };

    const toggleAllCheckBox = (): void => {
        setSelectCheckBoxes(new Array<boolean>(data.length).fill(!selectAllCheckBox));
        setSelectAllCheckBox(!selectAllCheckBox);
    };

    useEffect(() => {
        const allChecked = selectCheckBoxes.every((item) => item);
        if (allChecked !== selectAllCheckBox) {
            setSelectAllCheckBox(allChecked);
        }
    }, [selectCheckBoxes, selectAllCheckBox]);

    const columns: TableColumn<Row>[] = (
        props.toggleableHeaders ? shownHeaders : props.headers
    ).map(([headerKey, headerName]) => {
        return {
            name: headerName,
            selector: (row) => row[headerKey],
            sortable: true,
            cell(row, rowIndex, column, id) {
                const tooltip = data[row.rowId].tooltips?.[headerKey];
                const tooltipElement = tooltip ? (
                    <>
                        <Spacer />
                        <SpeechBubbleIcon onHoverText={tooltip} />
                    </>
                ) : null;
                return (
                    <RowDiv key={id}>
                        {data[row.rowId].data[headerKey]}
                        {tooltipElement}
                    </RowDiv>
                );
            },
        };
    });

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

    if (props.reorderable) {
        columns.unshift({
            name: <></>,
            cell: (row: Row) => (
                <EditandReorderArrowDiv>
                    <StyledIcon
                        onClick={() => {
                            if (row.rowId === 0) {
                                return;
                            }
                            setData((data) => {
                                const newData = [...data];
                                const temp = newData[row.rowId];
                                newData[row.rowId] = newData[row.rowId - 1];
                                newData[row.rowId - 1] = temp;
                                return newData;
                            });
                        }}
                        icon={faAnglesUp}
                    />
                    <StyledIcon icon={faPenToSquare} />
                    <StyledIcon
                        onClick={() => {
                            if (row.rowId === data.length - 1) {
                                return;
                            }
                            setData((data) => {
                                const newData = [...data];
                                const temp = newData[row.rowId];
                                newData[row.rowId] = newData[row.rowId + 1];
                                newData[row.rowId + 1] = temp;
                                return newData;
                            });
                        }}
                        icon={faAnglesDown}
                    />
                </EditandReorderArrowDiv>
            ),
            width: "40px",
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

    const filterKeys = props.filters ?? props.headers.map(([headerKey, _headerLabel]) => headerKey);

    return (
        <Styling>
            <NoSsr>
                <StyledDataTable
                    // types are fine without the cast when not using styled components, not sure what's happening here
                    columns={columns as any}
                    data={dataToFilteredRows(data, filterText, props.headers)}
                    keyField="rowId"
                    fixedHeader
                    subHeader
                    subHeaderComponent={
                        <TableFilterBar
                            filterText={filterText}
                            filterKeys={filterKeys}
                            toggleableHeaders={props.toggleableHeaders}
                            onFilter={onFilter}
                            handleClear={handleClear}
                            headers={props.headers}
                            setShownHeaderKeys={setShownHeaderKeys}
                            shownHeaderKeys={shownHeaderKeys}
                        />
                    }
                    pagination={props.pagination ?? true}
                    persistTableHead
                />
            </NoSsr>
        </Styling>
    );
};

const EditandReorderArrowDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
`;

const StyledIcon = styled(FontAwesomeIcon)`
    cursor: pointer;
`;

const Styling = styled.div`
    // the component with the filter bars
    & > header {
        background-color: transparent;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 10px;
        gap: min(1rem, 5vw);
        overflow: visible;
        @media (min-width: 500px) {
            flex-wrap: nowrap;
        }

        // the clear button
        & > button {
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
    & .rdt_Table {
        font-size: 0.9rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        background-color: transparent;
        color: ${(props) => props.theme.surfaceForegroundColor};
    }

    & .rdt_TableHeadRow {
        background-color: ${(props) => props.theme.surfaceBackgroundColor};
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
