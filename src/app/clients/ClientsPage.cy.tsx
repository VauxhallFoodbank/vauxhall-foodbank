import {
    datetimeToPackingTimeLabel,
    eventToStatusMessage,
    familyCountToFamilyCategory,
    formatDatetimeAsDate,
    ProcessingData,
    processingDataToClientsTableData,
} from "@/app/clients/getClientsTableData";
import {
    formatAddressFromClientDetails,
    formatBreakdownOfChildrenFromFamilyDetails,
    formatDatetimeAsTime,
    formatHouseholdFromFamilyDetails,
    RawClientDetails,
    rawDataToExpandedClientDetails,
} from "@/app/clients/getExpandedClientDetails";

const sampleProcessingData: ProcessingData = [
    {
        parcel_id: "PRIMARY_KEY",
        collection_centre: "COLLECTION_CENTRE",
        collection_datetime: "2023-08-04T13:30:00+00:00",
        packing_datetime: "2023-08-04T13:30:00+00:00",

        client: {
            full_name: "CLIENT_NAME",
            address_postcode: "SW1A 2AA",
            flagged_for_attention: false,
            signposting_call_required: true,

            family: [
                { age: 36, gender: "female" },
                { age: 5, gender: "male" },
                { age: 24, gender: "other" },
            ],
        },

        events: [
            {
                event_name: "LAST_EVENT",
                timestamp: "2023-08-04T13:30:00+00:00",
            },
        ],
    },
];

const sampleRawExpandedClientDetails: RawClientDetails = {
    voucher_number: "VOUCHER_1",
    packing_datetime: "2023-08-04T13:30:00+00:00",

    client: {
        full_name: "CLIENT NAME",
        phone_number: "PHONE NUMBER",
        delivery_instructions: "INSTRUCTIONS FOR DELIVERY",
        address_1: "Address Line 1",
        address_2: "Address Line 2",
        address_town: "TOWN",
        address_county: "",
        address_postcode: "SW1A 2AA",

        family: [
            { age: 36, gender: "female" },
            { age: 5, gender: "male" },
            { age: 24, gender: "other" },
        ],

        dietary_requirements: ["Gluten Free", "Halal", "No Pasta"],
        feminine_products: ["Tampons", "Incontinence Pads"],
        baby_food: true,
        pet_food: ["Cat", "Dog"],
        other_items: ["Garlic", "Chillies", "Hot Water Bottles"],
        extra_information: "EXTRA CLIENT INFORMATION",
    },
};

