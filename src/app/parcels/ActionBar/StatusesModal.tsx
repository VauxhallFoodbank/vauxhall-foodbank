import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Button from "@mui/material/Button/Button";
import Modal from "@/components/Modal/Modal";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { ParcelsTableRow } from "@/app/parcels/getParcelsTableData";

interface StatusesBarModalProps extends React.ComponentProps<typeof Modal> {
    data: ParcelsTableRow[];
    onSubmit: (date: Dayjs) => void;
    errorText: string | null;
}

const Row = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

const ModalInner = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
`;

const StatusText = styled.p`
    margin-left: 1rem;
    border-top: 1px solid ${(props) => props.theme.main.lighterForeground[2]};
    padding: 1rem 0;
    &:last-child {
        border-bottom: 1px solid ${(props) => props.theme.main.lighterForeground[2]};
    }
`;

const StatusesBarModal: React.FC<StatusesBarModalProps> = (props) => {
    const [date, setDate] = useState(dayjs(new Date()));

    useEffect(() => {
        setDate(dayjs(new Date()));
    }, [props.isOpen]);

    const onDateChange = (newDate: Dayjs | null): void =>
        setDate((date) =>
            date
                .set("year", newDate?.year() ?? date.year())
                .set("month", newDate?.month() ?? date.month())
                .set("day", newDate?.day() ?? date.day())
        );

    const onTimeChange = (newDate: Dayjs | null): void =>
        setDate((date) =>
            date
                .set("hour", newDate?.hour() ?? date.hour())
                .set("minute", newDate?.minute() ?? date.minute())
        );

    return (
        <Modal {...props}>
            <ModalInner>
                <Row>
                    Date:
                    <DatePicker
                        value={date}
                        defaultValue={date}
                        onChange={onDateChange}
                        disableFuture
                    />
                </Row>
                <Row>
                    Time:
                    <TimePicker value={date} onChange={onTimeChange} disableFuture />
                </Row>
                Applying To:
                {props.data.map((parcel, index) => {
                    return (
                        <StatusText key={index}>
                            {parcel.addressPostcode}
                            {parcel.fullName && ` - ${parcel.fullName}`}
                            {parcel.collectionDatetime &&
                                `\n @ ${dayjs(parcel.collectionDatetime!).format(
                                    "DD/MM/YYYY HH:mm"
                                )}`}
                        </StatusText>
                    );
                })}
                {props.errorText && <small>{props.errorText}</small>}
                <Button type="button" variant="contained" onClick={() => props.onSubmit(date)}>
                    Submit
                </Button>
            </ModalInner>
        </Modal>
    );
};

export default StatusesBarModal;
