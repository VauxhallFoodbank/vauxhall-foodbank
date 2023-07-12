"use client";

import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Modal from "react-modal";

interface DataViewerProps {
    data: { [key: string]: string | null };
    title: string;
    isOpen: boolean;
    onRequestClose: (event: MouseEvent<Element, MouseEvent> | KeyboardEvent<Element>) => void;
}

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    background-color: pink;
    padding: 0;
    gap: 2px;
`;

const EachItem = styled.div`
    display: flex;
    flex-direction: column;
    background-color: red;
    padding-bottom: 5px;
    gap: 2px;
`;

const ContentWrapper = styled.div`
    overflow: scroll;
    overflow-x: hidden;
    height: 90%;
    margin: 20px;
`;

const ModalWrapper = styled.div`
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-bottom: 30px;
`;

const Key = styled.div`
    color: grey;
    font-size: small;
`;

const Value = styled.div`
    font-size: medium;
`;

const DataViewer: React.FC<DataViewerProps> = (props) => {
    const [localIsOpen, setLocalIsOpen] = useState(false);
    useEffect(() => {
        setLocalIsOpen(props.isOpen);
        console.log("useEffectLocal");
    }, [props.isOpen]);

    const ClearButton: React.FC = () => {
        return <button onClick={closeModel}>X</button>;
    };

    const JSONContent = Object.entries(props.data).map(([key, value]) => {
        return (
            <EachItem key={key}>
                <div>{key.toUpperCase().replace("_", " ")}</div>
                <div>{value ?? "None"}</div>
            </EachItem>
        );
    });

    const closeModel: (event: MouseEvent<Element, MouseEvent> | KeyboardEvent<Element>) => void = (
        e
    ) => {
        props.onRequestClose(e);
        setLocalIsOpen(props.isOpen);
    };

    // const M = styled(Modal)`
    //     background-color: red;
    // `;

    console.log("Props.isOpen", props.isOpen);
    console.log("localisOpen", localIsOpen);

    return (
        <Modal
            isOpen={localIsOpen}
            onRequestClose={closeModel}
            ariaHideApp={false}
            contentLabel="JSON Modal"
        >
            <Header>
                {props.title}
                <ClearButton />
            </Header>
            <div>{JSONContent}</div>
        </Modal>
    );
};

export default DataViewer;
