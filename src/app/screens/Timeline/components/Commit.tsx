
import styled, { css } from 'styled-components'
import React, { Component, MouseEventHandler } from 'react';
import { Badge } from 'app/components/Typography';
import { PullRight } from 'app/components/Utility';
import { Commit as CommitType } from 'main/lib/repository/types';

interface Props extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onClick'> {
    onClick: (hash: string) => void;
    entry: CommitType;
    active?: boolean;
    latestCommit?: boolean;
}

export const StyledCommit = styled.button<{ active?: boolean }>`
    position: relative;
    z-index: 3;
    padding: 35px 25px;
    margin: 5px;
    text-align: left;
    border: 0;
    font-size: 12pt;
    font-weight: 400;
    max-width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    color: inherit;
    background-color: transparent;

    &:hover {
        cursor: pointer;

        @media (prefers-color-scheme: dark) {
            background-color: #272727;
        }
        
        @media (prefers-color-scheme: light) {
            background-color: #fcfcfc;
        }   
    }

    &:active {
        @media (prefers-color-scheme: dark) {
            background-color: #333333;
        }
        
        @media (prefers-color-scheme: light) {
            background-color: #f5f5f5;
        }   
    }

    &:focus {
        outline: 0;
    }

    ${(props) => props.active && css`
        border-radius: 16px;
        color: inherit;
        background-color: var(--colors-background) !important; 
    `}
`

const Dot = styled.div<{ active?: boolean }>`
    width: 24px;
    height: 24px;
    border-radius: 32px;
    margin-left: -5px;
    margin-right: 16px; 
    z-index: 2;
    flex-shrink: 0;
    transition: transform 0.3s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 
                0 2px 4px rgba(0,0,0,0.04), 
                0 4px 8px rgba(0,0,0,0.04), 
                0 8px 16px rgba(0,0,0,0.04),
                0 16px 32px rgba(0,0,0,0.04);

    border: 4px solid var(--color-gray-400);
    background-color: var(--color-background);

    ${(props) => props.active && css`
        background-color: var(--color-blue-500) !important; 
        border: 4px solid var(--color-blue-200) !important;
        color: inherit;
        transform: scale(1.25);
    `}
`;

export const TimelineLine = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 32px;
    width: 10px;
    min-height: 100%;
    z-index: 0;
    background-color: var(--color-gray-200);
`;

class Commit extends Component<Props> {
    handleClick: MouseEventHandler<HTMLButtonElement> = () => {
        this.props.onClick(this.props.entry.oid);
    }

    render(): JSX.Element {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { entry, active, latestCommit, onClick, ...props } = this.props;

        return (
            <StyledCommit active={active} onClick={this.handleClick} {...props}>
                <Dot active={active} />
                {entry.message.split('\n')[0]}
                {latestCommit && <PullRight><Badge>Current Identity</Badge></PullRight>}
            </StyledCommit>
        )
    }
}

export default Commit;