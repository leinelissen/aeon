import React from 'react';
import theme from 'app/styles/theme';
import styled from 'styled-components';
import { Ball } from './Loading';

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


interface Props {
    loading?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    children?: string | JSX.Element | JSX.Element[];
    disabled?: boolean;
}

const Button = ({ children, loading, onClick, disabled }: Props): JSX.Element => {
    return (
        <StyledButton onClick={onClick} disabled={loading || disabled}>
            {children}
            {loading ? (<><Margin /><Ball size={10} /></>) : null}
        </StyledButton>
    )
}

export default Button;