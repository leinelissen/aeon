
import styled, { css } from 'styled-components'
import React, { Component } from 'react';
import theme from 'app/styles/theme';
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
    color: ${theme.colors.black};
    background-color: transparent;

    &:hover {
        cursor: pointer;
        background-color: #fcfcfc;
    }

    &:active {
        background-color: #f5f5f5;
    }

    &:focus {
        outline: 0;
    }

    ${(props) => props.active && css`
        background-color: ${theme.colors.white} !important;
        border-radius: 16px;
        color: inherit;
    `}
`

const Dot = styled.div<{ active?: boolean }>`
    width: 24px;
    height: 24px;
    border-radius: 32px;
    margin-left: -5px;
    margin-right: 16px; 
    background-color: ${theme.colors.white};
    z-index: 2;
    flex-shrink: 0;
    border: 4px solid #fcfcfc;
    transition: transform 0.3s ease;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 
                0 2px 4px rgba(0,0,0,0.04), 
                0 4px 8px rgba(0,0,0,0.04), 
                0 8px 16px rgba(0,0,0,0.04),
                0 16px 32px rgba(0,0,0,0.04);

    ${(props) => props.active && css`
        background-color: ${theme.colors.blue.primary};
        border: 4px solid ${theme.colors.blue.veryLight};
        color: inherit;
        transform: scale(1.25);
    `}
`;

export const TimelineLine = styled.div`
    position: fixed;
    left: 32px;
    width: 10px;
    height: 100%;
    background-color: ${theme.colors.grey.light};
    z-index: 0;
`;

class Commit extends Component<Props> {
    handleClick = (): void => {
        this.props.onClick(this.props.entry.oid);
    }

    render(): JSX.Element {
        const { entry, active, latestCommit } = this.props;

        return (
            <StyledCommit active={active} onClick={this.handleClick}>
                <Dot active={active} />
                {entry.message}
                {latestCommit && <PullRight><Badge>Current Identity</Badge></PullRight>}
            </StyledCommit>
        )
    }
}

export default Commit;