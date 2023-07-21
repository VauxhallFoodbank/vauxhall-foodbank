describe("Accessibility tests in light mode", () => {
    beforeEach(() => {
        cy.login();
    });

    it("Checks clients page", () => {
        cy.visit("/clients");
        cy.get(".light-button").click();

        cy.get(".light-button").click();
        cy.checkAccessibility();
    });

    it("Checks lists page", () => {
        cy.visit("/lists");
        cy.get(".light-button").click();

        cy.get(".light-button").click();
        cy.checkAccessibility();
    });

    it("Checks calendar page", () => {
        cy.visit("/calendar");
        cy.get(".light-button").click();

        cy.get(".light-button").click();
        cy.get("table", { timeout: 5000 }).should("be.visible");
        cy.checkAccessibility();
    });

    it("Checks login page", () => {
        cy.visit("/clients");
        cy.get(".light-button").click();
        cy.get("input[type=submit]").contains("Sign out").click();
        cy.url().should("include", "/login");

        cy.get(".light-button").click();
        cy.checkAccessibility();
    });
});

describe("Accessibility tests in dark mode", () => {
    beforeEach(() => {
        cy.login();
    });

    it("Checks clients page", () => {
        cy.visit("/clients");
        cy.get(".dark-button").click();

        cy.get(".dark-button").click();
        cy.checkAccessibility();
    });

    it("Checks lists page", () => {
        cy.visit("/lists");
        cy.get(".dark-button").click();

        cy.get(".dark-button").click();
        cy.checkAccessibility();
    });

    it("Checks calendar page", () => {
        cy.visit("/calendar");
        cy.get(".dark-button").click();

        cy.get(".dark-button").click();
        cy.get("table", { timeout: 5000 }).should("be.visible");
        cy.checkAccessibility();
    });

    it("Checks login page", () => {
        cy.visit("/clients");
        cy.get(".dark-button").click();
        cy.get("input[type=submit]").contains("Sign out").click();
        cy.url().should("include", "/login");

        cy.get(".dark-button").click();
        cy.checkAccessibility();
    });
});
