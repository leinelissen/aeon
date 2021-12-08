import React, { PropsWithChildren } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { faChevronRight } from 'app/assets/fa-light';
import { PullRight } from './Utility';

export const ListItem = styled.div`
    padding: 8px 32px;
    flex-grow: 0;
    flex-shrink: 0;
`;

export const RowHeading = styled(ListItem)`
    border-bottom: 1px solid var(--color-border);
    font-weight: 400;
    position: sticky;
    top: 0;
    align-self: flex-start;
    z-index: 2;
    font-size: 14px;
    width: 100%;
`;

export const SubHeading = styled(RowHeading)`
    font-size: 10px;
    font-family: 'IBM Plex Mono';
    text-transform: uppercase;
    letter-spacing: 0.3px;
    background-color: var(--color-background);
    color: var(--color-gray-700);
`;

export const PanelGrid = styled.div<{ columns?: number; noTopPadding?: boolean; }>`
    display: grid;
    grid-auto-columns: auto;
    grid-template-columns: repeat(${props => props.columns || 3}, 1fr);
    padding-top: ${props => props.noTopPadding ? 0 : 40}px;
    height: 100%;
    position: relative;
    overflow: hidden;
`;

export const List = styled.div<{ topMargin?: boolean }>`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    position: relative;
    border-right: 1px solid var(--color-border);

    ${props => props.topMargin && css`
        margin-top: 0px;
    `}
`;

export const SplitPanel = styled.div`
    display: flex;
    flex-direction: column;
`

export const PanelBottomButtons = styled.div`
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
`;

const IconWrapper = styled.div`
    margin: 0 8px;
`;

type ListButtonProps = {
    deleted?: boolean;
    modified?: boolean;
    added?: boolean;
    large?: boolean;
};

export const NavigatableListEntryContainer = styled<React.FC<ListButtonProps>>(NavLink).withConfig({
    shouldForwardProp: (prop) => !['deleted', 'modified', 'added', 'large'].includes(prop)
})`
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    font-size: 14px;
    margin: 1px 8px;
    padding: 8px 8px;
    font-weight: 400;
    border-radius: 8px;

    img {
        max-height: 100px;
        width: auto;
        border-radius: 5px;
    }

    &.active {
        background: var(--color-blue-500);
        color: var(--color-white);
    }

    &:hover:not(.active) {
        background: var(--color-gray-500);
        opacity: 0.8;
    }

    ${props => props.added && css`
        background-color: var(--color-green-500)22;

        &.active {
            background-color: var(--color-green-500)33;
        }
    `}

    ${props => props.deleted && css`
        background-color: var(--color-red-500)22;

        &.active {
            background-color: var(--color-red-500)33;
        }
    `}

    ${props => props.modified && css`
        background-color: var(--color-yellow-500)22;

        &.active {
            background-color: var(--color-yellow-500)33;
        }
    `}

    ${props => props.large && css`
        font-size: 16px;
    `}

    &:disabled {
        opacity: 0.25;
    }

    ${PullRight} {
        padding-left: 0.5em;
    }
`;

const CategoryContainer = styled.div`
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border);

    &:last-of-type {
        border-bottom: none;
    }
`;

export function Category({ title, children }: PropsWithChildren<{ title: string }>) {
    return (
        <>
            <SubHeading>{title}</SubHeading>
            {children && (
                <CategoryContainer>
                    {children}
                </CategoryContainer>
            )}
        </>
    );
}

type NavigatableListEntryProps = PropsWithChildren<{
    to: string,
    icon?: IconProp,
} & ListButtonProps>;

export function NavigatableListEntry({ 
    icon,
    children,
    ...props
}: NavigatableListEntryProps): JSX.Element {
    return (
        <NavigatableListEntryContainer {...props}>
            {icon ? 
                <IconWrapper>
                    <FontAwesomeIcon fixedWidth icon={icon} />
                </IconWrapper>
                : null}
            {children}
            <PullRight>
                <FontAwesomeIcon fixedWidth icon={faChevronRight} />
            </PullRight>
        </NavigatableListEntryContainer>
    )
}