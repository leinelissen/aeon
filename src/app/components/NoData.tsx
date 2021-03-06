import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from 'app/assets/fa-light';
import { LinkButton } from 'app/components/Button';
import { MarginLeft } from 'app/components/Utility';
import React from 'react';
import styled from 'styled-components';
import Graphic from '../assets/undraw_empty_xct9.svg';
import { H2 } from './Typography';

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    text-align: center;

    img {
        width: 400px;
        max-width: 75vw;
        margin-bottom: 48px;
    }
`;

function NoData(): JSX.Element {
    return (
        <Container>
            <img src={Graphic} />
            <H2>Nothing here...</H2>
            <p>You haven&apos;t requested any data yet.<br /> Start your first data request by heading over to Accounts.</p>
            <LinkButton to="/accounts?create-new-account">
                Add your first account
                <MarginLeft><FontAwesomeIcon icon={faPlus} /></MarginLeft>
            </LinkButton>
        </Container>
    );
}

export default NoData;