/*
This file is not type checked / linted in the pipeline as createSeedClient requires the database definition to be in node_modules/.snaplet
which only gets generated after running npx snaplet generate with local database running.
 */

import { createSeedClient } from "@snaplet/seed";
import { copycat } from "@snaplet/copycat";
import seedrandom from "seedrandom";

const possibleDietaryRequirements = [
    "Gluten Free",
    "Dairy Free",
    "Vegetarian",
    "Vegan",
    "Pescatarian",
    "Halal",
    "Diabetic",
    "Nut Allergy",
    "Seafood Allergy",
    "No Bread",
    "No Pasta",
    "No Rice",
    "No Pork",
    "No Beef",
];
const possibleFeminineProducts = ["Tampons", "Pads", "Incontinence Pads"];
const possiblePets = ["Cat", "Dog"];
const possibleOtherItems = [
    "Garlic",
    "Ginger",
    "Chillies",
    "Spices",
    "Hot Water Bottles",
    "Blankets",
];

const eventNamesWithNumberData = ["Shipping Labels Downloaded"];

const eventNamesWithNoData = [
    "No Status",
    "Request Denied",
    "Pending More Info",
    "Called and Confirmed",
    "Called and No Response",
    "Ready to Dispatch",
    "Received by Centre",
    "Collection Failed",
    "Parcel Collected",
    "Delivered",
    "Delivery Failed",
    "Delivery Cancelled",
    "Fulfilled with Trussell Trust",
    "Shopping List Downloaded",
    "Out for Delivery",
    "Request Deleted",
];

const possibleParcelPostCodes = ["E1 6AA", "E1 6AD", "E1 6AG", "CB2 3JU", "CB24 4RT", "CB8 9LJ"];

const earliestDate = new Date(2024, 0, 1); // 2024/01/01
const latestDate = new Date(2025, 0, 1); // 2025/01/01

generateSeed();

async function generateSeed(): Promise<void> {
    const seed = await createSeedClient({
        dryRun: process.env.DRY !== "0",
    });

    await seed.$resetDatabase(); // Clears all existing data in the database, but keep the structure

    await seed.clients((generate) =>
        generate(500, {
            fullName: (ctx) => copycat.fullName(ctx.seed),
            phoneNumber: (ctx) => copycat.phoneNumber(ctx.seed),
            address1: (ctx) => copycat.streetAddress(ctx.seed),
            address2: (ctx) => copycat.streetAddress(ctx.seed),
            addressTown: (ctx) => copycat.city(ctx.seed),
            addressCounty: (ctx) => copycat.state(ctx.seed),
            addressPostcode: (ctx) => copycat.oneOf(ctx.seed, possibleParcelPostCodes),
            deliveryInstructions: (ctx) => copycat.sentence(ctx.seed, { maxWords: 20 }),
            familyId: (ctx) => copycat.uuid(ctx.seed),
            dietaryRequirements: (ctx) =>
                copycat.someOf(
                    ctx.seed,
                    [0, possibleDietaryRequirements.length],
                    possibleDietaryRequirements
                ),
            feminineProducts: (ctx) =>
                copycat.someOf(
                    ctx.seed,
                    [0, possibleFeminineProducts.length],
                    possibleFeminineProducts
                ),
            petFood: (ctx) => copycat.someOf(ctx.seed, [0, possiblePets.length], possiblePets),
            otherItems: (ctx) =>
                copycat.someOf(ctx.seed, [0, possibleOtherItems.length], possibleOtherItems),
            extraInformation: (ctx) => copycat.sentence(ctx.seed, { maxWords: 20 }),
            flaggedForAttention: (ctx) => copycat.bool(ctx.seed),
            signpostingCallRequired: (ctx) => copycat.bool(ctx.seed),
        })
    );

    await seed.collectionCentres([
        {
            name: "Brixton Hill - Methodist Church",
            acronym: "BH-MC",
        },
        {
            name: "Clapham - St Stephens Church",
            acronym: "CLP-SC",
        },
        {
            name: "Delivery",
            acronym: "DLVR",
        },
    ]);

    await seed.families(
        (generate) =>
            generate(1000, {
                age: (ctx) => copycat.int(ctx.seed, { min: 0, max: 100 }),
            }),
        { connect: true }
    );

    await seed.lists([
        {
            itemName: "Chicken",
            quantityFor1: "1",
            quantityFor2: "2",
            quantityFor3: "3",
            quantityFor4: "4",
            quantityFor5: "5",
            quantityFor6: "6",
            quantityFor7: "7",
            quantityFor8: "8",
            quantityFor9: "9",
            quantityFor10: "10",
        },
        {
            itemName: "Egg",
            quantityFor1: "1",
            quantityFor2: "2",
            quantityFor3: "3",
            quantityFor4: "4",
            quantityFor5: "5",
            quantityFor6: "6",
            quantityFor7: "7",
            quantityFor8: "8",
            quantityFor9: "9",
            quantityFor10: "10",
        },
    ]);

    await seed.listsHotels([
        {
            itemName: "Canned Hot Dog",
            quantityFor1: "1",
            quantityFor2: "2",
            quantityFor3: "3",
            quantityFor4: "4",
            quantityFor5: "5",
            quantityFor6: "6",
            quantityFor7: "7",
            quantityFor8: "8",
            quantityFor9: "9",
            quantityFor10: "10",
        },
    ]);

    await seed.parcels(
        (generate) =>
            generate(5000, {
                packingDate: (ctx) =>
                    getPseudoRandomDateBetween(earliestDate, latestDate, ctx.seed),
                collectionDatetime: (ctx) =>
                    getPseudoRandomDateBetween(earliestDate, latestDate, ctx.seed),
            }),
        { connect: true }
    );

    await seed.events(
        (generate) =>
            generate(4000, {
                eventName: (ctx) => copycat.oneOfString(ctx.seed, eventNamesWithNumberData),
                eventData: (ctx) => copycat.int(ctx.seed, { min: 1, max: 10 }).toString(),
                timestamp: (ctx) => getPseudoRandomDateBetween(earliestDate, latestDate, ctx.seed),
            }),
        { connect: true }
    );

    await seed.events(
        (generate) =>
            generate(10000, {
                eventName: (ctx) => copycat.oneOfString(ctx.seed, eventNamesWithNoData),
                eventData: "",
            }),
        { connect: true }
    );

    await seed.websiteData([
        {
            name: "lists_text",
            value:
                "Space is valuable! Please don't leave boxes half empty - pack efficiently!\n" +
                "BOXES MUST BE PACKED FLAT SO THAT THEY CAN BE STACKED. Do not leave items sticking out of the top.\n" +
                "We do have a selection of 'free from' goods as well as vegan and halal products. " +
                "If you're uncertain about any additional dietary needs, please speak to one of the team.",
        },
    ]);

    await seed.packingSlots([
        {
            name: "AM",
            isShown: true,
            order: 1,
        },
        {
            name: "PM",
            isShown: true,
            order: 2,
        },
        {
            name: "Slot 1",
            isShown: false,
            order: 3,
        },
        {
            name: "Slot 2",
            isShown: false,
            order: 4,
        },
    ]);
}

function getPseudoRandomDateBetween(start: Date, end: Date, seed: string): Date {
    const randomNumberGenerator = seedrandom(seed);

    return new Date(start.getTime() + randomNumberGenerator() * (end.getTime() - start.getTime()));
}
