import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartNetwork, faClock, faCog, faUser, faTable, faTrash } from 'app/assets/fa-light';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import theme from 'app/styles/theme';
import { useSelector } from 'react-redux';
import { State } from 'app/store';
import { PullDown } from './Utility';
import Tour from './Tour';
import useTour from './Tour/useTour';

export const MenuContainer = styled.div`
    display: grid;
    grid-template-columns: 175px 1fr;
    gap: 0px 0px;
    grid-template-areas:
        "menu content";
    height: 100vh;
    width: 100vw;
    overflow: hidden;
`;

const TitleBarContainer = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    z-index: 200;
    width: 100%;
    height: 50px;
    -webkit-app-region: drag;
    background: transparent;
    opacity: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(25px) brightness(1.1);
    text-transform: capitalize;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading);
    background-color: var(--color-gray-200)33;
    border-bottom: 1px solid var(--color-border);

    span {
        font-size: 14px;
        font-weight: 600;
    }

    &:hover {
        opacity: 1;
    }
`;

export const ContentContainer = styled.div`
    grid-area: content;
    grid-area: content;
    overflow: auto;
    position: relative;
    background-color: var(--color-gray-50);
`;

const Container = styled.div`
    grid-area: menu;
    display: flex;
    flex-direction: column;
    padding: 5px 0;
    -webkit-app-region: drag;
    padding: 50px 0 10px 0;
    border-right: 1px solid var(--color-border);
`;

const Link = styled(NavLink)`
    background: none;
    border: 0;
    font-family: 'Inter';
    text-align: left;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 6px;
    margin: 1px 10px;
    font-weight: 500;
    -webkit-app-region: no-drag;
    color: inherit;
    border-radius: 6px;

    span:not(.icon) {
        margin-left: 10px;
        font-size: 14px;
    }

    span.icon {
        font-size: 16px;
    }

    &.active {
        @media (prefers-color-scheme: dark) {
            background-color: #FFFFFF18;
        }
        @media (prefers-color-scheme: light) {
            background-color: #00000018;
        }
    }

    &:hover:not(.active) {
        @media (prefers-color-scheme: dark) {
            background-color: #FFFFFF08;
        }
        @media (prefers-color-scheme: light) {
            background-color: #00000008;
        }
    }
`;

export function TitleBar(): JSX.Element {
    const location = useLocation();
    const title = location.pathname.split('/')[1];

    return (
        <TitleBarContainer>
            <span>{title}</span>
        </TitleBarContainer>
    )
}

export default function Menu(): JSX.Element {
    const deleted = useSelector((state: State) => state.data.deleted);
    useTour(deleted.length ? '/screen/erasure' : null);

    return (
        <Container>
            <Link to="/timeline" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faClock} fixedWidth /></span>
                <span>Timeline</span>
            </Link>
            <Link to="/accounts" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faUser} fixedWidth /></span>
                <span>Accounts</span>
            </Link>
            <Link to="/data" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faTable} fixedWidth /></span>
                <span>Data</span>
            </Link>
            <Link to="/graph" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faChartNetwork} fixedWidth /></span>
                <span>Graph</span>
            </Link>
            {deleted.length ? (
                <>
                    <Link to="/erasure" activeClassName="active" data-tour="erasure-screen">
                        <span className="icon"><FontAwesomeIcon icon={faTrash} fixedWidth /></span>
                        <span>Erasure ({deleted.length})</span>
                    </Link>
                </>
            ) : null}
            <PullDown>
                <Link to="/settings" activeClassName="active">
                    <span className="icon"><FontAwesomeIcon icon={faCog} fixedWidth /></span>
                    <span>Settings</span>
                </Link>            
            </PullDown>
        </Container>
    );
}