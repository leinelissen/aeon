import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCog, faSync, faTable } from 'app/assets/fa-light';
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Emblem from 'app/assets/aeon-emblem-dark.svg';
import theme from 'app/styles/theme';

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
    background-color: ${theme.colors.grey.medium}33;
    transition: all 0.3s ease;
    backdrop-filter: blur(25px) brightness(1.1);
    border-bottom: 1px solid ${theme.colors.grey.medium};
    text-transform: capitalize;
    display: flex;
    align-items: center;
    justify-content: center;

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
    background-color: #FBFBFB;
    grid-area: content;
    overflow: auto;
    position: relative;
`;

const Container = styled.div`
    grid-area: menu;
    display: flex;
    flex-direction: column;
    padding: 5px 0;
    -webkit-app-region: drag;
    padding-top: 40px;
    border-right: 1px solid ${theme.colors.grey.medium};
`;

const Link = styled(NavLink)`
    background: none;
    border: 0;
    font-family: 'IBM Plex Sans';
    font-size: 15px;
    text-align: left;
    height: 50px;
    display: flex;
    align-items: center;
    padding: 0 20px;
    font-weight: 400;
    color: ${theme.colors.black};
    -webkit-app-region: no-drag;

    span:not(.icon) {
        margin-left: 10px;
        font-size: 18px;
    }

    span.icon {
        font-size: 22px;
    }

    &.active {
        background-color: ${theme.colors.black}14;
    }

    &:hover:not(.active) {
        background-color: ${theme.colors.black}08;
    }
`;

const AeonLogo = styled.div`
    margin-top: auto;
    display: inline-flex;
    justify-content: center;
    margin-bottom: 20px;

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
    return (
        <Container>
            <Link to="/timeline" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faClock} fixedWidth /></span>
                <span>Timeline</span>
            </Link>
            {/* <Link to="/requests" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faSync} fixedWidth /></span>
                <span>Requests</span>
            </Link> */}
            <Link to="/data" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faTable} fixedWidth /></span>
                <span>Data</span>
            </Link>
            {/* <Link to="/settings" activeClassName="active">
                <span className="icon"><FontAwesomeIcon icon={faCog} fixedWidth /></span>
                <span>Settings</span>
            </Link> */}
            <AeonLogo><img src={Emblem} /></AeonLogo>
        </Container>
    );
}