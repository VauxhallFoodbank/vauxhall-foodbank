"use client";

import React, { ReactElement, ReactNode, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import TableFilterBar from "@/components/Tables/TableFilterBar";
import styled from "styled-components";
import { NoSsr } from "@mui/material";
import {
    faAnglesUp,
    faAnglesDown,
    faPenToSquare,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import IconButton from "@mui/material/IconButton/IconButton";
import Icon from "@/components/Icons/Icon";
import { Filter, headerLabelFromKey, textFilter } from "@/components/Tables/Filters";

export type TableHeaders<Data> = readonly (readonly [keyof Data, string])[];

export interface Row<Data> {
    rowId: number;
    data: Data;
}

export type ColumnDisplayFunction<T> = (data: T) => ReactNode;

export type OnRowClickFunction<Data> = (
    row: Row<Data>,
    event: React.MouseEvent<Element, MouseEvent>
) => void;

export interface ColumnStyleOptions {
    grow?: number;
    width?: string;
    minWidth?: string;
    maxWidth?: string;
    right?: boolean;
    center?: boolean;
    wrap?: boolean;
    allowOverflow?: boolean;
    hide?: number;
}

export interface SortOptions<Data, Key extends keyof Data> {
    key: Key;
    sortFunction?: (datapoint1: Data[Key], datapoint2: Data[Key]) => number;
}

interface Props<Data> {
    data: Data[];
    headerKeysAndLabels: TableHeaders<Data>;
    checkboxes?: boolean;
    onRowSelection?: (rowIds: number[]) => void;
    reorderable?: boolean;
    filters?: (Filter<Data, string> | keyof Data)[];
    pagination?: boolean;
    defaultShownHeaders?: readonly (keyof Data)[];
    toggleableHeaders?: readonly (keyof Data)[];
    sortable?: (keyof Data | SortOptions<Data, any>)[];
    onEdit?: (data: number) => void;
    onDelete?: (data: number) => void;
    columnDisplayFunctions?: { [headerKey in keyof Data]?: ColumnDisplayFunction<Data[headerKey]> };
    columnStyleOptions?: { [headerKey in keyof Data]?: ColumnStyleOptions };
    onRowClick?: OnRowClickFunction<Data>;
    autoFilter?: boolean;
}

interface CellProps<Data> {
    row: Row<Data>;
    columnDisplayFunctions: { [headerKey in keyof Data]?: ColumnDisplayFunction<Data[headerKey]> };
    headerKey: keyof Data;
}

const CustomCell = <Data extends unknown>({
    row,
    columnDisplayFunctions,
    headerKey,
}: CellProps<Data>): React.ReactElement => {
    const element: unknown = (
        <>
            {columnDisplayFunctions[headerKey]
                ? columnDisplayFunctions[headerKey]!(row.data[headerKey])
                : row.data[headerKey]}
        </>
    );

    if (!React.isValidElement(element)) {
        throw new Error(
            `${element} is not a valid JSX element, add a column display function for ${String(
                headerKey
            )}`
        );
    }

    return element;
};

const StyledIconButton = styled(IconButton)`
    padding: 0.1rem;
    margin: 0.1rem;
`;

const defaultColumnStyleOptions: ColumnStyleOptions = {
    grow: 1,
    minWidth: "2rem",
    maxWidth: "20rem",
};

const defaultSortFunction = <T extends unknown>(left: T, right: T): number => {
    if (left === right) {
        return 0;
    }
    return left < right ? -1 : 1;
};

const Table = <Data extends unknown>({
    data: inputData,
    headerKeysAndLabels,
    checkboxes,
    onRowSelection,
    defaultShownHeaders,
    filters: filterKeysOrObjects = [],
    onDelete,
    onEdit,
    pagination,
    reorderable = false,
    sortable = [],
    toggleableHeaders = [],
    onRowClick,
    columnDisplayFunctions = {},
    columnStyleOptions = {},
    autoFilter = true,
}: Props<Data>): ReactElement => {
    const [shownHeaderKeys, setShownHeaderKeys] = useState(
        defaultShownHeaders ?? headerKeysAndLabels.map(([key]) => key)
    );

    const shownHeaders = headerKeysAndLabels.filter(([key]) => shownHeaderKeys.includes(key));

    const [filters, setFilters] = useState(
        filterKeysOrObjects.map((filter) => {
            if (filter instanceof Object) {
                return filter;
            }
            return textFilter<Data, keyof Data>({
                key: filter,
                label: headerLabelFromKey(headerKeysAndLabels, filter),
            });
        })
    );

    const [data, setData] = useState(inputData);

    const [selectedCheckboxes, setSelectedCheckboxes] = useState(
        new Array<boolean>(data.length).fill(false)
    );

    const updateCheckboxes = (newSelection: boolean[]): void => {
        setSelectedCheckboxes(newSelection);
        onRowSelection?.(
            newSelection
                .map((selected, index) => (selected ? index : -1))
                .filter((index) => index !== -1)
        );
    };

    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);

    const toggleOwnCheckBox = (rowId: number): void => {
        const selectCheckBoxesCopy = [...selectedCheckboxes];
        selectCheckBoxesCopy[rowId] = !selectCheckBoxesCopy[rowId];
        updateCheckboxes(selectCheckBoxesCopy);
    };

    const toggleAllCheckBox = (): void => {
        const newSelection = new Array<boolean>(data.length).fill(!selectAllCheckBox);
        updateCheckboxes(newSelection);
        setSelectAllCheckBox(!selectAllCheckBox);
    };

    useEffect(() => {
        const allChecked = selectedCheckboxes.every((item) => item);
        if (allChecked !== selectAllCheckBox) {
            setSelectAllCheckBox(allChecked);
        }
    }, [selectedCheckboxes, selectAllCheckBox]);

    const sortOptions = sortable.map((sortOption) => {
        if (sortOption instanceof Object) {
            return sortOption;
        }
        return {
            key: sortOption,
            sortFunction: (datapoint: Data[keyof Data], otherDatapoint: Data[keyof Data]) => {
                if (datapoint === otherDatapoint) {
                    return 0;
                }
                return datapoint < otherDatapoint ? -1 : 1;
            },
        };
    });

    const columns: TableColumn<Row<Data>>[] = (
        toggleableHeaders ? shownHeaders : headerKeysAndLabels
    ).map(([headerKey, headerName]) => {
        const columnStyles = Object.assign(
            { ...defaultColumnStyleOptions },
            columnStyleOptions[headerKey] ?? {}
        );

        const sortOption = sortOptions.find((sortOption) => sortOption.key === headerKey);

        const sortFunction = sortOption?.sortFunction ?? defaultSortFunction;
        const sortable = sortOption !== undefined;

        return {
            name: headerName,
            selector: (row) => row.data[headerKey] ?? "",
            sortable,
            sortFunction: (row1, row2) => sortFunction(row1.data[headerKey], row2.data[headerKey]),
            cell(row) {
                return (
                    <CustomCell
                        row={row}
                        columnDisplayFunctions={columnDisplayFunctions}
                        headerKey={headerKey}
                    />
                );
            },
            ...columnStyles,
        };
    });

    const swapRows = (rowId1: number, rowId2: number): void => {
        if (rowId1 < 0 || rowId2 < 0 || rowId1 >= data.length || rowId2 >= data.length) {
            return;
        }

        const newData = [...data];
        const temp = newData[rowId1];
        newData[rowId1] = newData[rowId2];
        newData[rowId2] = temp;

        setData(newData);
    };

    if (checkboxes) {
        columns.unshift({
            name: (
                <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={selectAllCheckBox}
                    onClick={toggleAllCheckBox}
                />
            ),
            cell: (row: Row<Data>) => (
                <input
                    type="checkbox"
                    aria-label={`Select row ${row.rowId}`}
                    checked={selectedCheckboxes[row.rowId]}
                    onClick={() => toggleOwnCheckBox(row.rowId)}
                />
            ),
            width: "47px",
        });
    }

    if (reorderable || onEdit) {
        columns.unshift({
            name: <p>Sort</p>,
            cell: (row: Row<Data>) => {
                const onEditClick = (): void => {
                    onEdit!(row.rowId);
                };

                return (
                    <EditAndReorderArrowDiv>
                        {reorderable && (
                            <StyledIconButton
                                onClick={() => swapRows(row.rowId, row.rowId - 1)}
                                aria-label="reorder row upwards"
                            >
                                <StyledIcon icon={faAnglesUp} />
                            </StyledIconButton>
                        )}
                        {onEdit && (
                            <StyledIconButton onClick={onEditClick} aria-label="edit">
                                <StyledIcon icon={faPenToSquare} />
                            </StyledIconButton>
                        )}
                        {reorderable && (
                            <StyledIconButton
                                onClick={() => swapRows(row.rowId, row.rowId + 1)}
                                aria-label="reorder row downwards"
                            >
                                <StyledIcon icon={faAnglesDown} />
                            </StyledIconButton>
                        )}
                        {onDelete && (
                            <StyledIconButton
                                onClick={() => onDelete!(row.rowId)}
                                aria-label="delete"
                            >
                                <StyledIcon icon={faTrashAlt} />
                            </StyledIconButton>
                        )}
                    </EditAndReorderArrowDiv>
                );
            },
            width: "5rem",
        });
    }

    const rows = data.map((data, index) => ({ rowId: index, data }));

    const shouldFilterRow = (row: Row<Data>): boolean => {
        return filters.every((filter) => !filter.shouldFilter(row.data, filter.state));
    };

    const toDisplay = autoFilter ? rows.filter(shouldFilterRow) : rows;

    return (
        <Styling>
            <NoSsr>
                <DataTable
                    columns={columns}
                    data={toDisplay}
                    keyField="rowId"
                    fixedHeader
                    subHeader
                    subHeaderComponent={
                        <TableFilterBar<Data>
                            handleClear={() =>
                                setFilters((filters) =>
                                    filters.map((filter) => ({
                                        ...filter,
                                        state: filter.initialState,
                                    }))
                                )
                            }
                            setFilters={setFilters}
                            toggleableHeaders={toggleableHeaders}
                            filters={filters}
                            headers={headerKeysAndLabels}
                            setShownHeaderKeys={setShownHeaderKeys}
                            shownHeaderKeys={shownHeaderKeys}
                        />
                    }
                    pagination={pagination ?? true}
                    persistTableHead
                    onRowClicked={onRowClick}
                />
            </NoSsr>
        </Styling>
    );
};

const EditAndReorderArrowDiv = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
    // this transform is necessary to make the buttons visually consistent with the rest of the table without redesigning the layout
    transform: translateX(-1.2rem);
`;

const StyledIcon = styled(Icon)`
    cursor: pointer;
    padding: 0;
    margin: 0;
`;

const Styling = styled.div`
    // the component with the filter bars
    & > header {
        background-color: transparent;
        display: flex;
        align-items: stretch;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 0.5rem;
        height: 4rem;
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
        border-radius: 1rem;
        background-color: transparent;

        // the pagination bar
        > nav {
            background-color: transparent;
            color: ${(props) => props.theme.main.foreground[0]};
            border: none;
            margin-top: 0.5em;
            font-size: 1rem;

            & option {
                color: ${(props) => props.theme.main.foreground[0]};
                background-color: ${(props) => props.theme.main.background[0]};
            }
        }
    }

    // the icons in the pagination bar
    & svg {
        fill: ${(props) => props.theme.main.lighterForeground[0]};
    }

    // formatting all direct children to adhere to the theme
    & > div {
        background-color: ${(props) => props.theme.main.background[0]};
        color: ${(props) => props.theme.main.foreground[0]};
        border-color: ${(props) => props.theme.main.border};
    }

    // the filter bars
    & input[type="text"] {
        color: ${(props) => props.theme.main.lighterForeground[1]};
        background-color: ${(props) => props.theme.main.background[1]};
        border-radius: 0.5rem;
        border: solid 1px ${(props) => props.theme.main.lighterForeground[1]};

        &::placeholder {
            color: ${(props) => props.theme.main.lighterForeground[1]};
        }

        margin: 1px 2px 1px 2px;
        width: 10rem;
    }

    & div.rdt_TableCell,
    & div.rdt_TableCol {
        // important needed to override the inline style
        padding: 0 0 0 1rem;

        // allowing text overflow so the titles don't get unnecessarily clipped due to react-data-table's layout
        & > * {
            overflow: visible;
        }
    }

    // the table itself
    & .rdt_TableCell,
    & .rdt_TableCol_Sortable,
    & .rdt_TableHeadRow,
    & .rdt_TableRow,
    & .rdt_TableCol,
    & .rdt_Table {
        text-align: start;
        font-size: 1rem;
        background-color: transparent;
        color: ${(props) => props.theme.main.foreground[2]};
    }

    & .rdt_Table {
        border-color: ${(props) => props.theme.main.border};
    }

    & div.rdt_TableRow {
        padding: 0.5rem 0.5rem;
        // important needed to override the inline style
        border-bottom-color: ${(props) => props.theme.main.border};
    }

    & .rdt_TableHeadRow {
        padding: 0.5rem 0.5rem;
        background-color: ${(props) => props.theme.main.background[2]};
        border-color: ${(props) => props.theme.main.border};

        font-weight: bold;
    }

    & .rdt_TableCell {
        // the div containing the text
        & > div {
            white-space: normal;
        }
    }

    & .rdt_Table > div {
        background-color: transparent;
        color: ${(props) => props.theme.main.foreground[2]};
    }
`;

export default Table;
