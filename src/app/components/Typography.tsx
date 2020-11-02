import styled from 'styled-components';
import theme from 'app/styles/theme';

export const H1 = styled.h1`
    font-weight: 600;
`;

export const H2 = styled.h2`
    font-weight: 400;
    font-size: 24px;
    margin: 8px 0;
    line-height: 1.3;
    word-break: break-all;
`;

export const H3 = styled.h3`
    font-weight: 400;
    font-size: 16px;
    margin: 8px 0;
`;

export const H5 = styled.h5`
    opacity: 0.5;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 400;
    margin: 8px 0;
`

export const Badge = styled.div`
    background-color: ${theme.colors.blue.primary};
    color: ${theme.colors.white};
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    font-size: 12px;
    flex-shrink: 0;
    white-space: nowrap;
`;