"use client";

import React, { Suspense, useEffect, useState } from "react";
import Table, { Row, SortOptions, SortState, TableHeaders } from "@/components/Tables/Table";
import styled, { useTheme } from "styled-components";
import {
    ParcelsTableRow,
    processingDataToParcelsTableData,
} from "@/app/parcels/getParcelsTableData";
import { formatDatetimeAsDate } from "@/app/parcels/getExpandedParcelDetails";
import { ControlContainer } from "@/components/Form/formStyling";
import DateRangeInputs, { DateRangeState } from "@/components/DateRangeInputs/DateRangeInputs";
import FlaggedForAttentionIcon from "@/components/Icons/FlaggedForAttentionIcon";
import PhoneIcon from "@/components/Icons/PhoneIcon";
import CongestionChargeAppliesIcon from "@/components/Icons/CongestionChargeAppliesIcon";
import DeliveryIcon from "@/components/Icons/DeliveryIcon";
import CollectionIcon from "@/components/Icons/CollectionIcon";
import ExpandedParcelDetails from "@/app/parcels/ExpandedParcelDetails";
import ExpandedParcelDetailsFallback from "@/app/parcels/ExpandedParcelDetailsFallback";
import Icon from "@/components/Icons/Icon";
import { faBoxArchive } from "@fortawesome/free-solid-svg-icons";
import Modal from "@/components/Modal/Modal";
import TableSurface from "@/components/Tables/TableSurface";
import ActionBar from "@/app/parcels/ActionBar/ActionBar";
import { ButtonsDiv, Centerer, ContentDiv, OutsideDiv } from "@/components/Modal/ModalFormStyles";
import LinkButton from "@/components/Buttons/LinkButton";
import supabase from "@/supabaseClient";
import {
    getCongestionChargeDetailsForParcels,
    getParcelProcessingData,
    getParcelsCount,
    getParcelsData,
} from "./fetchParcelTableData";
import dayjs from "dayjs";
import { checklistFilter } from "@/components/Tables/ChecklistFilter";
import { Filter } from "@/components/Tables/Filters";
import { useRouter, useSearchParams } from "next/navigation";
import { statusNamesInWorkflowOrder } from "./ActionBar/Statuses";
import { RealtimePostgresChangesFilter } from "@supabase/supabase-js";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { Database } from "@/databaseTypesFile";
import { textFilter } from "@/components/Tables/TextFilter";
import { dateFilter } from "@/components/Tables/DateFilter";
import { SortOrder } from "react-data-table-component";


export const parcelTableHeaderKeysAndLabels: TableHeaders<ParcelsTableRow> = [
    ["iconsColumn", "Flags"],
    ["fullName", "Name"],
    ["familyCategory", "Family"],
    ["addressPostcode", "Postcode"],
    ["phoneNumber", "Phone"],
    ["voucherNumber", "Voucher"],
    ["deliveryCollection", "Collection"],
    ["packingDatetime", "Packing Date"],
    ["packingTimeLabel", "Time"],
    ["lastStatus", "Last Status"],
];

const defaultShownHeaders: (keyof ParcelsTableRow)[] = [
    "fullName",
    "familyCategory",
    "addressPostcode",
    "deliveryCollection",
    "packingDatetime",
    "packingTimeLabel",
    "lastStatus",
];

const sortStatusByWorkflowOrder = (
    statusA: ParcelsTableRow["lastStatus"],
    statusB: ParcelsTableRow["lastStatus"]
): number => {
    const indexA = statusNamesInWorkflowOrder.indexOf(statusA?.name ?? "");
    const indexB = statusNamesInWorkflowOrder.indexOf(statusB?.name ?? "");
    if (indexA === indexB) {
        return 0;
    }
    return indexA < indexB ? 1 : -1;
};

const sortableColumns: (SortOptions<ParcelsTableRow, any>)[] = [
    {key: "fullName", sortMethod: (query, sortDirection) => query.order("client(full_name)", {ascending: sortDirection === "asc"})},
    //{key: "familyCategory",sortMethod: (query, sortDirection) => query.order("client(full_name)", {ascending: sortDirection === "asc"})}, broke
    {key: "addressPostcode",sortMethod: (query, sortDirection) => query.order("client(address_postcode)", {ascending: sortDirection === "asc"})},
    {key: "phoneNumber",sortMethod: (query, sortDirection) => query.order("client(phone_number)", {ascending: sortDirection === "asc"})},
    {key: "voucherNumber",sortMethod: (query, sortDirection) => query.order("voucher_number", {ascending: sortDirection === "asc"})},
    {key: "deliveryCollection",sortMethod: (query, sortDirection) => query.order("collection_centre(name)", {ascending: sortDirection === "asc"})},
    {key: "packingDatetime",sortMethod: (query, sortDirection) => query.order("packing_datetime", {ascending: sortDirection === "asc"})},
    //{key: "packingTimeLabel",sortMethod: (query, sortDirection) => query.order("client(full_name)", {ascending: sortDirection === "asc"})}, broke
    //{ key: "lastStatus", sortMethod: sortStatusByWorkflowOrder }, to dofix
];

