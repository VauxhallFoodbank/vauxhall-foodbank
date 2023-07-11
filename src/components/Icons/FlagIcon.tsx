"use client";

import React from "react";
import Icon from "@/components/Icons/Icon";
import { faFlag } from "@fortawesome/free-solid-svg-icons";

const FlagIcon: React.FC<{}> = () => {
    return <Icon icon={faFlag} onHoverText={"Flagged for attention"} color={"orange"} />;
};

export default FlagIcon;
