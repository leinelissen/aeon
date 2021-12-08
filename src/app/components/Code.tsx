import styled, { css } from 'styled-components';

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
        background-color: var(--color-green-50);

        span {
            color: var(--color-green-500);
        }
    `}

    ${props => props.removed && css`
        background-color: var(--color-red-50);

        span {
            color: var(--color-red-500);
        }
    `}

    ${props => props.updated && css`
        background-color: var(--color-yellow-50);

        span {
            color: var(--color-yellow-500);
        }
    `}
`;

export default Code;