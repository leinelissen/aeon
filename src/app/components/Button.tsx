import React, { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Ball } from './Loading';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';

type ThemeColor = 'blue' | 'red' | 'yellow' | 'green' | 'gray';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    backgroundColor?: ThemeColor;
    fullWidth?: boolean;
    color?: string;
}

const StyledButtonStyles = css<ButtonProps>`
    background-color: var(--color-${props => props.backgroundColor || 'blue'}-500);
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color || 'var(--color-white)'};
    height: 40px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none !important;
    font-family: var(--font-heading);
    border-radius: 10px;
    outline: 0 !important;
    margin: 5px 0;
    border: 0;
    padding: 0 16px;
    text-transform: capitalize;
    border: 1px solid var(--color-${props => props.backgroundColor || 'blue'}-600);
    text-overflow: ellipsis;
    overflow-wrap: break-word;

    &:hover&:not(:disabled) {
        cursor: default;
        opacity: 0.9;
        box-shadow: 0 1px 2px rgba(0,0,0,0.09), 
                0 2px 4px rgba(0,0,0,0.09), 
                0 4px 8px rgba(0,0,0,0.09), 
    }

    &:disabled {
        background-color: var(--color-gray-300);
        cursor: not-allowed;
        opacity: 0.5;
        color: var(--color-gray-600);
        border-color: var(--color-gray-400);
    }

    ${props => props.fullWidth && css`
        width: 100%;
    `}
`;

const StyledButton = styled.button<ButtonProps>`
    ${StyledButtonStyles}
`;

const Margin = styled.div`
    width: 10px;
`;

export const LinkButton = styled(Link)`
    ${StyledButtonStyles};
`;

export const SimpleButton = styled.button`
    border: 0;
    margin: 0;
    padding: 0;
    background-color: inherit;
    color: inherit;
`;

export const StyledGhostButton = styled(StyledButton)`
    color: ${props => props.backgroundColor && props.backgroundColor !== 'blue' 
        ? `var(--color-${props.backgroundColor}-500)`
        : 'var(--color-header)'};
    font-size: 14px;
    padding: 8px 16px;
    background-color: ${() => 'transparent'};
    border: 0;
    font-weight: 500;

    &:hover&:not(:disabled) {
        background-color: var(--color-${props => props.backgroundColor || 'blue'}-100);
    }

    &:active {
        background-color: var(--color-${props => props.backgroundColor || 'blue'}-200);
    }
`;


interface Props extends ButtonProps {
    loading?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    disabled?: boolean;
    icon?: IconProp;
    style?: CSSProperties;
}

const Button = ({ children, loading, onClick, disabled, icon, ...props }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <StyledButton onClick={onClick} disabled={loading || disabled} {...props}>
            {icon && !loading ? <FontAwesomeIcon icon={icon} style={{ marginRight: 5 }} fixedWidth /> : null}
            {children}
            {loading ? (<><Margin /><Ball size={10} /></>) : null}
        </StyledButton>
    )
}

export const GhostButton = ({ children, loading, onClick, disabled, icon, ...props }: PropsWithChildren<Props>): JSX.Element => {
    return (
        <StyledGhostButton onClick={onClick} disabled={loading || disabled} {...props}>
            {icon && !loading ? <FontAwesomeIcon icon={icon} style={{ marginRight: 5 }} fixedWidth /> : null}
            {children}
            {loading ? (<><Margin /><Ball size={10} /></>) : null}
        </StyledGhostButton>
    )
}

export default Button;