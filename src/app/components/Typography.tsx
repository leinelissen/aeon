import styled from 'styled-components';

export const H1 = styled.h1`
    font-weight: 600;
    color: var(--color-header);
`;

export const H2 = styled.h2`
    font-weight: 700;
    font-size: 24px;
    margin: 8px 0;
    line-height: 1.3;
    word-break: break-all;
    font-family: 'Inter';
    color: var(--color-header);
`;

export const H3 = styled.h3`
    font-weight: 400;
    font-size: 16px;
    margin: 8px 0;
    color: var(--color-header);
`;

export const H5 = styled.h5`
    opacity: 0.5;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 400;
    margin: 8px 0;
`

export const Badge = styled.div`
    background-color: var(--color-blue-100);
    color: var(--color-blue-500);
    font-weight: 500;
    font-family: var(--font-heading);
    letter-spacing: 0.2px;
    padding: 4px 8px;
    display: inline-block;
    border-radius: 4px;
    text-transform: uppercase;
    font-size: 12px;
    flex-shrink: 0;
    white-space: nowrap;
`;

export const FontLarge = styled.span`
    font-size: 14px;
`;