import styled, { css } from 'styled-components';

export const Margin = styled.div`
    padding: 32px;
`;

export const MarginSmall = styled.div`
    padding: 16px 32px;
`;

interface PullContainerProps {
    vertical?: boolean;
    verticalAlign?: boolean;
    center?: boolean;
    gap?: boolean;
}

export const PullContainer = styled.div<PullContainerProps>`
    display: flex;

    ${(props) => props.vertical && css`
        flex-direction: column;
    `}

    ${(props) => props.verticalAlign && css`
        align-items: center;
    `}

    ${(props) => props.center && css`
        justify-content: center;
    `}

    ${(props) => props.gap && css`
        gap: 8px;
    `}
`;

export const PullLeft = styled.div`
    margin-right: auto;
`;

export const PullRight = styled.div`
    margin-left: auto;
`;

export const PullDown = styled.div`
    margin-top: auto;
`;

export const PullCenter = styled.div`
    display: flex;
    justify-content: center;
`;

export const EmptyIcon = styled.span`
    display: inline-block;
    width: 1.25em;
`;

export const MarginLeft = styled.span`
    margin-left: 1em;
`;

export const MarginRight = styled.span`
    margin-right: 1em;
`;

export const Ellipsis = styled.div.attrs((props) => ({
    title: props.children,
}))`
    white-space: nowrap;
    overflow: hidden;
    margin-right: 5px;
`;