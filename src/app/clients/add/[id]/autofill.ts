import { Schema } from "@/database_utils";
import { ClientFields } from "@/app/clients/add/ClientForm";
import { Person } from "@/components/Form/formFunctions";
import { booleanGroup } from "@/components/DataInput/inputHandlerFactories";

interface NappySizeAndExtraInformation {
    nappySize: string;
    extraInformation: string;
}

const processExtraInformation = (original: string): NappySizeAndExtraInformation => {
    if (original.startsWith("Nappy Size: ")) {
        const [nappySize, extraInformation] = original.split(", Extra Information: ");
        return { nappySize: `(${nappySize})`, extraInformation: extraInformation };
    }
    return { nappySize: "", extraInformation: original };
};

const getNumberAdultsByGender = (family: Schema["families"][], gender: string): number => {
    return family.filter((member) => member.gender === gender).length;
};

const revertBooleanGroup = (data: string[]): booleanGroup => {
    const reverted: booleanGroup = {};
    data.forEach((value) => (reverted[value] = true));
    return reverted;
};

const autofill = (
    clientData: Schema["clients"],
    familyData: Schema["families"][]
): ClientFields => {
    const children = familyData
        .filter((member) => member.age !== null)
        .map((child): Person => {
            return {
                gender: child.gender,
                age: child.age,
                quantity: 1,
                primaryKey: child.primary_key,
            };
        });

    const { nappySize, extraInformation } = processExtraInformation(clientData.extra_information);

    return {
        fullName: clientData.full_name,
        phoneNumber: clientData.phone_number,
        addressLine1: clientData.address_1,
        addressLine2: clientData.address_2,
        addressTown: clientData.address_town,
        addressCounty: clientData.address_county,
        addressPostcode: clientData.address_postcode,
        adults: [
            { gender: "other", quantity: getNumberAdultsByGender(familyData, "other") },
            { gender: "male", quantity: getNumberAdultsByGender(familyData, "male") },
            { gender: "female", quantity: getNumberAdultsByGender(familyData, "female") },
        ],
        numberChildren: children.length,
        children: children,
        dietaryRequirements: revertBooleanGroup(clientData.dietary_requirements),
        feminineProducts: revertBooleanGroup(clientData.feminine_products),
        babyProducts: clientData.baby_food,
        nappySize: nappySize.replace("Nappy Size: ", ""),
        petFood: revertBooleanGroup(clientData.pet_food),
        otherItems: revertBooleanGroup(clientData.other_items),
        deliveryInstructions: clientData.delivery_instructions,
        extraInformation: extraInformation,
        attentionFlag: clientData.flagged_for_attention,
        signpostingCall: clientData.signposting_call_required,
    };
};

export default autofill;
