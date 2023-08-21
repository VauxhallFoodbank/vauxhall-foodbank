"use client";
import React from "react";
import {
    ErrorCenterer,
    ErrorPanel,
    ErrorLargeText,
    ErrorSecondaryText,
} from "@/app/errorPageStyling";
import LinkButton from "@/components/Buttons/LinkButton";

const Error: React.FC<{}> = () => {
    return (
        <ErrorCenterer>
            <ErrorPanel elevation={5}>
                <ErrorLargeText>OOPS!</ErrorLargeText>
                <ErrorSecondaryText>
                    There has been an error. Please try again or contact a developer if the problem
                    persists.
                </ErrorSecondaryText>
                <LinkButton link="/clients">Return to Home</LinkButton>
            </ErrorPanel>
        </ErrorCenterer>
    );
};

export default Error;