const toggleableHeaders: (keyof ParcelsTableRow)[] = [
    "fullName",
    "familyCategory",
    "addressPostcode",
    "phoneNumber",
    "voucherNumber",
    "deliveryCollection",
    "packingDatetime",
    "packingTimeLabel",
    "lastStatus",
];

const parcelTableColumnStyleOptions = {
    iconsColumn: {
        width: "3rem",
    },
    fullName: {
        minWidth: "8rem",
    },
    familyCategory: {
        hide: 550,
    },
    addressPostcode: {
        hide: 800,
    },
    deliveryCollection: {
        minWidth: "6rem",
    },
    packingDatetipowertome: {
        hide: 800,
    },
    packingTimeLabel: {
        hide: 800,
        minWidth: "6rem",
    },
    lastStatus: {
        minWidth: "8rem",
    },
};

const PreTableControls = styled.div`
    margin: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: stretch;
    justify-content: space-between;
`;

const parcelIdParam = "parcelId";

const areDateRangesIdentical = (
    dateRangeA: DateRangeState,
    dateRangeB: DateRangeState
): boolean => {
    return (
        areDaysIdentical(dateRangeA.from, dateRangeB.from) &&
        areDaysIdentical(dateRangeA.to, dateRangeB.to)
    );
};

const areDaysIdentical = (dayA: dayjs.Dayjs | null, dayB: dayjs.Dayjs | null): boolean => {
    return dayA && dayB ? dayA.isSame(dayB) : dayA === dayB;
};

const subscriptions: RealtimePostgresChangesFilter<"*">[] = [{ event: "*", schema: "public", table: "parcels" }, { event: "*", schema: "public", table: "events" }]


const fullNameSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string): PostgrestFilterBuilder<Database["public"], any, any> => {
    return query.ilike('client.full_name', `%${state}%`);
}

const postcodeSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string): PostgrestFilterBuilder<Database["public"], any, any> => {
    return query.ilike('client.address_postcode', `%${state}%`);
}

const familySearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string): PostgrestFilterBuilder<Database["public"], any, any> => {

    return query//.eq('client.family', {state})
}

const phoneSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string): PostgrestFilterBuilder<Database["public"], any, any> => {
    return query.ilike('client.phone_number', `%${state}%`);
}

const voucherSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string): PostgrestFilterBuilder<Database["public"], any, any> => {
    return query.ilike('voucher_number', `%${state}%`);
}

const buildDateFilter = (initialState: DateRangeState): Filter<ParcelsTableRow, DateRangeState> => {
    const dateSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: DateRangeState): PostgrestFilterBuilder<Database["public"], any, any> => {
        return query.gte("packing_datetime", state.from).lte("packing_datetime", state.to)
    } 
    return dateFilter<ParcelsTableRow, any>({
        key: "dateRange",
        filterLabel: "",
        filterMethod: dateSearch,
        initialState: initialState
    })
}

const buildDeliveryCollectionFilter = (
    //tableData: ParcelsTableRow[]
): Filter<ParcelsTableRow, any> => {
    const deliveryCollectionSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string[]): PostgrestFilterBuilder<Database["public"], any, any> => {
        return query.in('collection_centre.acronym', state);
    }
    const keySet = new Set();
    // const options = tableData todo get this working: depends on data which is a state managed by table. change options to be a state
    //     .map((row) => {
    //         if (!keySet.has(row.deliveryCollection.collectionCentreAcronym)) {
    //             keySet.add(row.deliveryCollection.collectionCentreAcronym);
    //             return row.deliveryCollection;
    //         } else {
    //             return null;
    //         }
    //     })
    //     .filter((option) => option != null)
    //     .sort();
    const options = [{collectionCentreName: "Brixton Hill - Methodist Church", collectionCentreAcronym: "BH-MC"}, {collectionCentreName: "Clapham - St Stephens Church", collectionCentreAcronym: "CLP-SC"}, {collectionCentreName: "Delivery", collectionCentreAcronym: "DLVR"}] //fudge for now

    return checklistFilter<ParcelsTableRow, any>({
        key: "deliveryCollection",
        filterLabel: "Collection",
        itemLabelsAndKeys: options.map((option) => [
            option!.collectionCentreName,
            option!.collectionCentreAcronym,
        ]),
        initialCheckedKeys: options.map((option) => option!.collectionCentreAcronym),
        filterMethod: deliveryCollectionSearch,
    });
};

