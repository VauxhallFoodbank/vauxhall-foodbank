"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import supabase, { InsertSchema } from "@/supabase";
import { Database } from "@/database_types_file";

import FreeFormTextInput from "@/components/DataInput/FreeFormTextInput";
import RadioGroupInput from "@/components/DataInput/RadioGroupInput";
import DropdownListInput from "@/components/DataInput/DropdownListInput";
import CheckboxGroupInput from "@/components/DataInput/CheckboxGroupInput";
import {
    booleanGroup,
    getCheckboxGroupHandler,
} from "@/components/DataInput/inputHandlerFactories";
import { SelectChangeEvent } from "@mui/material";

type ClientDatabaseRecord = InsertSchema["clients"];
type FamilyDatabaseRecord = InsertSchema["families"];
type PersonType = Database["public"]["Enums"]["gender"];
type OnChangeType = (event: React.ChangeEvent<HTMLInputElement>) => void;
type GenderToAge = {
    [gender in PersonType]?: number;
};

interface ErrorMessages {
    nameErrorMessage: string;
    phoneErrorMessage: string;
    addressErrorMessage: string;
    postcodeErrorMessage: string;
    numberAdultsErrorMessage: string;
    numberChildrenErrorMessage: string;
    nappyErrorMessage: string;
}

interface AgeGenderChild {
    key: number;
    gender: PersonType;
    age: number | null;
}

const CenterComponent = styled.div`
    display: flex;
    justify-content: center;
    align-content: center;
    padding-block: 1rem;
    background-color: ${(props) => props.theme.backgroundColor};
`;

const StyledForm = styled.div`
    margin: 2em;
    color: ${(props) => props.theme.foregroundColor};
    width: 90%;
`;

const StyledCard = styled.div`
    padding: 2em 2em;
    width: 100%;
    height: 80%;
    border-radius: 10px;
    background-color: ${(props) => props.theme.surfaceBackgroundColor};
    color: ${(props) => props.theme.surfaceForegroundColor};

    div {
        background-color: inherit;
        color: inherit;
        width: 100%;
        margin-top: 0.15em;
        margin-bottom: 0.15em;
    }
`;

const Text = styled.p`
    text-align: left;
    padding-bottom: 1em;
    font-weight: lighter;
`;

const Heading = styled.h1`
    padding-bottom: 1em;
`;

const Subheading = styled(Text)`
    font-size: large;
    font-weight: bolder;
`;

const Asterisk = styled.span`
    color: ${(props) => props.theme.errorColor};
`;

const StyledButton = styled.button`
    text-align: center;
    width: 100px;
    height: 30px;
    border-radius: 10px;
    border: solid 1px ${(props) => props.theme.foregroundColor};
    background-color: ${(props) => props.theme.primaryBackgroundColor};
    color: ${(props) => props.theme.primaryForegroundColor};

    &:hover {
        background-color: ${(props) => props.theme.secondaryBackgroundColor};
        color: ${(props) => props.theme.secondaryForegroundColor};
    }
`;

const initialErrorMessages = {
    nameErrorMessage: "N/A",
    phoneErrorMessage: "",
    addressErrorMessage: "N/A",
    postcodeErrorMessage: "N/A",
    numberAdultsErrorMessage: "N/A",
    numberChildrenErrorMessage: "N/A",
    nappyErrorMessage: "",
};

