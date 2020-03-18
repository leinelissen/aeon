import React from 'react';
import styled from 'styled-components';
import theme from 'app/styles/theme';

const Container = styled.div`
    -webkit-app-region: drag;
    -webkit-user-select: none;
    width: 100%;
    height: 40px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.blue.primary};
    font-weight: 800;
    font-size: 12px;
`;

function MenuBar(): JSX.Element {
    return (
        <Container />
    )
}

export default MenuBar;