const buildPackingTimeFilter = (
    //tableData: ParcelsTableRow[]
    ): Filter<ParcelsTableRow, any> => {
    const packingTimeSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string[]): PostgrestFilterBuilder<Database["public"], any, any> => {
        return query//.in('packing_datetime', `%${state}%`);
    }
    // const options = Array.from(
    //     new Set(tableData.map((row) => row.packingTimeLabel as string)).values()
    // ).sort(); //todo same as above
    const options = ["AM", "PM"]; //fudge for now
    return checklistFilter<ParcelsTableRow, any>({
        key: "packingTimeLabel",
        filterLabel: "Packing Time",
        itemLabelsAndKeys: options.map((value) => [value, value]),
        initialCheckedKeys: options,
        filterMethod: packingTimeSearch,
    });
};

const lastStatusCellMatchOverride = (
    rowData: ParcelsTableRow,
    selectedKeys: string[]
): boolean => {
    const cellData = rowData["lastStatus"];

    return (
        (!cellData && selectedKeys.includes("None")) ||
        selectedKeys.some((key) => cellData?.name.includes(key))
    );
};

const buildLastStatusFilter = (
    //tableData: ParcelsTableRow[]
    ): Filter<ParcelsTableRow, any> => {
    const lastStatusSearch = (query: PostgrestFilterBuilder<Database["public"], any, any>, state: string[]): PostgrestFilterBuilder<Database["public"], any, any> => {
        return query.in('events.event_name', state); //not sure if this will work?
    }
    
    // const options = Array.from(
    //     new Set(
    //         tableData.map((row) => (row.lastStatus ? row.lastStatus.name : "None"))
    //     ).values()
    // ).sort();

    const options: string[] = statusNamesInWorkflowOrder; //cheat for now. TODO

    return checklistFilter<ParcelsTableRow, any>({
        key: "lastStatus",
        filterLabel: "Last Status",
        itemLabelsAndKeys: options.map((value) => [value, value]),
        initialCheckedKeys: options.filter((option) => option !== "Request Deleted"),
        //cellMatchOverride: lastStatusCellMatchOverride, todo: wtf is this
        filterMethod: lastStatusSearch,

    });
};

