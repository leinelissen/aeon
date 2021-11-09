import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartNetwork, faClock, faCog, faUser, faTable, faTrash } from 'app/assets/fa-light';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Emblem from 'app/assets/aeon-emblem-dark.svg';
import theme from 'app/styles/theme';
import { useSelector } from 'react-redux';
import { State } from 'app/store';
import { PullDown } from './Utility';
import Tour from './Tour';

export const MenuContainer = styled.div`
    display: grid;
    grid-template-columns: 225px 1fr;
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
    height: 40px;
    -webkit-app-region: drag;
    background: transparent;
    opacity: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(25px) brightness(1.1);
    text-transform: capitalize;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (prefers-color-scheme: dark) {
        background-color: #22222233;
        border-bottom: 1px solid ${theme.colors.borderDarkMode};    
    }
    
    @media (prefers-color-scheme: light) {
        background-color: ${theme.colors.grey.medium}33;
        border-bottom: 1px solid ${theme.colors.border};
    }

    span {
        font-size: 12px;
        opacity: 0.8;
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

    @media (prefers-color-scheme: dark) {
        background-color: #222222;
        color: ${theme.colors.white};
    }

    @media (prefers-color-scheme: light) {
        background-color: #FBFBFB;
        color: ${theme.colors.black};
    }
`;

const Container = styled.div`
    grid-area: menu;
    display: flex;
    flex-direction: column;
    padding: 5px 0;
    -webkit-app-region: drag;
    padding-top: 40px;
    
    @media (prefers-color-scheme: dark) {
        color: ${theme.colors.white};
        border-right: 1px solid ${theme.colors.borderDarkMode};
    }
    
    @media (prefers-color-scheme: light) {
        border-right: 1px solid ${theme.colors.border};
        color: ${theme.colors.black};
    }
`;

const Link = styled(NavLink)`
    background: none;
    border: 0;
    font-family: 'IBM Plex Sans';
    font-size: 16px;
    text-align: left;
    height: 40px;
    display: flex;
    align-items: center;
    padding: 0 6px;
    margin: 5px 10px;
    font-weight: 400;
    -webkit-app-region: no-drag;
    color: inherit;
    border-radius: 6px;

    span:not(.icon) {
        margin-left: 10px;
        font-size: 16px;
    }

    span.icon {
        font-size: 18px;
        @media (prefers-color-scheme: dark) {
            color: ${theme.colors.blue.primaryDarkMode};
        }
        @media (prefers-color-scheme: light) {
            color: ${theme.colors.blue.primary};
        }
    }

    &.active {
        @media (prefers-color-scheme: dark) {
            background-color: ${theme.colors.white}18;
        }
        @media (prefers-color-scheme: light) {
            background-color: ${theme.colors.black}18;
        }
    }

    &:hover:not(.active) {
        @media (prefers-color-scheme: dark) {
            background-color: ${theme.colors.white}08;
        }
        @media (prefers-color-scheme: light) {
            background-color: ${theme.colors.black}08;
        }
    }
`;

const AeonLogo = styled.div`
    display: flex;
    justify-content: center;
    margin: 20px auto;

    img {
        width: 25px;
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
            <Link to="/settings" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faCog} fixedWidth /></span>
                <span>Settings</span>
            </Link>
            {deleted.length ? (
                <>
                    <Link to="/erasure" activeClassName="active" data-tour="erasure-screen">
                        <span className="icon"><FontAwesomeIcon icon={faTrash} fixedWidth /></span>
                        <span>Erasure ({deleted.length})</span>
                    </Link>
                    <Tour tour="/screen/erasure" />
                </>
            ) : null}
            <PullDown>
                <AeonLogo><img src={Emblem} /></AeonLogo>
            </PullDown>
        </Container>
    );
}