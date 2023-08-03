import supabase, { Schema } from "@/supabase";
import { CalendarEvent } from "@/components/Calendar/Calendar";

export type parcelWithClientName = Schema["parcels"] & { clients: { full_name: string } | null };

const COLLECTION_DURATION_MS = 30 * 60 * 1000;

export interface LocationColorMap {
    [location: string]: { color: string; text: string };
}

export const getParcelsWithCollectionDate = async (): Promise<parcelWithClientName[]> => {
    const response = await supabase
        .from("parcels")
        .select("*, clients ( full_name )")
        .not("collection_datetime", "is", null);
    return response.data ?? [];
};

export const parcelsToCollectionEvents = (
    parcels: parcelWithClientName[],
    colorMap: LocationColorMap
): CalendarEvent[] => {
    return parcels.map((parcel) => {
        const fullName = parcel.clients?.full_name ?? "";

        const collectionStart = new Date(parcel.collection_datetime!);
        const collectionEnd = new Date(collectionStart.getTime() + COLLECTION_DURATION_MS);

        const collectionCentre = parcel.collection_centre ?? "default";
        const location = collectionCentre !== "default" ? `[${collectionCentre}]` : "";

        const eventColor = colorMap[collectionCentre] ?? colorMap.default;

        const event: CalendarEvent = {
            id: parcel.primary_key,
            title: `${fullName} ${location}`,
            start: collectionStart,
            end: collectionEnd,
            backgroundColor: eventColor.color,
            borderColor: eventColor.color,
            textColor: eventColor.text,
        };
        return event;
    });
};
