import styled, { css } from 'styled-components';

export const Margin = styled.div`
    padding: 16px;
`;

interface PullContainerProps {
    vertical?: boolean;
    verticalAlign?: boolean;
}

export const PullContainer = styled.div<PullContainerProps>`
    display: flex;

    ${props => props.vertical && css`
        flex-direction: column;
    `}

    ${props => props.verticalAlign && css`
        align-items: center;
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

export const EmptyIcon = styled.span`
    display: inline-block;
    width: 1.25em;
`;

export const MarginLeft = styled.span`
    margin-left: 1em;
`;