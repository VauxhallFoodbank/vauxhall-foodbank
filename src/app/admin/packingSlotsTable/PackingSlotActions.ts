import supabase from "@/supabaseClient";
import { DatabaseError } from "@/app/errorClasses";
import { PackingSlotRow } from "@/app/admin/packingSlotsTable/PackingSlotsTable";
import { Tables } from "@/databaseTypesFile";
import { logErrorReturnLogId } from "@/logger/logger";

type DbPackingSlot = Tables<"packing_slots">;
type NewDbPackingSlot = Omit<DbPackingSlot, "primary_key">;

export const fetchPackingSlots = async (): Promise<PackingSlotRow[]> => {
    const { data, error } = await supabase.from("packing_slots").select().order("order");
    if (error) {
        const logId = await logErrorReturnLogId("Error with fetch: Packing slots", error);
        throw new DatabaseError("fetch", "packing slots", logId);
    }

    return data.map(
        (row): PackingSlotRow => ({
            name: row.name,
            id: row.primary_key,
            isShown: row.is_shown,
            order: row.order,
            isNew: false,
        })
    );
};

const formatExistingRowToDBPackingSlot = (row: PackingSlotRow): DbPackingSlot => {
    return {
        primary_key: row.id,
        name: row.name,
        is_shown: row.isShown,
        order: row.order,
    };
};

const formatNewRowToDBPackingSlot = (newRow: PackingSlotRow): NewDbPackingSlot => {
    return {
        name: newRow.name,
        is_shown: newRow.isShown,
        order: newRow.order,
    };
};

export const insertNewPackingSlot = async (newRow: PackingSlotRow): Promise<void> => {
    const data = formatNewRowToDBPackingSlot(newRow);
    const { error } = await supabase.from("packing_slots").insert(data);

    if (error) {
        const logId = await logErrorReturnLogId("Error with insert: Packing slots", error);
        throw new DatabaseError("insert", "packing slots", logId);
    }
};

export const updateDbPackingSlot = async (row: PackingSlotRow): Promise<void> => {
    const processedData = formatExistingRowToDBPackingSlot(row);
    const { error } = await supabase
        .from("packing_slots")
        .update(processedData)
        .eq("primary_key", processedData.primary_key);

    if (error) {
        const logId = await logErrorReturnLogId("Error with update: Packing slots", error);
        throw new DatabaseError("update", "packing slots", logId);
    }
};

export const swapRows = async (row1: PackingSlotRow, row2: PackingSlotRow): Promise<void> => {
    const { error } = await supabase.rpc("packing_slot_order_swap", {
        id1: row1.id,
        id2: row2.id,
    });
    if (error) {
        const logId = await logErrorReturnLogId("Error with update: packing slots order", error);
        throw new DatabaseError("update", "packing slots order", logId);
    }
};
