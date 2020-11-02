import React, { PropsWithChildren } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import theme from 'app/styles/theme';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { faChevronRight } from 'app/assets/fa-light';
import { PullRight } from './Utility';

export const ListItem = styled.div`
    padding: 8px 32px;
    flex-grow: 0;
    flex-shrink: 0;
`;

export const RowHeading = styled(ListItem)`
    border-bottom: 1px solid ${theme.colors.border};
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
    color: ${theme.colors.grey.dark};
    letter-spacing: 0.3px;
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
    border-right: 1px solid ${theme.colors.border};
    flex-grow: 1;
    overflow-y: auto;
    position: relative;

    ${props => props.topMargin && css`
        margin-top: 40px;
    `}
`;

const IconWrapper = styled.div`
    margin: 0 8px;
`;

type ListButtonProps = {
    active?: boolean;
    disabled?: boolean;
    deleted?: boolean;
    modified?: boolean;
    added?: boolean;
    large?: boolean;
};

export const NavigatableListEntryContainer = styled<React.FC<ListButtonProps>>(Link)`
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    font-size: 14px;
    margin: 0;
    padding: 14px 24px;
    font-weight: 400;
    color: ${theme.colors.black};

    img {
        max-height: 100px;
        width: auto;
        border-radius: 5px;
    }

    ${props => props.active ? css`
        background: ${theme.colors.grey.medium};
    ` : css`
        &:hover {
            background: ${theme.colors.grey.medium}BB;
            opacity: 0.8;
        }
    `}

    ${props => props.added && css`
        background-color: ${theme.colors.green}${props.active ? 33 : 22};;
    `}

    ${props => props.deleted && css`
        background-color: ${theme.colors.red}${props.active ? 33 : 22};;
    `}

    ${props => props.modified && css`
        background-color: ${theme.colors.yellow}${props.active ? 33 : 22};
    `}

    ${props => props.large && css`
        font-size: 16px;
    `}

    &:disabled {
        opacity: 0.25;
    }
`;

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