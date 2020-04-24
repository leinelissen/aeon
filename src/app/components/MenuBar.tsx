import React from 'react';
import styled from 'styled-components';
import theme from 'app/styles/theme';

const MenuBar = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 1px solid ${theme.colors.border};
    padding: 16px 24px;
    grid-column: 1 / -1;
`;

export default MenuBar;