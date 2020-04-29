
import styled, { css } from 'styled-components'
import React, { Component } from 'react';
import theme from 'app/styles/theme';
import { ReadCommitResult } from 'isomorphic-git';

interface Props {
    onClick: (hash: string) => void;
    entry: ReadCommitResult;
    active: boolean;
}

export const StyledCommit = styled.button<{ active?: boolean }>`
    padding: 25px;
    text-align: left;
    border: 0;
    font-size: 16px;
    font-weight: 400;
    width: 100%;
    display: flex;
    align-items: center;
    position: relative;
    color: #666;

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
        background-color: #eee !important;
        color: inherit;
    `}
`

const Dot = styled.div`
    width: 24px;
    height: 24px;
    border-radius: 24px;
    margin-right: 16px; 
    background-color: ${theme.colors.grey.medium};
    z-index: 2;
`;

const Timeline = styled.div`
    position: absolute;
    left: 36px;
    width: 2px;
    height: 100%;
    background-color: #ddd;
    z-index: 0;
`;

class Commit extends Component<Props> {
    handleClick = (): void => {
        this.props.onClick(this.props.entry.oid);
    }

    render(): JSX.Element {
        const { entry: { commit }, active } = this.props;

        return (
            <StyledCommit active={active} onClick={this.handleClick}>
                <Timeline />
                <Dot />
                {commit.message}
            </StyledCommit>
        )
    }
}

export default Commit;