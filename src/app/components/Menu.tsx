import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faClock, faCog, faUser, faTable, faTrash } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { State } from 'app/store';
import { PullDown } from './Utility';
import useTour from './Tour/useTour';

export const PageContainer = styled.div`
    display: grid;
    grid-template-columns: 200px 1fr;
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
    transition: all 0.3s ease;
    backdrop-filter: blur(25px) brightness(1.1);
    text-transform: capitalize;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-heading);
    border-bottom: 1px solid var(--color-border);

    span {
        font-size: 14px;
        font-weight: 600;
    }
`;

export const ContentContainer = styled.div`
    grid-area: content;
    overflow: auto;
    position: relative;
    background-color: var(--color-background);
`;

const Container = styled.div`
    grid-area: menu;
    display: flex;
    flex-direction: column;
    padding: 5px 0;
    -webkit-app-region: drag;
    padding: 50px 0 10px 0;
    border-right: 1px solid var(--color-gray-400);
    box-shadow: inset -10px 0 8px -10px rgba(0,0,0,0.04);
`;

const Link = styled(NavLink)`
    background: none;
    border: 0;
    font-family: var(--font-heading);
    text-align: left;
    height: 36px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    margin: 0px 8px;
    font-weight: 400;
    -webkit-app-region: no-drag;
    color: var(--color-heading);
    border-radius: 6px;
    cursor: default;

    span:not(.icon) {
        margin-left: 8px;
        font-size: 14px;
    }

    span.icon {
        /* font-size: 16px; */
        color: var(--color-gray-700);
    }

    &.active {
        @media (prefers-color-scheme: dark) {
            background-color: #FFFFFF26;
        }
        @media (prefers-color-scheme: light) {
            background-color: #00000018;
        }
    }

    &:hover:not(.active) {
        @media (prefers-color-scheme: dark) {
            background-color: #FFFFFF12;
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
    );
}

export default function Menu(): JSX.Element {
    const deleted = useSelector((state: State) => state.data.deleted);
    useTour(deleted.length ? '/screen/erasure' : null);

    return (
        <Container id="menu">
            <Link to="/timeline" id="timeline" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="icon"><FontAwesomeIcon icon={faClock} fixedWidth /></span>
                <span>Timeline</span>
            </Link>
            <Link to="/accounts" id="accounts" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="icon"><FontAwesomeIcon icon={faUser} fixedWidth /></span>
                <span>Accounts</span>
            </Link>
            <Link to="/data" id="data" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="icon"><FontAwesomeIcon icon={faTable} fixedWidth /></span>
                <span>Data</span>
            </Link>
            <Link to="/graph" id="graph" className={({ isActive }) => isActive ? 'active' : ''}>
                <span className="icon"><FontAwesomeIcon icon={faProjectDiagram} fixedWidth /></span>
                <span>Graph</span>
            </Link>
            {deleted.length ? (
                <>
                    <Link to="/erasure" id="erasure" className={({ isActive }) => isActive ? 'active' : ''} data-tour="erasure-screen">
                        <span className="icon"><FontAwesomeIcon icon={faTrash} fixedWidth /></span>
                        <span>Erasure ({deleted.length})</span>
                    </Link>
                </>
            ) : null}
            <PullDown>
                <Link to="/settings" id="settings" className={({ isActive }) => isActive ? 'active' : ''}>
                    <span className="icon"><FontAwesomeIcon icon={faCog} fixedWidth /></span>
                    <span>Settings</span>
                </Link>            
            </PullDown>
        </Container>
    );
}