
import styled, { css } from 'styled-components';
import React, { Component, MouseEventHandler } from 'react';
import { Badge } from 'app/components/Typography';
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
    font-size: 14px;
    font-weight: 400;
    max-width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    background-color: transparent;
    color: var(--color-gray-700);
    font-family: var(--font-heading);

    &:focus {
        outline: 0;
    }

    ${(props) => props.active ? css`
        border-radius: 12px;
        color: var(--color-blue-500);
        font-weight: 600;
        background-color: var(--color-background);
        border: 1px solid var(--color-gray-100);
        box-shadow: 0 1px 1px rgba(0,0,0,0.02), 
              0 2px 2px rgba(0,0,0,0.02), 
              0 4px 4px rgba(0,0,0,0.02), 
              0 8px 8px rgba(0,0,0,0.02), 
              0 16px 16px rgba(0,0,0,0.02), 
              0 32px 32px rgba(0,0,0,0.02);
    ` : css`
        &:hover {
            background-color: var(--color-background);
        }
    `}
`;

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

    border: 4px solid var(--color-gray-200);
    background-color: var(--color-gray-100);

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
    background-color: var(--color-gray-50);
`;

class Commit extends Component<Props> {
    handleClick: MouseEventHandler<HTMLButtonElement> = () => {
        this.props.onClick(this.props.entry.oid);
    };

    render(): JSX.Element {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { entry, active, latestCommit, onClick, ...props } = this.props;

        return (
            <StyledCommit active={active} onClick={this.handleClick} {...props}>
                <Dot active={active} />
                <div>
                    {entry.message.split('\n')[0]}
                    {latestCommit && <>
                        <br /><br />
                        <Badge>Current Identity</Badge>
                    </>}
                </div>
            </StyledCommit>
        );
    }
}

export default Commit;