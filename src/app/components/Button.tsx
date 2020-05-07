import React, { CSSProperties } from 'react';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import theme from 'app/styles/theme';
import { Ball } from './Loading';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
    backgroundColor?: string;
    fullWidth?: boolean;
    color?: string;
}

const StyledButton = styled.button<ButtonProps>`
    background-color: ${props => props.backgroundColor || theme.colors.blue.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.color || theme.colors.white};
    height: 45px;
    font-size: 14px;
    font-weight: 400;
    text-decoration: none !important;
    flex: 0 0 auto;
    border-radius: 5px;
    outline: 0 !important;
    margin: 5px 0;
    border: 0;
    padding: 0 16px;
    transition: transform 0.3s ease;

    &:hover&:not(:disabled) {
        cursor: pointer;
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 1px 2px rgba(0,0,0,0.09), 
                0 2px 4px rgba(0,0,0,0.09), 
                0 4px 8px rgba(0,0,0,0.09), 
    }

    &:disabled {
        background-color: #eee;
        cursor: not-allowed;
        color: ${theme.colors.black}22;
    }

    ${props => props.fullWidth && css`
        width: 100%;
    `}
`;

const Margin = styled.div`
    width: 10px;
`;

export const LinkButton = styled.button`
    border: 0;
    margin: 0;
    padding: 0;
`;

export const GhostButton = styled(LinkButton)`
    color: black;
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
    children?: string | JSX.Element | JSX.Element[];
    disabled?: boolean;
    icon?: IconProp;
    style?: CSSProperties;
}

const Button = ({ children, loading, onClick, disabled, icon, ...props }: Props): JSX.Element => {
    return (
        <StyledButton onClick={onClick} disabled={loading || disabled} {...props}>
            {children}
            {icon && !loading ? <FontAwesomeIcon icon={icon} style={{ marginLeft: 5 }} fixedWidth /> : null}
            {loading ? (<><Margin /><Ball size={10} /></>) : null}
        </StyledButton>
    )
}

export default Button;