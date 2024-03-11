import ActionBar, { ActionBarProps } from "@/app/parcels/ActionBar/ActionBar";
import { ParcelsTableRow } from "@/app/parcels/getParcelsTableData";
import React from "react";
import StyleManager from "@/app/themes";
import Localization from "@/app/Localization";

describe("Parcels - Action Bar", () => {
    const mockData: ParcelsTableRow[] = [
        {
            primaryKey: "primaryKey1",
            addressPostcode: "AB1 2CD",
            phoneNumber: "0987 654321",
            deliveryCollection: {
                collectionCentreName: "Centre 1",
                collectionCentreAcronym: "C1",
                congestionChargeApplies: false,
            },
            collectionDatetime: new Date(),
            familyCategory: "Single",
            fullName: "John Smith",
            lastStatus: {
                name: "Delivered",
                eventData: "Some information",
                timestamp: new Date(),
            },
            packingDatetime: new Date(),
            packingTimeLabel: "AM",
            parcelId: "123456789",
            iconsColumn: {
                requiresFollowUpPhoneCall: false,
                flaggedForAttention: false,
            },
            voucherNumber: "123456789",
        },
        {
            primaryKey: "primaryKey2",
            addressPostcode: "AB1 aaaa2CD",
            phoneNumber: "+1 234 567",
            deliveryCollection: {
                collectionCentreName: "Centraaaae 1",
                collectionCentreAcronym: "C2",
                congestionChargeApplies: true,
            },
            collectionDatetime: new Date(),
            familyCategory: "Family of 4",
            fullName: "John Smaaaaith",
            lastStatus: {
                name: "Called and Confirmed",
                eventData: null,
                timestamp: new Date(),
            },
            packingDatetime: new Date(),
            packingTimeLabel: "PM",
            parcelId: "123456aaaa789",
            iconsColumn: {
                requiresFollowUpPhoneCall: false,
                flaggedForAttention: false,
            },
            voucherNumber: "123456aaaa789",
        },
    ];

    const MockActionBar: React.FC<ActionBarProps> = ({ selectedParcels, onDeleteParcels }) => {
        return (
            <Localization>
                <StyleManager>
                    <ActionBar
                        selectedParcels={selectedParcels}
                        onDeleteParcels={onDeleteParcels}
                        hasSavedParcelStatus={() => {}}
                        willSaveParcelStatus={() => {}}
                    />
                </StyleManager>
            </Localization>
        );
    };
    describe("Statuses", () => {
        const selectedParcels = mockData.slice(0, 2);
        const onDeleteParcels = (parcels: ParcelsTableRow[]): void => {
            selectedParcels.filter((parcelToDelete) => !parcels.includes(parcelToDelete));
        };

        beforeEach(() => {
            cy.mount(
                <MockActionBar
                    selectedParcels={selectedParcels}
                    onDeleteParcels={onDeleteParcels}
                    hasSavedParcelStatus={() => {}}
                    willSaveParcelStatus={() => {}}
                />
            );
        });

        it("should open the status menu when the status button is clicked", () => {
            cy.get("#status-button").click();
            cy.get("#status-menu").should("exist");
        });

        it("should open the modal when an item is selected", () => {
            cy.get("#status-button").click();
            cy.get("#status-menu").should("exist");
            cy.get("#status-menu").contains("Request Denied").click();
            cy.get("#status-modal-header").should("exist");
        });

        it("should close the modal when the close button is clicked", () => {
            cy.get("#status-button").click();
            cy.get("#status-menu").should("exist");
            cy.get("#status-menu").contains("Request Denied").click();
            cy.get("#status-modal-header").should("exist");
            cy.get("[aria-label='Close Button']").click();
            cy.get("#status-modal-header").should("not.exist");
        });

        it("should have a modal with date and time pickers", () => {
            cy.get("#status-button").click();
            cy.get("#status-menu").should("exist");
            cy.get("#status-menu").contains("Request Denied").click();
            cy.get("#status-modal-header").should("exist");
            cy.get(".MuiPaper-root").contains("Date");
            cy.get(".MuiPaper-root").contains("Time");
            const dateString = new Date().toLocaleDateString("en-GB");
            cy.get(`input[value="${dateString}"]`).should("exist");
            const timeString = new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            });
            cy.get(`input[value="${timeString}"]`).should("exist");
        });

        it("should have a modal that contains the selected data", () => {
            cy.get("#status-button").click();
            cy.get("#status-menu").should("exist");
            cy.get("#status-menu").contains("Request Denied").click();
            cy.get("#status-modal-header").should("exist");
            cy.get(".MuiPaper-root").contains("Date");
            cy.get(".MuiPaper-root").contains("Time");
            const dateString = new Date().toLocaleDateString("en-GB");
            cy.get(`input[value="${dateString}"]`).should("exist");
            const timeString = new Date().toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
            });
            cy.get(`input[value="${timeString}"]`).should("exist");
            selectedParcels.forEach((parcel) => {
                cy.get(".MuiPaper-root").contains(parcel.addressPostcode);
                cy.get(".MuiPaper-root").contains(parcel.fullName);
            });
        });
    });

    describe("Actions", () => {
        const selectedParcels = mockData.slice(0, 2);
        const onDeleteParcels = (parcels: ParcelsTableRow[]): void => {
            selectedParcels.filter((parcelToDelete) => !parcels.includes(parcelToDelete));
        };
        const row = selectedParcels[0];

        beforeEach(() => {
            cy.mount(
                <MockActionBar
                    selectedParcels={selectedParcels}
                    onDeleteParcels={onDeleteParcels}
                    hasSavedParcelStatus={() => {}}
                    willSaveParcelStatus={() => {}}
                />
            );
        });

        it("should open the action menu when the action button is clicked", () => {
            cy.get("#action-button").click();
            cy.get("#action-menu").should("exist");
        });

        it("should open the modal when an item is selected", () => {
            cy.get("#action-button").click();
            cy.get("#action-menu").should("exist");
            cy.get("#action-menu").contains("Download Shopping List").click();
            cy.get("#action-modal-header").should("exist");
        });

        it("should close the modal when the close button is clicked", () => {
            cy.get("#action-button").click();
            cy.get("#action-menu").should("exist");
            cy.get("#action-menu").contains("Download Shopping List").click();
            cy.get("#action-modal-header").should("exist");
            cy.get("[aria-label='Close Button']").click();
            cy.get("#action-modal-header").should("not.exist");
        });

        it("should have a modal that contains the selected data", () => {
            cy.get("#action-button").click();
            cy.get("#action-menu").should("exist");
            cy.get("#action-menu").contains("Download Shopping List").click();
            cy.get("#action-modal-header").should("exist");
            cy.get(".MuiPaper-root").contains(row.addressPostcode);
            cy.get(".MuiPaper-root").contains(row.fullName);
        });
    });
});
