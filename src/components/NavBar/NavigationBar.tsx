"use client";

import React from "react";
import AppBar from "@mui/material/AppBar";
import MenuIcon from "@mui/icons-material/Menu";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Link from "next/link";
import styled from "styled-components";
import Button from "@mui/material/Button";
import LightDarkSlider from "@/components/NavBar/LightDarkSlider";
import SignOutButton from "@/components/NavBar/SignOutButton";
import LinkButton from "@/components/Buttons/LinkButton";

const NavBarHeight = "4rem";

export const PageButton = styled(Button)`
    color: white;
    font-size: 1.25rem;
    margin: 10px;
    &:hover {
        background-color: ${(props) => props.theme.primaryBackgroundColor};
    },
`;

const StyledSwipeableDrawer = styled(SwipeableDrawer)`
    & .MuiPaper-root {
        background-image: none;
    },

`;

const UnstyledLink = styled(Link)`
    text-decoration: none;
    display: contents;
`;

const Logo = styled.img`
    max-width: 100%;
    max-height: 100%;
`;

const AppBarInner = styled.div`
    display: flex;
    height: ${NavBarHeight};
    padding: 0.5rem;
`;

const DrawerInner = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: stretch;
    padding: 1rem;
    width: 15rem;
`;

const Gap = styled.div`
    width: 1rem;
`;

const DrawerButtonWrapper = styled.div`
    padding: 0.7rem;
    border-bottom: 1px solid ${(props) => props.theme.main.foreground[3]};

    &:last-child {
        border-bottom: none;
    }
`;

const DrawerButton = styled(Button)`
    width: 100%;
`;

const StickyAppBar = styled(AppBar)`
    position: sticky;
`;

const NavElementContainer = styled.div`
    display: flex;
    flex-basis: 0;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
    margin: 0 1em;
`;

const MobileNavMenuContainer = styled(NavElementContainer)`
    justify-content: start;
    @media (min-width: 800px) {
        display: none;
    }
`;

const LogoElementContainer = styled(NavElementContainer)`
    justify-content: center;
    height: 100%;
    object-fit: cover;
    @media (min-width: 800px) {
        justify-content: start;
    }
`;

const DesktopButtonContainer = styled(NavElementContainer)`
    display: none;
    @media (min-width: 800px) {
        display: flex;
    }
`;

const SignOutButtonContainer = styled(NavElementContainer)`
    justify-content: end;
`;

const ContentDiv = styled.div`
    height: calc(100% - ${NavBarHeight});
    width: 100%;
    position: absolute;
    top: ${NavBarHeight};
    overflow: auto;
`;

interface Props {
    children?: React.ReactElement;
}

const ResponsiveAppBar: React.FC<Props> = ({ children = <></> }) => {
    const [drawer, setDrawer] = React.useState(false);

    const openDrawer = (): void => {
        setDrawer(true);
    };

    const closeDrawer = (): void => {
        setDrawer(false);
    };

    const pages = [
        ["CLIENTS", "/clients"],
        ["LISTS", "/lists"],
        ["CALENDAR", "/calendar"],
    ];

    return (
        <>
            <StyledSwipeableDrawer open={drawer} onClose={closeDrawer} onOpen={openDrawer}>
                <DrawerInner>
                    {pages.map(([page, link]) => (
                        <DrawerButtonWrapper key={page}>
                            <UnstyledLink href={link} onClick={closeDrawer} prefetch={false}>
                                <DrawerButton color="secondary" variant="text">
                                    {page}
                                </DrawerButton>
                            </UnstyledLink>
                        </DrawerButtonWrapper>
                    ))}
                </DrawerInner>
            </StyledSwipeableDrawer>
            <StickyAppBar>
                <AppBarInner>
                    <MobileNavMenuContainer>
                        <Button
                            color="secondary"
                            aria-label="Mobile Menu Button"
                            onClick={openDrawer}
                        >
                            <MenuIcon />
                        </Button>
                    </MobileNavMenuContainer>
                    <LogoElementContainer>
                        <UnstyledLink href="/" prefetch={false}>
                            <Logo alt="Vauxhall Foodbank Logo" src="/logo.webp" />
                        </UnstyledLink>
                    </LogoElementContainer>
                    <DesktopButtonContainer>
                        {pages.map(([page, link]) => (
                            <React.Fragment key={page}>
                                <LinkButton link={link} page={page} />
                                <Gap />
                            </React.Fragment>
                        ))}
                    </DesktopButtonContainer>
                    <SignOutButtonContainer>
                        <LightDarkSlider />
                        <Gap />
                        <SignOutButton />
                    </SignOutButtonContainer>
                </AppBarInner>
            </StickyAppBar>
            <ContentDiv>{children}</ContentDiv>
        </>
    );
};
export default ResponsiveAppBar;
