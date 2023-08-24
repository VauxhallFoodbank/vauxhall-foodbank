import { CongestionChargeDetails, ProcessingData } from "@/app/clients/fetchDataFromServer";
import { Schema } from "@/database_utils";
import { familyCountToFamilyCategory } from "@/app/clients/getExpandedClientDetails";

export interface ParcelsTableRow {
    parcelId: Schema["parcels"]["primary_key"];
    primaryKey: Schema["clients"]["primary_key"];
    fullName: string;
    familyCategory: string;
    addressPostcode: string;
    deliveryCollection: {
        collectionCentre: string | null;
        congestionChargeApplies: boolean;
    };
    packingTimeLabel: PackingTimeLabel | null;
    collectionDatetime: Date | null;
    lastStatus: {
        name: string;
        timestamp: Date;
    } | null;
    voucherNumber: string | null;
    iconsColumn: {
        flaggedForAttention: boolean;
        requiresFollowUpPhoneCall: boolean;
    };
    packingDatetime: Date | null;
}

export const processingDataToClientsTableData = (
    processingData: ProcessingData,
    congestionCharge: CongestionChargeDetails[]
): ParcelsTableRow[] => {
    const clientTableRows: ParcelsTableRow[] = [];

    if (processingData.length !== congestionCharge.length) {
        throw new Error(
            `Invalid inputs, got length ${processingData.length} and ${congestionCharge.length}`
        );
    }

    for (let index = 0; index < processingData.length; index++) {
        const parcel = processingData[index];
        const client = parcel.client!;

        clientTableRows.push({
            parcelId: parcel.parcel_id,
            primaryKey: client.primary_key,
            fullName: client.full_name,
            familyCategory: familyCountToFamilyCategory(client.family.length),
            addressPostcode: client.address_postcode,
            deliveryCollection: {
                collectionCentre: parcel.collection_centre ?? "-",
                congestionChargeApplies: congestionCharge[index].congestionCharge,
            },
            collectionDatetime: parcel.collection_datetime
                ? new Date(parcel.collection_datetime)
                : null,
            packingTimeLabel: datetimeToPackingTimeLabel(parcel.packing_datetime),
            lastStatus: eventToLastStatus(parcel.events[0] ?? null),
            voucherNumber: parcel.voucher_number,
            packingDatetime: parcel.packing_datetime ? new Date(parcel.packing_datetime) : null,
            iconsColumn: {
                flaggedForAttention: client.flagged_for_attention,
                requiresFollowUpPhoneCall: client.signposting_call_required,
            },
        });
    }

    return clientTableRows;
};

export type PackingTimeLabel = "AM" | "PM";

export const datetimeToPackingTimeLabel = (datetime: string | null): PackingTimeLabel | null => {
    if (datetime === null || isNaN(Date.parse(datetime))) {
        return null;
    }

    return new Date(datetime).getHours() <= 11 ? "AM" : "PM";
};

export const eventToLastStatus = (
    event: Pick<Schema["events"], "event_name" | "timestamp"> | undefined | null
): ParcelsTableRow["lastStatus"] => {
    if (!event) {
        return null;
    }

    return {
        name: event.event_name,
        timestamp: new Date(event.timestamp),
    };
};
