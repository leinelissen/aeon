import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { FlexRow } from "./Utility";

export const TabContainer = styled.div`
    border-bottom: 1px solid var(--color-border);
    padding: 0 1em;
`;

const ActiveIndicator = styled.div`
    height: 4px;
    width: 100%;
    background-color: transparent;
    border-radius: 1em 1em 0 0;
`;

const TabItemContainer = styled(NavLink)`
    display: inline-flex;
    margin: 0 1.25em;
    text-transform: capitalize;
    align-items: center;
    font-family: var(--font-heading);
    flex-direction: column;
    color: var(--color-gray-700);

    ${FlexRow} {
        padding: 1em 0;
    }

    svg {
        margin-right: 0.75em;
    }

    &.active {
        color: var(--color-primary);
        font-weight: 600;

        ${ActiveIndicator} {
            background-color: var(--color-primary);
        }
    }

    &:not(.active):hover {
        color: var(--color-gray-800);

        ${ActiveIndicator} {
            background-color: var(--color-gray-200);
        }
    }
`;


type TabItemProps = PropsWithChildren<{
    to: string;
    icon?: IconDefinition;
}>;

export function TabItem({ children, icon, to }: TabItemProps) {
    return (
        <TabItemContainer to={to} className={({ isActive }) => isActive ? 'active' : ''}>
            <FlexRow>
                {icon && (<FontAwesomeIcon icon={icon} />)}
                {children}
            </FlexRow>
            <ActiveIndicator />
        </TabItemContainer>
    );
}