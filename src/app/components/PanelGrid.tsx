import React, { PropsWithChildren } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { NavLink, NavLinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { PullRight } from './Utility';
import { Section } from './RightSideOverlay';

export const ListItem = styled.div`
    padding: 8px 32px;
    flex-grow: 0;
    flex-shrink: 0;
`;

export const RowHeading = styled(ListItem)`
    font-weight: 400;
    position: sticky;
    top: 0;
    align-self: flex-start;
    z-index: 2;
    font-size: 14px;
    width: 100%;
    border-bottom: 1px solid var(--color-border);
    padding: 16px 32px;
    font-family: var(--font-heading);
    font-weight: 600;
`;

export const RowDescription = styled(RowHeading)`
    font-weight: 400;
    font-size: 11px;
    margin-bottom: 8px;
`;

export const SubHeading = styled(RowHeading)`
    font-size: 10px;
    font-family: 'IBM Plex Mono';
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background-color: var(--color-background);
    color: var(--color-gray-700);
    border: 0;
    padding: 16px 32px 8px 16px;
`;

export const PanelGrid = styled.div<{ columns?: number; noTopPadding?: boolean; }>`
    display: grid;
    grid-auto-columns: auto;
    grid-template-columns: repeat(${(props) => props.columns || 3}, 1fr);
    padding-top: ${(props) => props.noTopPadding ? 0 : 50}px;
    height: 100%;
    position: relative;
    overflow: hidden;

    ${(props) => (!props.columns || props.columns === 3) && css`
        & ${Section} {
            margin: 24px;
        }
    `}
`;

export const List = styled.div<{ topMargin?: boolean }>`
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow-y: auto;
    position: relative;
    border-right: 1px solid var(--color-border);

    ${(props) => props.topMargin && css`
        margin-top: 0px;
    `}
`;

export const SplitPanel = styled.div`
    display: flex;
    flex-direction: column;
`;

export const PanelBottomButtons = styled.div`
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid var(--color-border);
    border-right: 1px solid var(--color-border);
`;

const IconWrapper = styled.div`
    margin-right: 8px;
    font-size: 1.25em;
`;

const ChevronWrapper = styled(PullRight)`
    opacity: 0.25;
    font-size: 0.7em;
`;

type ListButtonProps = {
    deleted?: boolean;
    modified?: boolean;
    added?: boolean;
    large?: boolean;
} & NavLinkProps & React.RefAttributes<HTMLAnchorElement>;

export const NavigatableListEntryContainer = styled<React.ForwardRefExoticComponent<ListButtonProps>>(NavLink).withConfig({
    shouldForwardProp: (prop) => typeof prop === 'string' && !['deleted', 'modified', 'added', 'large'].includes(prop),
})`
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    font-size: 14px;
    margin: 1px 8px;
    padding: 8px 12px;
    font-weight: 400;
    border-radius: 8px;
    overflow: hidden;
    white-space: nowrap; 
    color: var(--color-heading);
    font-family: var(--font-heading);

    img {
        max-height: 100px;
        width: auto;
        border-radius: 5px;
    }

    svg {
        flex: 0 0 auto;
        color: var(--color-gray-700);
    }

    &.active {
        background: var(--color-blue-500);
        color: var(--color-white);

        svg {
            flex: 0 0 auto;
            color: var(--color-white);
        }
    }

    &:hover:not(.active) {
        background: var(--color-blue-50);
    }

    &:active {
        background: var(--color-blue-100);
    }

    ${(props) => props.added && css`
        background-color: var(--color-green-100);

        &.active {
            background-color: var(--color-green-500);
        }
    `}

    ${(props) => props.deleted && css`
        background-color: var(--color-red-100);

        &.active {
            background-color: var(--color-red-500);
        }
    `}

    ${(props) => props.modified && css`
        background-color: var(--color-yellow-100);

        &.active {
            background-color: var(--color-yellow-500);
        }
    `}

    ${(props) => props.large && css`
        font-size: 16px;
        font-weight: 500;
    `}

    &:disabled {
        opacity: 0.25;
    }

    ${PullRight} {
        padding-left: 0.5em;
    }
`;

const CategoryContainer = styled.div`
    margin-bottom: 16px;
`;

export function Category({ title, children, id }: PropsWithChildren<{ title?: string, id?: string }>) {
    return (
        <>
            {title && <SubHeading>{title}</SubHeading>}
            {children && (
                <CategoryContainer id={id}>
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
            <ChevronWrapper>
                <FontAwesomeIcon fixedWidth icon={faChevronRight} />
            </ChevronWrapper>
        </NavigatableListEntryContainer>
    );
}