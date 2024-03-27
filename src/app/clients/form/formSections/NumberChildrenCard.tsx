import React from "react";
import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import {
    errorExists,
    errorText,
    FieldSetter,
    onChangeText,
    numberRegex,
    Person,
    Gender,
    CardProps,
} from "@/components/Form/formFunctions";
import DropdownListInput from "@/components/DataInput/DropdownListInput";
import { StyledCard, FormText } from "@/components/Form/formStyling";
import GenericFormCard from "@/components/Form/GenericFormCard";
import { SelectChangeEventHandler } from "@/components/DataInput/inputHandlerFactories";

const maxNumberChildren = (value: string): boolean => {
    return parseInt(value) <= 20;
};

const getChild = (
    fieldSetter: FieldSetter,
    children: Person[],
    index: number,
    subFieldName: "gender" | "age"
): SelectChangeEventHandler => {
    return (event) => {
        const input = event.target.value;
        if (subFieldName === "gender") {
            children[index][subFieldName] = (input !== "Don't Know" ? input : "other") as Gender;
        } else {
            children[index][subFieldName] = parseInt(input);
        }
        fieldSetter("children", [...children]);
    };
};

const NumberChildrenCard: React.FC<CardProps> = ({
    formErrors,
    errorSetter,
    fieldSetter,
    fields,
}) => {
    return (
        <GenericFormCard
            title="Number of Children"
            required={true}
            text="Please enter a number between 0 and 20. (Note that children are under 16 years old)"
        >
            <>
                <FreeFormTextInput
                    label="Number of Children"
                    defaultValue={fields.numberChildren !== 0 ? fields.numberChildren : undefined}
                    error={errorExists(formErrors.numberChildren)}
                    helperText={errorText(formErrors.numberChildren)}
                    onChange={onChangeText(
                        fieldSetter,
                        errorSetter,
                        "numberChildren",
                        true,
                        numberRegex,
                        parseInt,
                        maxNumberChildren
                    )}
                />
                {fields.children.map((child: Person, index: number) => {
                    return (
                        <StyledCard key={child.primaryKey}>
                            <FormText>Child {index + 1}</FormText>
                            <DropdownListInput
                                selectLabelId="children-gender-select-label"
                                labelsAndValues={[
                                    ["Male", "male"],
                                    ["Female", "female"],
                                    ["Prefer Not To Say", "other"],
                                ]}
                                listTitle="Gender"
                                defaultValue={child.gender}
                                onChange={getChild(fieldSetter, fields.children, index, "gender")}
                            />
                            <DropdownListInput
                                selectLabelId="children-age-select-label"
                                labelsAndValues={[
                                    ["<1", "0"],
                                    ["1", "1"],
                                    ["2", "2"],
                                    ["3", "3"],
                                    ["4", "4"],
                                    ["5", "5"],
                                    ["6", "6"],
                                    ["7", "7"],
                                    ["8", "8"],
                                    ["9", "9"],
                                    ["10", "10"],
                                    ["11", "11"],
                                    ["12", "12"],
                                    ["13", "13"],
                                    ["14", "14"],
                                    ["15", "15"],
                                    ["Don't Know", "-1"],
                                ]}
                                listTitle="Age"
                                defaultValue={child.age!.toString()}
                                onChange={getChild(fieldSetter, fields.children, index, "age")}
                            />
                        </StyledCard>
                    );
                })}
            </>
        </GenericFormCard>
    );
};

export default NumberChildrenCard;
