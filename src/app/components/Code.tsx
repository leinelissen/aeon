import styled, { css } from 'styled-components';
import theme from 'app/styles/theme';

const Code = styled.div<{ removed?: boolean; added?: boolean; updated?: boolean }>`
    font-family: 'IBM Plex Mono';
    background-color: #f8f8f8;
    padding: 10px;
    max-width: 100%;
    line-height: 2;
    white-space: pre-wrap;
    user-select: text;
    display: flex;
    flex-direction: column;
    word-break: break-all;
    font-size: 12px;
    margin: 5px 0;
    border-radius: 4px;

    h5 {
        margin-top: 0;
    }

    &.icon {
        height: 1em;
    }

    ${props => props.added && css`
        background-color: ${theme.colors.green}10;

        span {
            color: ${theme.colors.green};
        }
    `}

    ${props => props.removed && css`
        background-color: ${theme.colors.red}10;

        span {
            color: ${theme.colors.red};
        }
    `}

    ${props => props.updated && css`
        background-color: ${theme.colors.yellow}10;

        span {
            color: ${theme.colors.yellow};
        }
    `}
`;

export default Code;