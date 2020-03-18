import React from 'react';
import styled from 'styled-components';
import theme from 'app/styles/theme';

const LoadingContainer = styled.div`
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
`;

export const Ball = styled.div<{ size?: number }>`
    height: ${props => props.size || '20'}px;
    width: ${props => props.size || '20'}px;
    border-radius: 50px;
    background-color: ${theme.colors.blue.primary};
    animation: bounce 0.5s alternate infinite cubic-bezier(.5, 0.05, 1, .5),
        fade-in 1s; 
    margin-top: -${props => props.size ? props.size * 2.5 : '40'}px;

    @keyframes bounce { 
        from { 
            transform: translate3d(0, 0px, 0); 
        } 
        to { 
            transform: translate3d(0, ${props => props.size ? props.size * 2 : '40'}px, 0); 
        } 
    } 
    @keyframes fade-in { 
        from { 
            opacity: 0;
        } 
        to { 
            opacity: 1;
        } 
    } 
`

const Loading = (): JSX.Element => (
    <LoadingContainer>
        <Ball />
    </LoadingContainer>
);

export default Loading;