import React from "react";
import CheckboxInput from "@/components/DataInput/CheckboxInput";
import DropdownListInput from "@/components/DataInput/DropdownListInput";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import {
    getFreeFormTextHandler,
    getCheckboxHandler,
    getDropdownListHandler,
    getRadioGroupHandler,
    getCheckboxGroupHandler,
} from "@/components/DataInput/inputHandlerFactories";
import { hexToRgb, SelectChangeEvent } from "@mui/material";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import PasswordInput from "@/components/DataInput/PasswordInput";

describe("Data Input Components", () => {
    it("renders", () => {
        cy.mount(
            <CheckboxInput
                label="LABEL"
                onChange={getCheckboxHandler(() => console.log("Checkbox Changed"))}
            />
        );
        cy.mount(
            <DropdownListInput
                selectLabelId="select-label"
                labelsAndValues={[
                    ["A", "a"],
                    ["B", "b"],
                    ["C", "c"],
                ]}
                listTitle="Dropdown List"
                defaultValue="Default"
                onChange={getDropdownListHandler(() => console.log("Dropdown Changed"))}
            />
        );
        cy.mount(
            <FreeFormTextInput
                label="FreeForm"
                defaultValue="default"
                onChange={getFreeFormTextHandler(() => console.log("Freeform Changed"))}
            />
        );
        cy.mount(
            <PasswordInput
                label="Password"
                defaultValue="password"
                onChange={getFreeFormTextHandler(() => console.log("Password Changed"))}
            />
        );
        cy.mount(
            <RadioGroupInput
                labelsAndValues={[
                    ["A", "a"],
                    ["B", "b"],
                    ["C", "c"],
                ]}
                groupTitle="Radio Group"
                onChange={getRadioGroupHandler(() => console.log("Radio Changed"))}
            />
        );
        cy.mount(
            <CheckboxGroupInput
                labelsAndKeys={[
                    ["Label A", "a"],
                    ["Label B", "b"],
                    ["Label C", "c"],
                ]}
                groupLabel="Checkbox Group"
                onChange={getCheckboxGroupHandler({}, () => console.log("Checkbox Group Changed"))}
            />
        );
    });

    it("renders without optional props", () => {
        cy.mount(<CheckboxInput />);
        cy.mount(<FreeFormTextInput />);
        cy.mount(<PasswordInput />);
        cy.mount(
            <DropdownListInput
                selectLabelId="select-label"
                labelsAndValues={[
                    ["A", "a"],
                    ["B", "b"],
                    ["C", "c"],
                ]}
            />
        );
        cy.mount(
            <RadioGroupInput
                labelsAndValues={[
                    ["A", "a"],
                    ["B", "b"],
                    ["C", "c"],
                ]}
            />
        );
        cy.mount(
            <CheckboxGroupInput
                labelsAndKeys={[
                    ["Label A", "a"],
                    ["Label B", "b"],
                    ["Label C", "c"],
                ]}
            />
        );
    });

    it("Add error message to form", () => {
        cy.mount(<FreeFormTextInput label="FreeForm" error={true} helperText="Error" />);
        cy.get(".Mui-error").contains("Error");
        cy.get(".Mui-error").should("have.css", "color", hexToRgb("#d32f2f"));
    });

    it("Visibility on password input can be toggled", () => {
        cy.mount(<PasswordInput label="Password" />);
        cy.get("input[type='password']").should("exist");
        cy.get("input[type='text']").should("not.exist");

        cy.get("button[aria-label='toggle password visibility']").click();
        cy.get("input[type='password']").should("not.exist");
        cy.get("input[type='text']").should("exist");

        cy.get("button[aria-label='toggle password visibility']").click();
        cy.get("input[type='password']").should("exist");
        cy.get("input[type='text']").should("not.exist");
    });

    describe("Change Handlers", () => {
        it("Change handler for checkbox works", () => {
            const onChangeSpy = cy.spy().as("onChangeSpy");
            const unwrapEvent = (event: React.ChangeEvent<HTMLInputElement>): void => {
                onChangeSpy(event.target.checked);
            };

            cy.mount(<CheckboxInput label="A" onChange={unwrapEvent} />);

            cy.get("input").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", true);

            cy.get("input").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", false);
        });

        it("Change handler for checkbox group works without default checked keys", () => {
            const onChangeSpy = cy.spy().as("onChangeSpy");
            const unwrapEvent = (event: React.ChangeEvent<HTMLInputElement>): void => {
                onChangeSpy(event.target.name, event.target.checked);
            };

            cy.mount(
                <CheckboxGroupInput
                    labelsAndKeys={[
                        ["Label A", "a"],
                        ["Label B", "b"],
                        ["Label C", "c"],
                    ]}
                    groupLabel="Checkbox Group"
                    onChange={unwrapEvent}
                />
            );

            cy.get("input[name='a']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "a", true);

            cy.get("input[name='b']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "b", true);

            cy.get("input[name='c']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "c", true);

            cy.get("input[name='a']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "a", false);
        });

        it("Change handler for checkbox group works with default checked keys", () => {
            const onChangeSpy = cy.spy().as("onChangeSpy");
            const unwrapEvent = (event: React.ChangeEvent<HTMLInputElement>): void => {
                onChangeSpy(event.target.name, event.target.checked);
            };

            cy.mount(
                <CheckboxGroupInput
                    labelsAndKeys={[
                        ["Label A", "a"],
                        ["Label B", "b"],
                        ["Label C", "c"],
                    ]}
                    groupLabel="Checkbox Group"
                    onChange={unwrapEvent}
                    defaultCheckedKeys={["a", "b"]}
                />
            );

            cy.get("input[name='a']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "a", false);

            cy.get("input[name='b']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "b", false);

            cy.get("input[name='c']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "c", true);

            cy.get("input[name='a']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "a", true);
        });

        it("Change handler for dropdown works", () => {
            const onChangeSpy = cy.spy().as("onChangeSpy");
            const unwrapEvent = (event: SelectChangeEvent): void => {
                onChangeSpy(event.target.value);
            };

            cy.mount(
                <DropdownListInput
                    selectLabelId="select-label"
                    labelsAndValues={[
                        ["A", "a"],
                        ["B", "b"],
                        ["C", "c"],
                    ]}
                    listTitle="Dropdown List"
                    defaultValue="Default"
                    onChange={unwrapEvent}
                />
            );

            cy.get("div[class^='MuiSelect']").click();

            cy.get("li[data-value='a']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "a");

            cy.get("div[class^='MuiSelect']").click();

            cy.get("li[data-value='b']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "b");

            cy.get("div[class^='MuiSelect']").click();

            cy.get("li[data-value='c']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "c");
        });

        it("Change handler for freeform text works", () => {
            const onChangeSpy = cy.spy().as("onChangeSpy");
            const unwrapEvent = (event: React.ChangeEvent<HTMLInputElement>): void => {
                onChangeSpy(event.target.value);
            };

            cy.mount(<FreeFormTextInput label="FreeForm" onChange={unwrapEvent} />);

            cy.get("input[class^='MuiInputBase']").type("TEST_TEXT");
            cy.get("@onChangeSpy").should("have.been.calledWith", "TEST_TEXT");
        });

        it("Change handler for password input works", () => {
            const onChangeSpy = cy.spy().as("onChangeSpy");
            const unwrapEvent = (event: React.ChangeEvent<HTMLInputElement>): void => {
                onChangeSpy(event.target.value);
            };

            cy.mount(<PasswordInput label="Password" onChange={unwrapEvent} />);

            cy.get("input[class^='MuiInputBase']").type("TEST_TEXT");
            cy.get("@onChangeSpy").should("have.been.calledWith", "TEST_TEXT");
        });

        it("Change handler for radio group works", () => {
            const onChangeSpy = cy.spy().as("onChangeSpy");
            const unwrapEvent = (event: React.ChangeEvent<HTMLInputElement>): void => {
                onChangeSpy(event.target.value);
            };

            cy.mount(
                <RadioGroupInput
                    labelsAndValues={[
                        ["A", "a"],
                        ["B", "b"],
                        ["C", "c"],
                    ]}
                    groupTitle="Radio Group"
                    onChange={unwrapEvent}
                />
            );

            cy.get("input[value='a']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "a");

            cy.get("input[value='b']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "b");

            cy.get("input[value='c']").click();
            cy.get("@onChangeSpy").should("have.been.calledWith", "c");
        });
    });
});
