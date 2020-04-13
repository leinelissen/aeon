import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import theme from 'app/styles/theme';
import { Ball } from './Loading';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

const StyledButton = styled.button`
    background-color: ${theme.colors.blue.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.white};
    height: 45px;
    font-size: 14px;
    flex: 0 0 auto;
    border-radius: 5px;
    outline: 0 !important;
    margin: 5px 10px;
    border: 0;

    &:hover&:not(:disabled) {
        cursor: pointer;
        opacity: 0.9;
    }

    &:disabled {
        background-color: ${theme.colors.blue.dark};
        cursor: not-allowed;
        color: ${theme.colors.white}55;
    }
`;

const Margin = styled.div`
    width: 10px;
`;

export const LinkButton = styled.button`
    border: 0;
    margin: 0;
    padding: 0;
`;


interface Props {
    loading?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    children?: string | JSX.Element | JSX.Element[];
    disabled?: boolean;
    icon?: IconProp;
}

const Button = ({ children, loading, onClick, disabled, icon }: Props): JSX.Element => {
    return (
        <StyledButton onClick={onClick} disabled={loading || disabled}>
            {icon ? <FontAwesomeIcon icon={icon} style={{ marginRight: 5 }} fixedWidth /> : null}
            {children}
            {loading ? (<><Margin /><Ball size={10} color={theme.colors.white} /></>) : null}
        </StyledButton>
    )
}

export default Button;