import styled, { css } from 'styled-components';

export interface BaseTextProps {
    lines?: number;
}

export const BaseText = styled.span.attrs((props) => ({
    title: typeof props.children === 'string' ? props.children : undefined,
}))<BaseTextProps>`
    ${(props) => props.lines && css`
        -webkit-line-clamp: ${props.lines};
        overflow: hidden;
        white-space: nowrap;
    `}
`;

export const H1 = styled(BaseText).attrs({ as: 'h1' })`
    font-weight: 600;
    color: var(--color-heading);
`;

export const H2 = styled(BaseText).attrs({ as: 'h2' })`
    font-weight: 600;
    font-size: 24px;
    margin: 8px 0;
    line-height: 1.3;
    font-family: var(--font-heading);
    color: var(--color-heading);
`;

export const H3 = styled(BaseText).attrs({ as: 'h3' })`
    font-weight: 400;
    font-size: 16px;
    margin: 8px 0;
    color: var(--color-heading);
`;

export const H5 = styled(BaseText).attrs({ as: 'h5' })`
    opacity: 0.5;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 400;
    margin: 8px 0;
`;

export const Badge = styled(BaseText).attrs({ as: 'div' })`
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

export const FontLarge = styled(BaseText).attrs({ as: 'span' })`
    font-size: 14px;
`;