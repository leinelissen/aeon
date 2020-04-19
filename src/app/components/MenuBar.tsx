import React from 'react';
import styled from 'styled-components';
import theme from 'app/styles/theme';

const Container = styled.div`
    -webkit-app-region: drag;
    -webkit-user-select: none;
    width: 100%;
    height: 40px;
    border-bottom: 1px solid ${theme.colors.border};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.blue.primary};
    font-weight: 600;
    font-size: 12px;
    position: fixed;
    z-index: 10;
`;

function MenuBar(): JSX.Element {
    return (
        <Container>Aeon</Container>
    )
}

export default MenuBar;