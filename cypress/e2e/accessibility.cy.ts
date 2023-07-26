import PAGES from "../e2e_utils/PAGES";
import SCREEN_SIZES from "../e2e_utils/SCREEN_SIZES";

describe("Accessibility Tests", () => {
    ["light", "dark"].map((mode) => {
        describe(`Testing ${mode} mode`, () => {
            SCREEN_SIZES.map((screen) => {
                describe(`Testing ${screen.name} size`, () => {
                    PAGES.map((page) => {
                        it(`${page.friendly_name} page`, () => {
                            cy.viewport(...screen.resolution);

                            if (page.requiresLogin) {
                                cy.login();
                            }
                            cy.visit(page.url);
                            page.waitForLoad();

                            if (mode === "dark") {
                                cy.get("button[aria-label='Theme Switch']").click();
                            }

                            cy.checkAccessibility();
                        });
                    });
                });
            });
        });
    });
});
