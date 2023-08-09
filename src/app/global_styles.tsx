import React from "react";
import { createGlobalStyle, DefaultTheme, useTheme } from "styled-components";
import {
    ThemeProvider as MaterialThemeProvider,
    createTheme as createMaterialTheme,
    Theme,
} from "@mui/material";

const GlobalStyle = createGlobalStyle`    
    * {
        box-sizing: border-box;
        margin: 0;
    }
      
    html, body {
        height: 100%;
        width: 100%;
        font-family: Helvetica, Arial, sans-serif;
        overflow: auto;
    }

    body {
        color: ${(props) => props.theme.main.foreground[2]};
        background-color: ${(props) => props.theme.main.background[2]};
    }

    :root {
      color-scheme: ${(props) => (props.theme.light ? "light" : "dark")}
    }
`;

const materialTheme = (chosenTheme: DefaultTheme): Theme =>
    createMaterialTheme({
        palette: {
            mode: chosenTheme.light ? "light" : "dark",
            primary: {
                main: chosenTheme.primary.background[2],
                contrastText: chosenTheme.primary.foreground[2],
            },
            secondary: {
                main: chosenTheme.main.foreground[2],
                contrastText: chosenTheme.main.foreground[2],
            },
            error: {
                main: chosenTheme.error,
            },
            background: {
                default: chosenTheme.main.background[2],
                paper: chosenTheme.main.background[3],
            },
            text: {
                primary: chosenTheme.main.foreground[1],
            },
        },
        typography: {
            fontFamily: "Helvetica, Arial, sans-serif",
        },
        components: {
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: chosenTheme.main.background[3],
                        color: chosenTheme.main.foreground[3],
                        backgroundImage: "none",
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        transition: "none",
                        textTransform: "none",
                        "&.MuiButton-containedPrimary:hover": {
                            backgroundColor: chosenTheme.primary.background[2],
                            opacity: "80%",
                        },
                    },
                },
            },
            MuiInputLabel: {
                styleOverrides: {
                    root: { transition: "none" },
                },
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        fontSize: "1rem",
                        padding: "0.5rem",
                    },
                },
            },
        },
    });
interface Props {
    children: React.ReactNode;
}
const MaterialAndGlobalStyle: React.FC<Props> = ({ children }) => {
    const chosenTheme = useTheme();

    return (
        <MaterialThemeProvider theme={materialTheme(chosenTheme)}>
            <GlobalStyle />
            {children}
        </MaterialThemeProvider>
    );
};

export default MaterialAndGlobalStyle;