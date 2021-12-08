import React, { CSSProperties, HTMLAttributes, PropsWithChildren } from 'react';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Ball } from './Loading';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { Link } from 'react-router-dom';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
    backgroundColor?: string;
    fullWidth?: boolean;
    color?: string;
}

const StyledButtonStyles = css<ButtonProps>`
    background-color: ${props => props.backgroundColor || 'var(--color-primary)'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color || 'var(--color-white)'};
    height: 45px;
    font-size: 14px;
    font-weight: 400;
    text-decoration: none !important;
    border-radius: 5px;
    outline: 0 !important;
    margin: 5px 0;
    border: 0;
    padding: 0 16px;
    text-transform: capitalize;

    &:hover&:not(:disabled) {
        cursor: pointer;
        opacity: 0.9;
        box-shadow: 0 1px 2px rgba(0,0,0,0.09), 
                0 2px 4px rgba(0,0,0,0.09), 
                0 4px 8px rgba(0,0,0,0.09), 
    }

    &:disabled {
        background-color: #eee;
        cursor: not-allowed;
        opacity: 0.5;
        color: var(--color-gray-600);
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

export const GhostButton = styled(SimpleButton)`
    color: inherit;
    opacity: 0.3;
    font-size: 14px;
    padding: 8px 16px;
    background-color: transparant;

    &:hover {
        opacity: 0.5;
    }

    &:active {
        opacity: 0.7;
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

export default Button;