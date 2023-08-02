"use client";

import React from "react";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styled from "styled-components";

interface Props {
    icon: IconDefinition;
    color?: string;
    onHoverText?: string;
    popper?: boolean;
}

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
    width: 1em;
    height: 1em;
    margin: 0.125em;
    color: ${(props) => props.color ?? props.theme.primaryForegroundColor};
`;

const Popper = styled.div`
    position: absolute;
    background-color: ${(props) => props.theme.surfaceBackgroundColor};
    color: ${(props) => props.theme.primaryForegroundColor};
    padding: 0.5em;
    border-radius: 0.25em;
    z-index: 10;
    font-size: 0.8em;
    border: solid 1px ${(props) => props.theme.primaryBackgroundColor};
    transform: translateY(2em);
`;

const Icon: React.FC<Props> = (props) => {
    const [hovered, setHovered] = React.useState(false);

    const show = (): void => {
        setHovered(true);
    };

    const hide = (): void => {
        setHovered(false);
    };

    const onTap = (): void => {
        setHovered(true);
        setTimeout(() => {
            setHovered(false);
        }, 4000);
    };

    return (
        <>
            {props.onHoverText && hovered && props.popper ? (
                <Popper
                    onMouseEnter={show}
                    onMouseLeave={hide}
                    onMouseDown={show}
                    onMouseUp={hide}
                    onTouchStart={onTap}
                >
                    {props.onHoverText}
                </Popper>
            ) : (
                <></>
            )}
            <StyledFontAwesomeIcon
                icon={props.icon}
                color={props.color}
                aria-label={props.onHoverText}
                onMouseEnter={show}
                onMouseLeave={hide}
                onMouseDown={show}
                onMouseUp={hide}
                onTouchStart={show}
                onTouchEnd={hide}
                title={props.popper ? undefined : props.onHoverText}
            />
        </>
    );
};

export default Icon;
