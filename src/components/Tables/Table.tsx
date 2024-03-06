"use client";

import Icon from "@/components/Icons/Icon";
import { Filter, headerLabelFromKey } from "@/components/Tables/Filters";
import TableFilterBar from "@/components/Tables/TableFilterBar";
import {
    faAnglesDown,
    faAnglesUp,
    faPenToSquare,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { NoSsr, TablePagination } from "@mui/material";
import IconButton from "@mui/material/IconButton/IconButton";
import React, { SetStateAction, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import styled from "styled-components";
import { textFilter } from "./TextFilter";
import { Primitive } from "react-data-table-component/dist/DataTable/types";
import { Supabase } from "@/supabaseUtils";
import { RealtimeChannel, RealtimePostgresChangesFilter } from "@supabase/supabase-js";

export type TableHeaders<Data> = readonly (readonly [keyof Data, string])[];

export interface Row<Data> {
    rowId: number;
    data: Data;
}

export type ColumnDisplayFunction<T> = (data: T) => React.ReactNode;
export type ColumnDisplayFunctions<Data> = {
    [headerKey in keyof Data]?: ColumnDisplayFunction<Data[headerKey]>;
};
export type ColumnStyles<Data> = {
    [headerKey in keyof Data]?: ColumnStyleOptions;
};

export type OnRowClickFunction<Data> = (
    row: Row<Data>,
    event: React.MouseEvent<Element, MouseEvent>
) => void;

export type ColumnStyleOptions = Omit<
    TableColumn<unknown>,
    "name" | "selector" | "sortable" | "sortFunction" | "cell"
>;

export interface SortOptions<Data, Key extends keyof Data> {
    key: Key;
    sortFunction?: (datapoint1: Data[Key], datapoint2: Data[Key]) => number;
}

interface Props<Data> {
    headerKeysAndLabels: TableHeaders<Data>;
    checkboxes?: boolean;
    onRowSelection?: (rowIds: number[]) => void;
    filters?: (Filter<Data, any>)[];
    additionalFilters?: (Filter<Data, any>)[];
    pagination?: boolean;
    defaultShownHeaders?: readonly (keyof Data)[];
    toggleableHeaders?: readonly (keyof Data)[];
    sortable?: (keyof Data | SortOptions<Data, any>)[];
    onEdit?: (data: number) => void;
    onDelete?: (data: number) => void;
    onSwapRows?: (row1: Data, row2: Data) => Promise<void>;
    columnDisplayFunctions?: ColumnDisplayFunctions<Data>;
    columnStyleOptions?: ColumnStyles<Data>;
    onRowClick?: OnRowClickFunction<Data>;
    autoFilter?: boolean;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    getData: (supabase: Supabase, start: number, end: number) => Promise<Data[]>;
    supabase: Supabase;
    getCount: (supabase: Supabase) => Promise<number>;
    subscriptions: RealtimePostgresChangesFilter<"*">[];
}

interface CellProps<Data> {
    row: Row<Data>;
    columnDisplayFunctions: ColumnDisplayFunctions<Data>;
    headerKey: keyof Data;
}

const CustomCell = <Data,>({
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

const defaultColumnStyleOptions = {
    grow: 1,
    minWidth: "2rem",
    maxWidth: "20rem",
} as const;

const Table = <Data,>({
    headerKeysAndLabels,
    checkboxes,
    onRowSelection,
    defaultShownHeaders,
    filters = [],
    additionalFilters: addFilters = [],
    onDelete,
    onEdit,
    onSwapRows,
    pagination,
    sortable = [],
    toggleableHeaders = [],
    onRowClick,
    columnDisplayFunctions = {},
    columnStyleOptions = {},
    autoFilter = true,
    loading,
    setLoading,
    getData,
    supabase,
    getCount,
    subscriptions,
    
}: Props<Data>): React.ReactElement => {
    const [data, setData] = useState<Data[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const getStartPoint = (currentPage: number, perPage: number): number => (currentPage * perPage);
    const getEndPoint = (currentPage: number, perPage: number): number => ((currentPage + 1) * perPage);

    const fetchCount = async () => {
        setTotalRows(await getCount(supabase));
    };

    const fetchData = async (page: number, perPage: number) => {
        setLoading(true);
        const fetchedData = await getData(supabase, getStartPoint(page, perPage), getEndPoint(page, perPage));
        setData(fetchedData);
        setLoading(false);
    }

    useEffect(() => {
        fetchCount();
        fetchData(currentPage, perPage);
    }, []);

    useEffect(() => {
        // This requires that the DB subscribed tables have Realtime turned on
        let subscriptionChannel = supabase
            .channel("table-changes")
        
        subscriptions.forEach((subscription) => subscriptionChannel = subscriptionChannel
            .on("postgres_changes", subscription, async () =>
                {fetchCount();
                fetchData(currentPage, perPage);}
            ))
        subscriptionChannel.subscribe();


        return () => {
            supabase.removeChannel(subscriptionChannel);
        };
    }, []);


    const handlePageChange = (newPage: number) => {
        fetchData(newPage, perPage);
        setCurrentPage(newPage);
    }

    const handlePerRowsChange = async (newPerPage: number, page: number) => {
        fetchData(page, newPerPage);
        setPerPage(newPerPage);
    }

    const [shownHeaderKeys, setShownHeaderKeys] = useState(
        defaultShownHeaders ?? headerKeysAndLabels.map(([key]) => key)
    );

    const shownHeaders = headerKeysAndLabels.filter(([key]) => shownHeaderKeys.includes(key));

    // const toFilter = (filter: Filter<Data, any>): Filter<Data, any> => {
    //     if (filter instanceof Object) {
    //         return filter;
    //     }
    //     // return textFilter<Data, keyof Data>({
    //     //     key: filter,
    //     //     label: headerLabelFromKey(headerKeysAndLabels, filter),
    //     //     getFilteredData(supabase, start, end) {
    //     //         getDa
    //     //     },
    //     // });
    // };

    const [primaryFilters, setPrimaryFilters] = useState(filters);

    const [additionalFilters, setAdditionalFilters] = useState(addFilters);

    const allFilters = [...primaryFilters, ...additionalFilters];

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
        };
    });

    const columns: TableColumn<Row<Data>>[] = shownHeaders.map(([headerKey, headerName]) => {
        const columnStyles = Object.assign(
            { ...defaultColumnStyleOptions },
            columnStyleOptions[headerKey] ?? {}
        );

        const sortOption = sortOptions.find((sortOption) => sortOption.key === headerKey);

        const sortFunction = sortOption?.sortFunction;
        const sortable = sortOption !== undefined;

        return {
            name: <>{headerName}</>,
            selector: (row) => row.data[headerKey] as Primitive, // The type cast here is needed as the type of selector is (row) => Primitive, but as we are using a custom cell, we can have it be anything
            sortable,
            sortFunction: sortFunction
                ? (row1, row2) => sortFunction(row1.data[headerKey], row2.data[headerKey])
                : undefined,
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

    const [isSwapping, setIsSwapping] = useState(false);

    const swapRows = (rowId1: number, upwards: boolean): void => {
        if (isSwapping) {
            return;
        }
        setIsSwapping(true);

        const rowId2 = rowId1 + (upwards ? -1 : 1);

        if (rowId1 < 0 || rowId2 < 0 || rowId1 >= data.length || rowId2 >= data.length) {
            setIsSwapping(false);
            return;
        }

        const clientSideRefresh = (): void => {
            // Update viewed table data once specific functions are done (without re-fetch)
            const newData = [...data];
            const temp = newData[rowId1];
            newData[rowId1] = newData[rowId2];
            newData[rowId2] = temp;

            setData(newData);
            setIsSwapping(false);
        };

        if (onSwapRows) {
            onSwapRows(data[rowId1], data[rowId2]).then(clientSideRefresh);
        } else {
            clientSideRefresh();
        }
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

    if (onDelete || onEdit || onSwapRows) {
        columns.unshift({
            name: "",
            cell: (row: Row<Data>) => (
                <EditAndReorderArrowDiv>
                    {onSwapRows && (
                        <StyledIconButton
                            onClick={() => swapRows(row.rowId, true)}
                            aria-label="reorder row upwards"
                            disabled={isSwapping}
                        >
                            <StyledIcon icon={faAnglesUp} />
                        </StyledIconButton>
                    )}
                    {onEdit && (
                        <StyledIconButton onClick={() => onEdit!(row.rowId)} aria-label="edit">
                            <StyledIcon icon={faPenToSquare} />
                        </StyledIconButton>
                    )}
                    {onSwapRows && (
                        <StyledIconButton
                            onClick={() => swapRows(row.rowId, false)}
                            aria-label="reorder row downwards"
                            disabled={isSwapping}
                        >
                            <StyledIcon icon={faAnglesDown} />
                        </StyledIconButton>
                    )}
                    {onDelete && (
                        <StyledIconButton onClick={() => onDelete!(row.rowId)} aria-label="delete">
                            <StyledIcon icon={faTrashAlt} />
                        </StyledIconButton>
                    )}
                </EditAndReorderArrowDiv>
            ),
            width: "5rem",
        });
    }

    const rows = data.map((data, index) => ({ rowId: index, data }));

    const shouldFilterRow = (row: Row<Data>): boolean => {
        return allFilters.every((filter) => !filter.shouldFilter(row.data, filter.state));
    };

    const toDisplay = autoFilter ? rows.filter(shouldFilterRow) : rows;

    useEffect(() => {
        //fetchCount();
        (async () => {        if (toDisplay.length < perPage) {
            setLoading(true);
            setData(await allFilters[0].getFilteredData(supabase, perPage, allFilters[0].state)); //to do: combine getFilteredData for all filters? maybe just have 1 function for getData that takes in states of all filters :)
            setLoading(false);
        }})();

    }, [toDisplay]);

    const handleClear = (): void => {
        setPrimaryFilters((filters) =>
            filters.map((filter) => ({
                ...filter,
                state: filter.initialState,
            }))
        );
        setAdditionalFilters((filters) =>
            filters.map((filter) => ({
                ...filter,
                state: filter.initialState,
            }))
        );
    };

    return (
        <>
            <TableFilterBar<Data>
                handleClear={handleClear}
                setFilters={setPrimaryFilters}
                toggleableHeaders={toggleableHeaders}
                filters={primaryFilters}
                additionalFilters={additionalFilters}
                setAdditionalFilters={setAdditionalFilters}
                headers={headerKeysAndLabels}
                setShownHeaderKeys={setShownHeaderKeys}
                shownHeaderKeys={shownHeaderKeys}
            />
            <TableStyling>
                <NoSsr>
                    <DataTable
                        columns={columns}
                        data={toDisplay}
                        keyField="rowId"
                        fixedHeader
                        pagination={pagination ?? true}
                        persistTableHead
                        onRowClicked={onRowClick}
                        paginationServer={pagination ?? true}
                        paginationTotalRows={totalRows}
                        paginationDefaultPage={currentPage}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                    />
                </NoSsr>
            </TableStyling>
        </>
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

const TableStyling = styled.div`
    // the component with the filter bars
    & > header {
        background-color: transparent;
        padding: 0;
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