const RequestForm: React.FC = () => {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [addressLine1, setAddressLine1] = useState("");
    const [addressLine2, setAddressLine2] = useState("");
    const [addressTown, setAddressTown] = useState("");
    const [addressCounty, setAddressCounty] = useState("");
    const [addressPostcode, setAddressPostcode] = useState("");
    const [numberAdults, setNumberAdults] = useState<GenderToAge>({ female: 0, male: 0, adult: 0 });
    const [numberChildren, setNumberChildren] = useState(0);
    const [ageGenderChildren, setAgeGenderChildren] = useState<AgeGenderChild[]>([]);
    const [dietaryRequirements, setDietaryRequirements] = useState({});
    const [feminineProducts, setFeminineProducts] = useState({});
    const [babyProducts, setBabyProducts] = useState<boolean | null>(null);
    const [nappySize, setNappySize] = useState("");
    const [petFood, setPetFood] = useState({});
    const [otherItems, setOtherItems] = useState({});
    const [deliveryInstructions, setDeliveryInstruction] = useState("");
    const [extraInformation, setExtraInformation] = useState("");

    const [errorMessages, setErrorMessages] = useState<ErrorMessages>(initialErrorMessages);

    useEffect(() => {
        const defaultAgeGenderChildren = Array.from(
            { length: numberChildren },
            (value, index): AgeGenderChild => {
                return {
                    key: index,
                    gender: "child",
                    age: null,
                };
            }
        );
        setAgeGenderChildren(defaultAgeGenderChildren);
    }, [numberChildren]);

    const getRequiredFieldWithoutChecks = (
        errorName: string,
        fieldSetter: React.Dispatch<React.SetStateAction<string>>
    ): OnChangeType => {
        return (event) => {
            const input = event.target.value;
            if (input === "") {
                setErrorMessages({
                    ...errorMessages,
                    [errorName]: "This is a required field.",
                });
            } else {
                setErrorMessages({ ...errorMessages, [errorName]: "" });
                fieldSetter(event.target.value);
            }
        };
    };

    const getNumberChildren = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const input = event.target.value;

        if (input === "") {
            setErrorMessages({ ...errorMessages, numberChildrenErrorMessage: "" });
        } else if (input.match(/^\d+$/)) {
            setErrorMessages({ ...errorMessages, numberChildrenErrorMessage: "" });
            setNumberChildren(parseInt(input));
        } else {
            setErrorMessages({
                ...errorMessages,
                numberChildrenErrorMessage: "Please enter a valid number",
            });
        }
    };

    const getPhoneNumber = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const phoneNumberPattern = /^(\+|0)(\s?)(\s|\d+|-){5,}$/;
        const formatting = (val: string): string => {
            const numericInput = val.replace(/(\D)/g, "");
            return numericInput[0] === "0" ? "+44" + numericInput.slice(1) : "+" + numericInput;
        };

        const input = event.target.value;

        if (input === "" || input.match(phoneNumberPattern)) {
            setErrorMessages({ ...errorMessages, phoneErrorMessage: "" });
        } else {
            setErrorMessages({
                ...errorMessages,
                phoneErrorMessage: "Please enter a valid phone number",
            });
        }
        setPhoneNumber(formatting(input));
    };

    const getAddressPostcode = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const postcodePattern =
            /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9][A-Za-z]?))))\s?[0-9][A-Za-z]{2})$/;
        const formatting = (val: string): string => {
            return val.replace(/(\s)/g, "").toUpperCase();
        };

        const input = event.target.value;

        if (input === "") {
            setErrorMessages({
                ...errorMessages,
                postcodeErrorMessage: "This is a required field",
            });
        } else if (input.match(postcodePattern)) {
            setErrorMessages({ ...errorMessages, postcodeErrorMessage: "" });
            setAddressPostcode(formatting(input));
        } else {
            setErrorMessages({
                ...errorMessages,
                postcodeErrorMessage: "Please enter a valid postcode.",
            });
        }
    };

    const getNumberAdults = (
        event: React.ChangeEvent<HTMLInputElement>,
        gender: PersonType
    ): void => {
        const input = event.target.value;
        const numberPattern = /^\d+$/;
        if (input === "") {
            numberAdults[gender] = 0;
        } else if (input.match(numberPattern)) {
            numberAdults[gender] = parseInt(input);
        } else {
            numberAdults[gender] = -1;
        }
        setNumberAdults(numberAdults);
        const nonZeroAdultEntry = Object.values(numberAdults).filter((value) => value > 0);
        const invalidAdultEntry = Object.values(numberAdults).filter((value) => value === -1);
        if (invalidAdultEntry.length > 0) {
            setErrorMessages({
                ...errorMessages,
                numberAdultsErrorMessage: "Please enter a valid number.",
            });
        } else if (nonZeroAdultEntry.length === 0) {
            setErrorMessages({
                ...errorMessages,
                numberAdultsErrorMessage: "This is a required field.",
            });
        } else {
            setErrorMessages({
                ...errorMessages,
                numberAdultsErrorMessage: "",
            });
        }
    };

    const getGenderChildren = (event: SelectChangeEvent, count: number): void => {
        const input = event.target.value !== "don't know" ? event.target.value : "child";
        const particularChild = ageGenderChildren.findIndex((object) => object.key === count);
        ageGenderChildren[particularChild].gender = input as PersonType;
        setAgeGenderChildren([...ageGenderChildren]);
    };

    const getAgeChildren = (event: SelectChangeEvent, count: number): void => {
        const input = event.target.value;
        const particularChild = ageGenderChildren.findIndex((object) => object.key === count);
        ageGenderChildren[particularChild].age = input !== "Don't Know" ? parseInt(input) : null;
        setAgeGenderChildren([...ageGenderChildren]);
    };

    const getBabyProducts = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const input = event.target.value;
        if (input === "Yes") {
            setErrorMessages({ ...errorMessages, nappyErrorMessage: "N/A" });
            setBabyProducts(true);
        } else if (input === "No") {
            setErrorMessages({ ...errorMessages, nappyErrorMessage: "" });
            setBabyProducts(false);
        } else {
            setErrorMessages({ ...errorMessages, nappyErrorMessage: "" });
            setBabyProducts(null);
        }
    };

    const getNappySize = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const input = event.target.value;
        if (input === "") {
            setErrorMessages({ ...errorMessages, nappyErrorMessage: "This is a required field" });
        } else {
            setErrorMessages({ ...errorMessages, nappyErrorMessage: "" });
            setNappySize(input);
        }
    };

    const getFieldWithoutChecks = (
        fieldSetter: React.Dispatch<React.SetStateAction<string>>
    ): OnChangeType => {
        return (event) => fieldSetter(event.target.value);
    };

    const checkboxGroupToArray = (checkedBoxes: booleanGroup): string[] => {
        return Object.keys(checkedBoxes);
    };

    const createRecord = async (): Promise<void> => {
        if (nappySize) {
            setExtraInformation(`Nappy Size: ${nappySize}, Extra Information: ${extraInformation}`);
        }

        const clientRecord: ClientDatabaseRecord = {
            address_1: addressLine1,
            address_2: addressLine2,
            address_county: addressCounty,
            address_postcode: addressPostcode,
            address_town: addressTown,
            baby_food: babyProducts,
            delivery_instructions: deliveryInstructions,
            dietary_requirements: checkboxGroupToArray(dietaryRequirements),
            feminine_products: checkboxGroupToArray(feminineProducts),
            full_name: fullName,
            other_items: checkboxGroupToArray(otherItems),
            pet_food: checkboxGroupToArray(petFood),
            phone_number: phoneNumber,
            extra_information: extraInformation,
        };

        console.log(clientRecord);

        const { data: familyID, error: error } = await supabase
            .from("clients")
            .insert(clientRecord)
            .select("family_id");
        if (error) {
            console.error(error);
        }

        for (const [gender, quantity] of Object.entries(numberAdults)) {
            const familyAdultRecord: FamilyDatabaseRecord = {
                family_id: familyID![0].family_id,
                person_type: gender as PersonType,
                quantity: quantity,
                age: null,
            };
            const { error: error } = await supabase.from("families").insert(familyAdultRecord);
            if (error) {
                console.error(error);
            }
        }

        for (const child of ageGenderChildren) {
            const familyChildRecord: FamilyDatabaseRecord = {
                family_id: familyID![0].family_id,
                person_type: child.gender as PersonType,
                quantity: 1,
                age: child.age,
            };
            const { error: error } = await supabase.from("families").insert(familyChildRecord);
            if (error) {
                console.error(error);
            }
        }
    };

    const submitForm = (): void => {
        let errorExists = false;
        let amendedErrorMessages = { ...errorMessages };
        for (const [errorKey, errorMessage] of Object.entries(errorMessages)) {
            if (errorMessage !== "") {
                errorExists = true;
            }
            if (errorMessage === "N/A") {
                amendedErrorMessages = {
                    ...amendedErrorMessages,
                    [errorKey]: "This is a required field.",
                };
            }
        }
        setErrorMessages({ ...amendedErrorMessages });
        if (errorExists) {
            alert("Please ensure all fields have been entered correctly.");
        } else {
            void createRecord();
        }
    };

    const childrenLoopArray: number[] = Array.from(
        { length: numberChildren },
        (value, index) => index
    );

    const errorColor = (errorMessage: string): boolean => {
        return errorMessage !== "" && errorMessage !== "N/A";
    };

    const errorText = (errorMessage: string): string => {
        return errorMessage == "N/A" ? "" : errorMessage;
    };

    return (
        <CenterComponent>
            <StyledForm>
                <Heading>Client Form</Heading>
                <Text>
                    Please provide or update the client&apos;s personal details, household
                    composition, dietary restrictions and other needs.
                </Text>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>
                            Client Full Name <Asterisk>*</Asterisk>
                        </Subheading>
                        <Text>First and last name</Text>
                        <FreeFormTextInput
                            error={errorColor(errorMessages.nameErrorMessage)}
                            helperText={errorText(errorMessages.nameErrorMessage)}
                            label="Name"
                            onChange={getRequiredFieldWithoutChecks(
                                "nameErrorMessage",
                                setFullName
                            )}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Phone Number</Subheading>
                        <Text>
                            UK mobile numbers should start with a 0 or a +44. International mobile
                            numbers should be entered with the country code.
                        </Text>
                        <FreeFormTextInput
                            error={!!errorMessages.phoneErrorMessage}
                            helperText={errorMessages.phoneErrorMessage}
                            label="E.g. 0xxx-xx-xxxx or +44 xxxx xxx xxxx"
                            onChange={getPhoneNumber}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>
                            Address Line 1 <Asterisk>*</Asterisk>{" "}
                        </Subheading>
                        <Text>Please enter the flat/house number if applicable.</Text>
                        <FreeFormTextInput
                            error={errorColor(errorMessages.addressErrorMessage)}
                            helperText={errorText(errorMessages.addressErrorMessage)}
                            label="Address Line 1"
                            onChange={getRequiredFieldWithoutChecks(
                                "addressErrorMessage",
                                setAddressLine1
                            )}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Address Line 2</Subheading>
                        <FreeFormTextInput
                            label="Address Line 2"
                            onChange={getFieldWithoutChecks(setAddressLine2)}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Town</Subheading>
                        <FreeFormTextInput
                            label="Town"
                            onChange={getFieldWithoutChecks(setAddressTown)}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>County</Subheading>
                        <FreeFormTextInput
                            label="County"
                            onChange={getFieldWithoutChecks(setAddressCounty)}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>
                            Postcode <Asterisk>*</Asterisk>
                        </Subheading>
                        <FreeFormTextInput
                            error={errorColor(errorMessages.postcodeErrorMessage)}
                            helperText={errorText(errorMessages.postcodeErrorMessage)}
                            label="E.g. SE11 5QY"
                            onChange={getAddressPostcode}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>
                            Number of Adults <Asterisk>*</Asterisk>
                        </Subheading>
                        <Text>Note that adults are aged 16 or above</Text>
                        <FreeFormTextInput
                            error={errorColor(errorMessages.numberAdultsErrorMessage)}
                            label="Female"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                getNumberAdults(event, "female")
                            }
                        />
                        <FreeFormTextInput
                            error={errorColor(errorMessages.numberAdultsErrorMessage)}
                            label="Male"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                getNumberAdults(event, "male")
                            }
                        />
                        <FreeFormTextInput
                            error={errorColor(errorMessages.numberAdultsErrorMessage)}
                            helperText={errorText(errorMessages.numberAdultsErrorMessage)}
                            label="Prefer Not To Say"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                getNumberAdults(event, "adult")
                            }
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>
                            Number of Children <Asterisk>*</Asterisk>
                        </Subheading>
                        <Text>Note that children are under 16 years old</Text>
                        <FreeFormTextInput
                            error={errorColor(errorMessages.numberChildrenErrorMessage)}
                            helperText={errorText(errorMessages.numberChildrenErrorMessage)}
                            label="Number of Children"
                            onChange={getNumberChildren}
                        />
                    </StyledCard>
                </CenterComponent>
                {childrenLoopArray.map((count) => {
                    return (
                        <CenterComponent key={count}>
                            <StyledCard>
                                <Subheading>Child {count + 1}</Subheading>
                                <CenterComponent>
                                    <DropdownListInput
                                        labelsAndValues={[
                                            ["Boy", "boy"],
                                            ["Girl", "girl"],
                                            ["Prefer Not To Say", "child"],
                                            ["Don't Know", "don't know"],
                                        ]}
                                        listTitle="Gender"
                                        defaultValue="don't know"
                                        onChange={(event: SelectChangeEvent) =>
                                            getGenderChildren(event, count)
                                        }
                                    />
                                </CenterComponent>
                                <CenterComponent>
                                    <DropdownListInput
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
                                            ["16", "16"],
                                            ["Don't Know", "Don't Know"],
                                        ]}
                                        listTitle="Age"
                                        defaultValue="Don't Know"
                                        onChange={(event: SelectChangeEvent) =>
                                            getAgeChildren(event, count)
                                        }
                                    />
                                </CenterComponent>
                            </StyledCard>
                        </CenterComponent>
                    );
                })}
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Dietary Requirements</Subheading>
                        <Text>Tick all that apply.</Text>
                        <CheckboxGroupInput
                            labelsAndKeys={[
                                ["Gluten Free", "Gluten Free"],
                                ["Dairy Free", "Dairy Free"],
                                ["Vegetarian", "Vegetarian"],
                                ["Vegan", "Vegan"],
                                ["Pescatarian", "Pescatarian"],
                                ["Halal", "Halal"],
                                ["Diabetic", "Diabetic"],
                                ["Nut Allergy", "Nut Allergy"],
                                ["Seafood Allergy", "Seafood Allergy"],
                                ["No Bread", "No Bread"],
                                ["No Pasta", "No Pasta"],
                                ["No Rice", "No Rice"],
                                ["No Pork", "No Pork"],
                                ["No Beef", "No Beef"],
                            ]}
                            onChange={getCheckboxGroupHandler(
                                dietaryRequirements,
                                setDietaryRequirements
                            )}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Feminine Products</Subheading>
                        <CheckboxGroupInput
                            labelsAndKeys={[
                                ["Tampons", "Tampons"],
                                ["Pads", "Pads"],
                                ["Incontinence Pads", "Incontinence Pads"],
                            ]}
                            onChange={getCheckboxGroupHandler(
                                feminineProducts,
                                setFeminineProducts
                            )}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>
                            Baby Products <Asterisk>*</Asterisk>
                        </Subheading>
                        <Text>Includes Baby Food, Wet Wipes, Nappies etc.</Text>
                        <RadioGroupInput
                            labelsAndValues={[
                                ["Yes", "Yes"],
                                ["No", "No"],
                                ["Don't Know", "don't know"],
                            ]}
                            defaultValue="don't know"
                            onChange={getBabyProducts}
                        />
                        {babyProducts ? (
                            <>
                                <br />
                                <FreeFormTextInput
                                    error={
                                        !!errorMessages.nappyErrorMessage &&
                                        errorMessages.nappyErrorMessage !== "N/A"
                                    }
                                    helperText={errorMessages.nappyErrorMessage}
                                    label="Nappy Size"
                                    onChange={getNappySize}
                                />
                            </>
                        ) : (
                            <></>
                        )}
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Pet Food</Subheading>
                        <Text>
                            Tick all that apply. Specify any other requests in the &quot;Extra
                            Information&quot; section.
                        </Text>
                        <CheckboxGroupInput
                            labelsAndKeys={[
                                ["Cat", "Cat"],
                                ["Dog", "Dog"],
                            ]}
                            onChange={getFieldWithoutChecks(setPetFood)}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Other Items</Subheading>
                        <CheckboxGroupInput
                            labelsAndKeys={[
                                ["Garlic", "Garlic"],
                                ["Ginger", "Ginger"],
                                ["Chilies", "Chilies"],
                                ["Spices", "Spices"],
                                ["Hot Water Bottles", "Hot Water Bottles"],
                                ["Blankets", "Blankets"],
                            ]}
                            onChange={getCheckboxGroupHandler(otherItems, setOtherItems)}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Delivery Instructions</Subheading>
                        <Text>
                            Is there anything we need to know when delivering a parcel to this
                            client? Does the doorbell work? Do we need to phone them? Is there a
                            door code? Do they live upstairs in a flat and cannot come downstairs?
                        </Text>
                        <FreeFormTextInput
                            label="Delivery Instructions"
                            onChange={getFieldWithoutChecks(setDeliveryInstruction)}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledCard>
                        <Subheading>Extra Information</Subheading>
                        <Text>
                            Is there anything else you need to tell us about the client? Comments
                            relating to food or anything else. Please add any delivery instructions
                            to the &quot;Delivery Instructions&quot; section above.
                        </Text>
                        <FreeFormTextInput
                            label="E.g. tea allergy"
                            onChange={getFieldWithoutChecks(setExtraInformation)}
                        />
                    </StyledCard>
                </CenterComponent>
                <CenterComponent>
                    <StyledButton type="submit" onClick={submitForm}>
                        Submit
                    </StyledButton>
                </CenterComponent>
            </StyledForm>
        </CenterComponent>
    );
};

export default RequestForm;
