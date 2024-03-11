"use client";

import Icon from "@/components/Icons/Icon";
import { Filter } from "@/components/Tables/Filters";
import TableFilterBar from "@/components/Tables/TableFilterBar";
import {
    faAnglesDown,
    faAnglesUp,
    faPenToSquare,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { NoSsr } from "@mui/material";
import IconButton from "@mui/material/IconButton/IconButton";
import React, { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import styled from "styled-components";
import { Primitive, SortOrder } from "react-data-table-component/dist/DataTable/types";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { Database } from "@/databaseTypesFile";

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
    sortMethod: (
        query: PostgrestFilterBuilder<Database["public"], any, any>,
        sortDirection: SortOrder
    ) => PostgrestFilterBuilder<Database["public"], any, any>;
}

interface ActiveSortState<Data> {
    sort: true;
    sortDirection: SortOrder;
    column: CustomColumn<Data>;
}
interface InactiveSortState {
    sort: false;
}
export type SortState<Data> = ActiveSortState<Data> | InactiveSortState;

export interface CustomColumn<Data> extends TableColumn<Row<Data>> {
    sortMethod?: (
        query: PostgrestFilterBuilder<Database["public"], any, any>,
        sortDirection: SortOrder
    ) => PostgrestFilterBuilder<Database["public"], any, any>;
}

export type CheckboxConfig<Data> =
    | {
          displayed: true;
          selectedRowIds: string[];
          isAllCheckboxChecked: boolean;
          onCheckboxClicked: (data: Data) => void;
          onAllCheckboxClicked: (isAllCheckboxChecked: boolean) => void;
          isRowChecked: (data: Data) => boolean;
      }
    | {
          displayed: false;
      };

interface Props<Data> {
    dataPortion: Data[];
    setDataPortion: (dataPortion: Data[]) => void;
    totalRows: number;
    headerKeysAndLabels: TableHeaders<Data>;
    onPageChange: (newPage: number) => void;
    onPerPageChage: (perPage: number) => void;
    setSortState?: (sortState: SortState<Data>) => void;
    primaryFilters?: Filter<any>[];
    additionalFilters?: Filter<any>[];
    setPrimaryFilters?: (primaryFilters: Filter<any>[]) => void;
    setAdditionalFilters?: (primaryFilters: Filter<any>[]) => void;
    checkboxConfig: CheckboxConfig<Data>;
    pagination?: boolean;
    defaultShownHeaders?: readonly (keyof Data)[];
    toggleableHeaders?: readonly (keyof Data)[];
    sortableColumns?: SortOptions<Data, any>[];
    onEdit?: (data: number) => void;
    onDelete?: (data: number) => void;
    onSwapRows?: (row1: Data, row2: Data) => Promise<void>;
    columnDisplayFunctions?: ColumnDisplayFunctions<Data>;
    columnStyleOptions?: ColumnStyles<Data>;
    onRowClick?: OnRowClickFunction<Data>;
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
    dataPortion,
    setDataPortion,
    totalRows,
    headerKeysAndLabels,
    defaultShownHeaders,
    primaryFilters = [],
    setPrimaryFilters = () => {},
    additionalFilters = [],
    setAdditionalFilters = () => {},
    onDelete,
    onEdit,
    onSwapRows,
    pagination,
    sortableColumns = [],
    toggleableHeaders = [],
    onRowClick,
    columnDisplayFunctions = {},
    columnStyleOptions = {},
    onPageChange,
    onPerPageChage,
    setSortState = () => {},
    checkboxConfig,
}: Props<Data>): React.ReactElement => {
    const [shownHeaderKeys, setShownHeaderKeys] = useState(
        defaultShownHeaders ?? headerKeysAndLabels.map(([key]) => key)
    );

    const shownHeaders = headerKeysAndLabels.filter(([key]) => shownHeaderKeys.includes(key));

    const columns: CustomColumn<Data>[] = shownHeaders.map(([headerKey, headerName]) => {
        const columnStyles = Object.assign(
            { ...defaultColumnStyleOptions },
            columnStyleOptions[headerKey] ?? {}
        );

        const sortMethod = sortableColumns.find((sortMethod) => sortMethod.key === headerKey);

        const sortable = sortMethod !== undefined;

        return {
            name: <>{headerName}</>,
            selector: (row) => row.data[headerKey] as Primitive, // The type cast here is needed as the type of selector is (row) => Primitive, but as we are using a custom cell, we can have it be anything
            sortable,
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
            sortField: headerKey,
            ...(sortMethod ?? { sortMethod: sortMethod }),
        };
    });

    const handleSort = async (
        column: CustomColumn<Data>,
        sortDirection: SortOrder
    ): Promise<void> => {
        if (Object.keys(column).length) {
        setSortState({
            sort: true,
            column: column,
            sortDirection: sortDirection,
        });}
    };

    const [isSwapping, setIsSwapping] = useState(false);

    const swapRows = (rowId1: number, upwards: boolean): void => {
        if (isSwapping) {
            return;
        }
        setIsSwapping(true);

        const rowId2 = rowId1 + (upwards ? -1 : 1);

        if (
            rowId1 < 0 ||
            rowId2 < 0 ||
            rowId1 >= dataPortion.length ||
            rowId2 >= dataPortion.length
        ) {
            setIsSwapping(false);
            return;
        }

        const clientSideRefresh = (): void => {
            // Update viewed table data once specific functions are done (without re-fetch)
            const newData = [...dataPortion];
            const temp = newData[rowId1];
            newData[rowId1] = newData[rowId2];
            newData[rowId2] = temp;

            setDataPortion(newData);
            setIsSwapping(false);
        };

        if (onSwapRows) {
            onSwapRows(dataPortion[rowId1], dataPortion[rowId2]).then(clientSideRefresh);
        } else {
            clientSideRefresh();
        }
    };

    if (checkboxConfig.displayed) {
        columns.unshift({
            name: (
                <input
                    type="checkbox"
                    aria-label="Select all rows"
                    checked={checkboxConfig.isAllCheckboxChecked}
                    onClick={() =>
                        checkboxConfig.onAllCheckboxClicked(checkboxConfig.isAllCheckboxChecked)
                    }
                />
            ),
            cell: (row: Row<Data>) => (
                <input
                    type="checkbox"
                    aria-label={`Select row ${row.rowId}`}
                    checked={checkboxConfig.isRowChecked(row.data)}
                    onClick={() => checkboxConfig.onCheckboxClicked(row.data)}
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

    const rows = dataPortion.map((data, index) => ({ rowId: index, data }));

    const handleClear = (): void => {
        setPrimaryFilters(
            primaryFilters.map((filter) => ({
                ...filter,
                state: filter.initialState,
            }))
        );
        setAdditionalFilters(
            additionalFilters.map((filter) => ({
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
                        data={rows}
                        keyField="rowId"
                        fixedHeader
                        pagination={pagination ?? true}
                        persistTableHead
                        onRowClicked={onRowClick}
                        paginationServer={pagination ?? true}
                        paginationTotalRows={totalRows}
                        paginationDefaultPage={1}
                        onChangePage={onPageChange}
                        onChangeRowsPerPage={onPerPageChage}
                        sortServer={true}
                        onSort={handleSort}
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