describe("Clients Page", () => {
    describe("Backend Processing for Table Data", () => {
        it("Fields are set correctly", () => {
            cy.intercept("POST", "**/check-congestion-charge", (req) => {
                const response = req.body.postcodes.map((postcode: string) => ({
                    postcode,
                    congestionCharge: true,
                }));

                req.reply(JSON.stringify(response));
            });

            cy.wrap(null).then(() =>
                processingDataToClientsTableData(sampleProcessingData).then((clientTableData) => {
                    expect(clientTableData).to.deep.equal([
                        {
                            parcelId: "PRIMARY_KEY",
                            flaggedForAttention: false,
                            requiresFollowUpPhoneCall: true,
                            fullName: "CLIENT_NAME",
                            familyCategory: "Family of 3",
                            addressPostcode: "SW1A 2AA",
                            collectionCentre: "COLLECTION_CENTRE",
                            congestionChargeApplies: true,
                            packingDate: "04/08/2023",
                            packingTimeLabel: "PM",
                            lastStatus: "LAST_EVENT @ 04/08/2023",
                        },
                    ]);
                })
            );
        });

        it("familyCountToFamilyCategory()", () => {
            expect(familyCountToFamilyCategory(1)).to.eq("Single");
            expect(familyCountToFamilyCategory(2)).to.eq("Family of 2");
            expect(familyCountToFamilyCategory(9)).to.eq("Family of 9");
            expect(familyCountToFamilyCategory(10)).to.eq("Family of 10+");
            expect(familyCountToFamilyCategory(15)).to.eq("Family of 10+");
        });

        it("formatDatetimeAsDate()", () => {
            expect(formatDatetimeAsDate("2023-08-04T13:30:00+00:00")).to.eq("04/08/2023");
            expect(formatDatetimeAsDate("2024-11-23T01:43:50+00:00")).to.eq("23/11/2024");
            expect(formatDatetimeAsDate("Invalid_Date_Format")).to.eq("-");
            expect(formatDatetimeAsDate(null)).to.eq("-");
        });

        it("datetimeToPackingTimeLabel()", () => {
            expect(datetimeToPackingTimeLabel("2023-08-04T08:30:00+00:00")).to.eq("AM");
            expect(datetimeToPackingTimeLabel("2023-08-04T13:30:00+00:00")).to.eq("PM");
        });

        it("eventToStatusMessage()", () => {
            expect(
                eventToStatusMessage({
                    event_name: "EVENT",
                    timestamp: "2023-08-04T13:30:00+00:00",
                })
            ).to.eq("EVENT @ 04/08/2023");
            expect(eventToStatusMessage(null)).to.eq("-");
        });
    });

    describe("Backend Processing for Expanded Client Details", () => {
        it("Fields are set correctly", () => {
            const expandedClientDetails = rawDataToExpandedClientDetails(
                sampleRawExpandedClientDetails
            );

            expect(expandedClientDetails).to.deep.equal({
                "voucher_#": "VOUCHER_1",
                full_name: "CLIENT NAME",
                phone_number: "PHONE NUMBER",
                packing_date: "04/08/2023",
                packing_time: new Date("2023-08-04T08:30:00+00:00").getTimezoneOffset()
                    ? "14:30:00"
                    : "13:30:00",
                delivery_instructions: "INSTRUCTIONS FOR DELIVERY",
                address: "Address Line 1, Address Line 2, TOWN, SW1A 2AA",
                household: "Family of 3 Occupants (2 adults, 1 child)",
                "age_&_gender_of_children": "5-year-old male",
                dietary_requirements: "Gluten Free, Halal, No Pasta",
                feminine_products: "Tampons, Incontinence Pads",
                baby_products: true,
                pet_food: "Cat, Dog",
                other_requirements: "Garlic, Chillies, Hot Water Bottles",
                extra_information: "EXTRA CLIENT INFORMATION",
            });
        });

        it("formatDatetimeAsTime()", () => {
            expect(formatDatetimeAsTime("2023-08-04T13:30:02+00:00")).to.eq(
                new Date("2023-08-04T13:30:02+00:00").getTimezoneOffset() === -60
                    ? "14:30:02"
                    : "13:30:02"
            );
            expect(formatDatetimeAsTime("2024-11-23T01:03:50+00:00")).to.eq(
                new Date("2024-11-23T01:03:50+00:00").getTimezoneOffset() === -60
                    ? "02:03:50"
                    : "01:03:50"
            );
            expect(formatDatetimeAsTime("Invalid_Time_Format")).to.eq("-");
            expect(formatDatetimeAsTime(null)).to.eq("-");
        });

        it("formatAddressFromClientDetails()", () => {
            expect(
                formatAddressFromClientDetails({
                    address_1: "Address Line 1",
                    address_2: "Address Line 2",
                    address_town: "TOWN",
                    address_county: "COUNTY",
                    address_postcode: "POSTCODE",
                })
            ).to.eq("Address Line 1, Address Line 2, TOWN, COUNTY, POSTCODE");

            expect(
                formatAddressFromClientDetails({
                    address_1: "Address Line 1",
                    address_2: "",
                    address_town: "TOWN",
                    address_county: "",
                    address_postcode: "POSTCODE",
                })
            ).to.eq("Address Line 1, TOWN, POSTCODE");
        });

        it("formatHouseholdFromFamilyDetails()", () => {
            expect(
                formatHouseholdFromFamilyDetails([
                    { age: 36, gender: "female" },
                    { age: 5, gender: "male" },
                    { age: 24, gender: "other" },
                ])
            ).to.eq("Family of 3 Occupants (2 adults, 1 child)");

            expect(
                formatHouseholdFromFamilyDetails([
                    { age: 36, gender: "female" },
                    { age: 5, gender: "male" },
                    { age: 4, gender: "female" },
                    { age: 15, gender: "other" },
                ])
            ).to.eq("Family of 4 Occupants (1 adult, 3 children)");

            expect(formatHouseholdFromFamilyDetails([{ age: 16, gender: "female" }])).to.eq(
                "Single Occupant (1 adult)"
            );

            expect(formatHouseholdFromFamilyDetails([{ age: 15, gender: "male" }])).to.eq(
                "Single Occupant (1 child)"
            );
        });

        it("formatBreakdownOfChildrenFromFamilyDetails()", () => {
            expect(
                formatBreakdownOfChildrenFromFamilyDetails([
                    { age: 36, gender: "female" },
                    { age: 5, gender: "male" },
                    { age: 4, gender: "female" },
                    { age: 15, gender: "other" },
                ])
            ).to.eq("5-year-old male, 4-year-old female, 15-year-old other");

            expect(
                formatBreakdownOfChildrenFromFamilyDetails([
                    { age: 36, gender: "female" },
                    { age: 15, gender: "female" },
                ])
            ).to.eq("15-year-old female");

            expect(
                formatBreakdownOfChildrenFromFamilyDetails([
                    { age: 36, gender: "female" },
                    { age: 26, gender: "male" },
                ])
            ).to.eq("No Children");
        });
    });
});
