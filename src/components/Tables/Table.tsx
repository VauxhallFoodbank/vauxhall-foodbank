"use client";

import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import TableFilterBar, { FilterText } from "@/components/Tables/TableFilterBar";
import { styled, useTheme } from "styled-components";
import { NoSsr } from "@mui/material";
import SpeechBubbleIcon from "@/components/Icons/SpeechBubbleIcon";
import {
    faAnglesUp,
    faAnglesDown,
    faPenToSquare,
    faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import IconButton from "@mui/material/IconButton/IconButton";
import Icon from "@/components/Icons/Icon";

export interface Datum {
    data: RowData;
    tooltips?: RowData;
}

export interface RowData {
    [headerKey: string]: string;
}

export type Headers = [string, string][];

interface Row {
    rowId: number;
    data: RowData;
}

interface Props {
    data: Datum[];
    headerKeysAndLabels: Headers;
    checkboxes?: boolean;
    reorderable?: boolean;
    headerFilters?: string[];
    pagination?: boolean;
    defaultShownHeaders?: string[];
    toggleableHeaders?: string[];
    sortable?: boolean;
    onEdit?: (data: number) => void;
    onDelete?: (data: number) => void;
}

const doesRowIncludeFilterText = (row: Row, filterText: FilterText, headers: Headers): boolean => {
    for (const [headerKey, _headerLabel] of headers) {
        if (
            !(row.data[headerKey] ?? "")
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
        const row: Row = { rowId: currentIndex, data: {} };

        for (const [headerKey, _headerLabel] of headers) {
            const databaseValue = datum.data[headerKey] ?? "";
            row.data[headerKey] = Array.isArray(databaseValue)
                ? databaseValue.join(", ")
                : databaseValue;
        }

        return row;
    });
};

const filterRows = (rows: Row[], filterText: FilterText, headers: Headers): Row[] => {
    return rows.filter((row) => doesRowIncludeFilterText(row, filterText, headers));
};

interface CellProps {
    data: Datum[];
    rowId: number;
    headerKey: string;
}

const CustomCell: React.FC<CellProps> = ({ data, rowId, headerKey }) => {
    const [tooltip, setTooltip] = useState(false);

    const tooltips = data[rowId].tooltips ?? {};
    const theme = useTheme();
    return (
        <RowDiv
            key={rowId}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
            onClick={() => setTooltip(true)}
        >
            {data[rowId].data[headerKey]}
            {tooltips[headerKey] && (
                <SpeechBubbleIcon
                    onHoverText={tooltips[headerKey]!}
                    showTooltip={tooltip}
                    color={theme.accentBackgroundColor}
                />
            )}
        </RowDiv>
    );
};

const Table: React.FC<Props> = (props) => {
    const [shownHeaderKeys, setShownHeaderKeys] = useState(
        props.defaultShownHeaders ?? props.headerKeysAndLabels.map(([key]) => key)
    );

    const shownHeaders = props.headerKeysAndLabels.filter(([key]) => shownHeaderKeys.includes(key));

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
        props.toggleableHeaders ? shownHeaders : props.headerKeysAndLabels
    ).map(([headerKey, headerName]) => {
        return {
            name: headerName,
            selector: (row) => row.data[headerKey],
            minWidth: "12rem",
            maxWidth: "20rem",
            sortable: props.sortable ?? true,
            cell(row) {
                return <CustomCell data={data} rowId={row.rowId} headerKey={headerKey} />;
            },
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

    if (props.reorderable || props.onEdit) {
        columns.unshift({
            name: <p>Sort</p>,
            cell: (row: Row) => {
                const onEditClick = (): void => {
                    props.onEdit!(row.rowId);
                };

                return (
                    <EditandReorderArrowDiv>
                        {props.reorderable ? (
                            <IconButton
                                onClick={() => swapRows(row.rowId, row.rowId - 1)}
                                aria-label="reorder row upwards"
                            >
                                <StyledIcon icon={faAnglesUp} />
                            </IconButton>
                        ) : (
                            <></>
                        )}
                        {props.onEdit ? (
                            <IconButton onClick={onEditClick} aria-label="edit">
                                <StyledIcon icon={faPenToSquare} />
                            </IconButton>
                        ) : (
                            <></>
                        )}
                        {props.reorderable ? (
                            <IconButton
                                onClick={() => swapRows(row.rowId, row.rowId + 1)}
                                aria-label="reorder row downwards"
                            >
                                <StyledIcon icon={faAnglesDown} />
                            </IconButton>
                        ) : (
                            <></>
                        )}
                        {props.onDelete ? (
                            <IconButton
                                onClick={() => props.onDelete!(row.rowId)}
                                aria-label="delete"
                            >
                                <StyledIcon icon={faTrashAlt} />
                            </IconButton>
                        ) : (
                            <></>
                        )}
                    </EditandReorderArrowDiv>
                );
            },
            width: "5rem",
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

    const filterKeys =
        props.headerFilters ?? props.headerKeysAndLabels.map(([headerKey]) => headerKey);

    return (
        <Styling>
            <NoSsr>
                <DataTable
                    // types are fine without the cast when not using styled components, not sure what's happening here
                    columns={columns}
                    data={dataToFilteredRows(data, filterText, props.headerKeysAndLabels)}
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
                            headers={props.headerKeysAndLabels}
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

const RowDiv = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    padding-left: 1rem;
    gap: 2rem;
    /* background-color: red;

    &:hover {
        background-color: transparent;
    } */
`;

const EditandReorderArrowDiv = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    width: 100%;
    // this transform is necessary to make the buttons visually consistent with the rest of the table without redesigning the layout
    transform: translateX(-1.1rem);
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

    // the icons in the pagination bar
    & svg {
        // TODO: VFB-16 different greys for different theme modes
        fill: grey;
    }

    // formatting all direct children to adhere to the theme
    & > div {
        background-color: ${(props) => props.theme.surfaceBackgroundColor};
        color: ${(props) => props.theme.surfaceForegroundColor};
        // TODO: VFB-16 different greys for different theme modes
        border-color: grey;
    }

    // the filter bars
    & input[type="text"] {
        color: ${(props) => props.theme.surfaceForegroundColor};

        &::placeholder {
            // TODO: VFB-16 different greys for different theme modes
            color: grey;
        }

        background-color: ${(props) => props.theme.surfaceBackgroundColor};
        margin: 1px 2px 1px 2px;
        padding: 4px 1px 4px 8px;
        border-radius: 0.5rem;
        width: 10rem;
        // TODO: VFB-16 different greys for different theme modes
        border: solid 1px grey;
    }

    & div.rdt_TableCell,
    & div.rdt_TableCol_Sortable,
    & div.rdt_TableCol {
        width: 7rem;
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
    & .rdt_TableRow,
    & .rdt_TableCol,
    & .rdt_Table {
        text-align: start;
        font-size: 1.2rem;
        background-color: transparent;
        color: ${(props) => props.theme.surfaceForegroundColor};
    }

    & div.rdt_TableRow {
        padding: 0.5rem 0.5rem;
        // TODO: VFB-16 different greys for different theme modes
        // important needed to override the inline style
        border-bottom-color: grey;
    }

    & .rdt_TableHeadRow {
        background-color: ${(props) => props.theme.surfaceBackgroundColor};
        border-color: ${(props) => props.theme.foregroundColor};
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
        color: ${(props) => props.theme.surfaceForegroundColor};
    }
`;

export default Table;
