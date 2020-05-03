import styled, { css } from 'styled-components';
import theme from 'app/styles/theme';

const Code = styled.div<{ removed?: boolean; added?: boolean; updated?: boolean }>`
    font-family: 'IBM Plex Mono';
    background-color: #f8f8f8;
    padding: 5px 25px;
    min-width: 100%;
    line-height: 2;
    white-space: pre-wrap;
    user-select: text;
    display: flex;
    word-break: break-all;
    font-size: 12px;

    &.icon {
        height: 1em;
    }

    ${props => props.added && css`
        background-color: ${theme.colors.green}22;
    `}

    ${props => props.removed && css`
        background-color: ${theme.colors.red}22;
    `}

    ${props => props.updated && css`
        background-color: ${theme.colors.yellow}22;
    `}
`;

export default Code;