import { Supabase } from "@/supabaseUtils";
import { DatabaseError, EdgeFunctionError } from "../errorClasses";
import { ParcelsTableRow, processingDataToParcelsTableData } from "./getParcelsTableData";
import { Filter, PaginationType } from "@/components/Tables/Filters";
import { SortState } from "@/components/Tables/Table";
import { logErrorReturnLogId } from "@/logger/logger";

export type CongestionChargeDetails = {
    postcode: string;
    congestionCharge: boolean;
};

export const getCongestionChargeDetailsForParcels = async (
    processingData: ParcelProcessingData,
    supabase: Supabase
): Promise<CongestionChargeDetails[]> => {
    const postcodes = [];
    for (const parcel of processingData) {
        postcodes.push(parcel.client_address_postcode);
    }

    const response = await supabase.functions.invoke("check-congestion-charge", {
        body: { postcodes: postcodes },
    });

    if (response.error) {
        const logId = await logErrorReturnLogId(
            "Error with congestion charge check",
            response.error
        );
        throw new EdgeFunctionError("congestion charge check", logId);
    }
    return response.data;
};

export type ParcelProcessingData = Pick<
    Awaited<ReturnType<typeof getParcelProcessingData>>,
    "processingData"
>["processingData"];

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const getParcelProcessingData = async (
    supabase: Supabase,
    filters: Filter<ParcelsTableRow, any>[],
    sortState: SortState<ParcelsTableRow>,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number
) => {
    let query = supabase.from("parcels_plus").select("*");

    filters.forEach((filter) => {
        if (filter.methodConfig.paginationType === PaginationType.Server) {
            query = filter.methodConfig.method(query, filter.state);
        }
    });

    if (
        sortState.sortEnabled &&
        sortState.column.sortMethodConfig?.paginationType === PaginationType.Server
    ) {
        query = sortState.column.sortMethodConfig.method(query, sortState.sortDirection);
    } else {
        query = query.order("packing_datetime", { ascending: false });
    }

    query = query.range(startIndex, endIndex);

    query = query.abortSignal(abortSignal);

    const { data, error } = await query;
    if (abortSignal.aborted) {
        return { processingData: [], abortSignalResponse: abortSignal };
    }

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: parcel table", error);
        throw new DatabaseError("fetch", "parcel table", logId);
    }

    return { processingData: data, abortSignalResponse: abortSignal };
};

export const getParcelsData = async (
    supabase: Supabase,
    filters: Filter<ParcelsTableRow, any[]>[],
    sortState: SortState<ParcelsTableRow>,
    abortSignal: AbortSignal,
    startIndex: number,
    endIndex: number
): Promise<{ data: ParcelsTableRow[]; abortSignalResponse: AbortSignal }> => {
    const { processingData, abortSignalResponse } = await getParcelProcessingData(
        supabase,
        filters,
        sortState,
        abortSignal,
        startIndex,
        endIndex
    );
    const congestionCharge = await getCongestionChargeDetailsForParcels(processingData, supabase);
    const formattedData = await processingDataToParcelsTableData(processingData, congestionCharge);

    return { data: formattedData, abortSignalResponse: abortSignalResponse };
};

export const getParcelsCount = async (
    supabase: Supabase,
    filters: Filter<ParcelsTableRow, any>[],
    abortSignal: AbortSignal
): Promise<{ count: number; abortSignalResponse: AbortSignal }> => {
    let query = supabase.from("parcels_plus").select("*", { count: "exact", head: true });

    filters.forEach((filter) => {
        if (filter.methodConfig.paginationType === PaginationType.Server) {
            query = filter.methodConfig.method(query, filter.state);
        }
    });

    query = query.abortSignal(abortSignal);

    const { count, error } = await query;

    if (abortSignal.aborted) {
        return { count: 0, abortSignalResponse: abortSignal };
    }
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcels", error);
        throw new DatabaseError("fetch", "parcels", logId);
    }
    if (count === null) {
        const logId = await logErrorReturnLogId("Error with fetch: Parcels, count is null");
        throw new DatabaseError("fetch", "parcels", logId);
    }
    return { count, abortSignalResponse: abortSignal };
};

export const getParcelIds = async (
    supabase: Supabase,
    filters: Filter<ParcelsTableRow, any>[],
    sortState: SortState<ParcelsTableRow>
): Promise<string[]> => {
    let query = supabase.from("parcels_plus").select("*");

    filters.forEach((filter) => {
        if (filter.methodConfig.paginationType === PaginationType.Server) {
            query = filter.methodConfig.method(query, filter.state);
        }
    });

    if (
        sortState.sortEnabled &&
        sortState.column.sortMethodConfig?.paginationType === PaginationType.Server
    ) {
        query = sortState.column.sortMethodConfig.method(query, sortState.sortDirection);
    } else {
        query = query.order("packing_datetime", { ascending: false });
    }

    const { data, error } = await query;
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch", error);
        throw new DatabaseError("fetch", "parcels", logId);
    }

    return data.reduce<string[]>((reducedData, parcel) => {
        parcel.parcel_id && reducedData.push(parcel.parcel_id);
        return reducedData;
    }, []);
};

export const getParcelsByIds = async (
    supabase: Supabase,
    filters: Filter<ParcelsTableRow, any>[],
    sortState: SortState<ParcelsTableRow>,
    parcelIds: string[]
): Promise<ParcelsTableRow[]> => {
    let query = supabase.from("parcels_plus").select("*");

    filters.forEach((filter) => {
        if (filter.methodConfig.paginationType === PaginationType.Server) {
            query = filter.methodConfig.method(query, filter.state);
        }
    });

    if (
        sortState.sortEnabled &&
        sortState.column.sortMethodConfig?.paginationType === PaginationType.Server
    ) {
        query = sortState.column.sortMethodConfig.method(query, sortState.sortDirection);
    } else {
        query = query.order("packing_datetime", { ascending: false });
    }
    if (parcelIds) {
        query = query.in("parcel_id", parcelIds);
    }

    const { data, error } = await query;

    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: parcel table", error);
        throw new DatabaseError("fetch", "parcel table", logId);
    }

    const congestionCharge = await getCongestionChargeDetailsForParcels(data, supabase);
    const formattedData = processingDataToParcelsTableData(data, congestionCharge);

    return formattedData;
};

export interface CollectionCentresOptions {
    name: string;
    acronym: string;
}
export interface StatusResponseRow {
    event_name: string;
}
