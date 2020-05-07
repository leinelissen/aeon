import React, { useCallback, FC, ReactNode } from 'react';
import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types';
import styled, { css } from 'styled-components';
import theme from 'app/styles/theme';
import DataType from 'app/utilities/DataType';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faMinus } from '@fortawesome/pro-light-svg-icons';
import { EmptyIcon } from 'app/components/Utility';

export const Container = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: auto 1fr;
    height: 100%;
    background: white;
    position: relative;
`;

export const List = styled.div`
    display: flex;
    flex-direction: column;
    border-right: 1px solid ${theme.colors.border};
    flex-grow: 1;
    overflow-y: auto;
    position: relative;
`;

export const DataPointList = styled(List)`
    grid-column: 2 / 4;
`;

export const ListItem = styled.div`
    padding: 8px 32px;
    flex-grow: 0;
    flex-shrink: 0;
`;

export const RowHeading = styled(ListItem)`
    border-bottom: 1px solid ${theme.colors.border};
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.5);
    font-weight: 400;
    font-size: 12px;
    letter-spacing: 0.5px;
    position: sticky;
    top: 0;
    align-self: flex-start;
    background: white;
    z-index: 2;
    width: 100%;
`;

export const SubHeading = styled(RowHeading)`
    font-size: 10px;
    color: rgba(0, 0, 0, 0.4);
`;

interface ListButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    active?: boolean;
    disabled?: boolean;
    deleted?: boolean;
    modified?: boolean;
    added?: boolean;
}

export const StyledListButton = styled.button<ListButtonProps>`
    border: 0;
    background: transparent;
    display: flex;
    align-items: center;
    font-size: 14px;
    opacity: 0.7;
    margin: 0;
    padding: 14px 24px 14px 0;
    font-weight: 400;

    ${props => props.active ? css`
        background: #eee;
        opacity: 0.9;
    ` : css`
        &:hover {
            background-color: #f8f8f8;
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
`;

const IconWrapper = styled.div`
    margin: 0 8px;
`;

export const MarginLeft = styled.span`
    display: inline-block;
    margin-left: 16px;
`;

const ListButton: FC<ListButtonProps> = ({ children, ...props }) => {
    return (
        <StyledListButton {...props}>
            <>
                <IconWrapper>
                    {props.deleted ? 
                        <FontAwesomeIcon icon={faMinus} fixedWidth style={{ color: theme.colors.red }} />
                    : <EmptyIcon />}
                </IconWrapper>
                {children}
            </>
        </StyledListButton>
    )
}

const NumberOfItems = styled.span`
    margin-left: 4px;
    opacity: 0.25;
    font-weight: 300;
`;

interface ClickableCategoryProps extends Omit<ListButtonProps, 'onClick'> {
    type: ProvidedDataTypes;
    items?: number;
    onClick: (activity: ProvidedDataTypes) => void;
}

export const ClickableCategory = ({ type, onClick, items, ...props }: ClickableCategoryProps): JSX.Element => {
    const handleClick = useCallback(() => {
        return onClick(type);
    }, [onClick, type]);
    
    return (
        <ListButton onClick={handleClick} {...props}>
            <FontAwesomeIcon icon={DataType.getIcon(type)} fixedWidth style={{ marginRight: 8 }} />
            {type} <NumberOfItems>{items > 0 ? `(${items})` : null}</NumberOfItems>
            <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </ListButton>
    );
};

interface ClickableDataPointProps extends Omit<ListButtonProps, 'onClick'> {
    datum: ProviderDatum<unknown, unknown>;
    onClick: (datum: number) => void;
    index: number;
}

export const ClickableDataPoint = ({ datum, onClick, index, ...props }: ClickableDataPointProps): JSX.Element => {
    const handleClick = useCallback(() => {
        return onClick(index);
    }, [onClick, datum]);

    return (
        <ListButton onClick={handleClick} {...props}>
            <FontAwesomeIcon icon={DataType.getIcon(datum.type as ProvidedDataTypes)} fixedWidth style={{ marginRight: 8 }} />
            {DataType.toString(datum)}
            <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </ListButton>
    );
};