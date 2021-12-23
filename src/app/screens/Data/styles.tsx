import React, { HTMLAttributes } from 'react';
import { ProvidedDataTypes, ProviderDatum } from "main/providers/types/Data";
import styled, { css } from 'styled-components';
import DataType from 'app/utilities/DataType';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Ellipsis } from 'app/components/Utility';
import { NavigatableListEntry } from 'app/components/PanelGrid';

interface ListButtonProps extends HTMLAttributes<HTMLAnchorElement> {
    disabled?: boolean;
    deleted?: boolean;
    modified?: boolean;
    added?: boolean;
}

export const StyledListButton = styled(NavigatableListEntry)<ListButtonProps>`
    img {
        max-height: 100px;
        width: auto;
        border-radius: 5px;
    }

    ${props => props.added && css`
    background-color: var(--color-green-100);

        &:hover:not(.active) {
            background-color: var(--color-green-200) !important;
        }

        &.active {
            background-color: var(--color-green-500);
        }
    `}

    ${props => props.deleted && css`
        background-color: var(--color-red-100);

        &:hover:not(.active) {
            background-color: var(--color-red-200) !important;
        }

        &.active {
            background-color: var(--color-red-500);
        }
    `}

    ${props => props.modified && css`
        background-color: var(--color-yellow-100);

        &:hover:not(.active) {
            background-color: var(--color-yellow-200) !important;
        }

        &.active {
            background-color: var(--color-yellow-500);
        }
    `}

    &:disabled {
        opacity: 0.25;
    }
`;


const NumberOfItems = styled.span`
    margin-left: 4px;
    opacity: 0.25;
    font-weight: 300;
`;

interface ClickableCategoryProps extends Omit<ListButtonProps, 'onClick'> {
    type: ProvidedDataTypes;
    items?: number;
}

export const ClickableCategory = ({ type, items, ...props }: ClickableCategoryProps): JSX.Element => {
    return (
        <StyledListButton to={`/data/${type}`} {...props}>
            <FontAwesomeIcon icon={DataType.getIcon(type)} fixedWidth style={{ marginRight: 8 }} />
            {type} <NumberOfItems>{items > 0 ? `(${items})` : null}</NumberOfItems>
        </StyledListButton>
    );
};

interface ClickableDataPointProps extends Omit<ListButtonProps, 'onClick'> {
    datum: ProviderDatum<unknown, unknown>;
    index: number;
    type: ProvidedDataTypes;
}

export const ClickableDataPoint = ({ datum, type, index, ...props }: ClickableDataPointProps): JSX.Element => {
    return (
        <StyledListButton to={`/data/${type}/${index}`} {...props}>
            <FontAwesomeIcon icon={DataType.getIcon(datum.type as ProvidedDataTypes)} fixedWidth style={{ marginRight: 8 }} />
            <Ellipsis>{DataType.toString(datum)}</Ellipsis>
        </StyledListButton>
    );
};