const ParcelsPage: React.FC<{}> = () => {
    const startOfToday = dayjs().startOf("day");
    const endOfToday = dayjs().endOf("day");

    const [isLoading, setIsLoading] = useState(true);
    // const [packingDateRange, setPackingDateRange] = useState<DateRangeState>({
    //     from: startOfToday,
    //     to: endOfToday,
    // });
    const [tableData, setTableData] = useState<ParcelsTableRow[]>([]);
    const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
    const theme = useTheme();
    const router = useRouter();

    const searchParams = useSearchParams();
    const parcelId = searchParams.get(parcelIdParam);
    const dateFilter = buildDateFilter({
        from: startOfToday,
        to: endOfToday,
    });

    const filters: Filter<ParcelsTableRow, any>[] = [
        dateFilter,
        textFilter({key: "fullName", label: "Name", headers: parcelTableHeaderKeysAndLabels, filterMethod: fullNameSearch}),
        textFilter({key: "addressPostcode", label: "Postcode", headers: parcelTableHeaderKeysAndLabels, filterMethod: postcodeSearch}),
        buildDeliveryCollectionFilter(), //hardcoded options
        //buildPackingTimeFilter(), //broken
    ]
    
    const additionalFilters: Filter<ParcelsTableRow, any>[] = [
        textFilter({key: "familyCategory", label: "Family", headers: parcelTableHeaderKeysAndLabels, filterMethod: familySearch}), //broken
        textFilter({key: "phoneNumber", label: "Phone", headers: parcelTableHeaderKeysAndLabels, filterMethod: phoneSearch}),
        textFilter({key: "voucherNumber", label: "Voucher", headers: parcelTableHeaderKeysAndLabels, filterMethod: voucherSearch}),
        buildLastStatusFilter() //hardcoded options
    ]

    const defaultSortState: SortState<ParcelsTableRow> = {key: "packingDatetime", sortDirection: "desc" as SortOrder}

    useEffect(() => {
        if (parcelId) {
            setSelectedParcelId(parcelId);
            setModalIsOpen(true);
        }
    }, [parcelId]);

    //remember to deal with what happens if filters change twice and requests come back out of order. deal with in useeffect that sets data inside Table

    const rowToIconsColumn = ({
        flaggedForAttention,
        requiresFollowUpPhoneCall,
    }: ParcelsTableRow["iconsColumn"]): React.ReactElement => {
        return (
            <>
                {flaggedForAttention && <FlaggedForAttentionIcon />}
                {requiresFollowUpPhoneCall && <PhoneIcon color={theme.main.largeForeground[0]} />}
            </>
        );
    };

    const rowToDeliveryCollectionColumn = (
        collectionData: ParcelsTableRow["deliveryCollection"]
    ): React.ReactElement => {
        const { collectionCentreName, collectionCentreAcronym, congestionChargeApplies } =
            collectionData;
        if (collectionCentreName === "Delivery") {
            return (
                <>
                    <DeliveryIcon color={theme.main.largeForeground[0]} />
                    {congestionChargeApplies && <CongestionChargeAppliesIcon />}
                </>
            );
        }

        return (
            <>
                <CollectionIcon
                    color={theme.main.largeForeground[0]}
                    collectionPoint={collectionCentreName}
                />
                {collectionCentreAcronym}
            </>
        );
    };

    const rowToLastStatusColumn = (data: ParcelsTableRow["lastStatus"] | null): string => {
        if (!data) {
            return "-";
        }
        const { name, eventData, timestamp } = data;
        return (
            `${name}` +
            (eventData ? ` (${eventData})` : "") +
            ` @ ${formatDatetimeAsDate(timestamp)}`
        );
    };

    const parcelTableColumnDisplayFunctions = {
        iconsColumn: rowToIconsColumn,
        deliveryCollection: rowToDeliveryCollectionColumn,
        packingDatetime: formatDatetimeAsDate,
        lastStatus: rowToLastStatusColumn,
    };

    const onParcelTableRowClick = (row: Row<ParcelsTableRow>): void => {
        setSelectedParcelId(row.data.parcelId);
        router.push(`/parcels?${parcelIdParam}=${row.data.parcelId}`);
    };

    return (
        <>
            <PreTableControls>
                <ControlContainer>
                    {/* <DateRangeInputs
                        range={packingDateRange}
                        setRange={setPackingDateRange}
                    ></DateRangeInputs> */}
                </ControlContainer>
                <ActionBar data={tableData} selected={selected} />
            </PreTableControls> 
                <>
                    <TableSurface>
                        <Table
                            getData={getParcelsData}
                            getCount={getParcelsCount}
                            headerKeysAndLabels={parcelTableHeaderKeysAndLabels}
                            columnDisplayFunctions={parcelTableColumnDisplayFunctions}
                            columnStyleOptions={parcelTableColumnStyleOptions}
                            onRowClick={onParcelTableRowClick}
                            checkboxes
                            onRowSelection={setSelected}
                            pagination
                            sortableColumns={sortableColumns}
                            defaultShownHeaders={defaultShownHeaders}
                            toggleableHeaders={toggleableHeaders}
                            filters={filters}
                            additionalFilters={additionalFilters}
                            subscriptions={subscriptions}
                            loading={isLoading}
                            setLoading={setIsLoading}
                            supabase={supabase}
                            defaultSortState={defaultSortState}
                        />
                    </TableSurface>
                    <Modal
                        header={
                            <>
                                <Icon
                                    icon={faBoxArchive}
                                    color={theme.primary.largeForeground[2]}
                                />{" "}
                                Parcel Details
                            </>
                        }
                        isOpen={modalIsOpen}
                        onClose={() => {
                            setModalIsOpen(false);
                            router.push("/parcels");
                        }}
                        headerId="expandedParcelDetailsModal"
                    >
                        <OutsideDiv>
                            <ContentDiv>
                                <Suspense fallback={<ExpandedParcelDetailsFallback />}>
                                    <ExpandedParcelDetails parcelId={selectedParcelId} />
                                </Suspense>
                            </ContentDiv>

                            <ButtonsDiv>
                                <Centerer>
                                    <LinkButton link={`/parcels/edit/${selectedParcelId}`}>
                                        Edit Parcel
                                    </LinkButton>
                                </Centerer>
                            </ButtonsDiv>
                        </OutsideDiv>
                    </Modal>
                </>
        </>
    );
};

export default ParcelsPage;
