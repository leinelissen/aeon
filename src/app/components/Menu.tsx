import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCog, faSync, faTable } from 'app/assets/fa-light';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import Emblem from 'app/assets/aeon-emblem-dark.svg';
import theme from 'app/styles/theme';

export const MenuContainer = styled.div`
    display: grid;
    grid-template-columns: 150px 1fr;
    grid-template-rows: 40px 1fr;
    gap: 0px 0px;
    grid-template-areas:
        "titleBar titleBar"
        "menu content";
    height: 100vh;
    width: 100vw;
    overflow: hidden;
`;

export const TitleBar = styled.div`
    grid-area: titleBar;
    background-color: ${theme.colors.grey.medium};
    -webkit-app-region: drag;
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
`;

const Link = styled(NavLink)`
    background: none;
    border: 0;
    font-family: 'IBM Plex Sans';
    font-size: 15px;
    text-align: left;
    margin: 5px 10px;
    height: 40px;
    line-height: 40px;
    border-radius: 4px;
    padding: 0 10px;
    font-weight: 400;
    color: ${theme.colors.black};

    span {
        margin-left: 5px;
    }

    &.active {
        background-color: white;
        border: 1px solid ${theme.colors.grey.light};
        font-weight: 600;
    }

    &:hover:not(.active) {
        background-color: #ffffffbb;
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

export default function Menu(): JSX.Element {
    return (
        <Container>
            <Link to="/timeline" activeClassName="active">
                <FontAwesomeIcon icon={faClock} fixedWidth />
                <span>Timeline</span>
            </Link>
            <Link to="/requests" activeClassName="active">
                <FontAwesomeIcon icon={faSync} fixedWidth />
                <span>Requests</span>
            </Link>
            <Link to="/data" activeClassName="active">
                <FontAwesomeIcon icon={faTable} fixedWidth />
                <span>Data</span>
            </Link>
            <Link to="/settings" activeClassName="active">
                <FontAwesomeIcon icon={faCog} fixedWidth />
                <span>Settings</span>
            </Link>
            <AeonLogo><img src={Emblem} /></AeonLogo>
        </Container>
    );
}