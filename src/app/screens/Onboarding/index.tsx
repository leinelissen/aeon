import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from 'app/assets/fa-light';
import { LinkButton } from 'app/components/Button';
import { H2 } from 'app/components/Typography';
import { MarginLeft } from 'app/components/Utility';
import { State } from 'app/store';
import { completeOnboarding } from 'app/store/onboarding/actions';
import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Logo from 'app/assets/aeon-logo.svg';

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    height: 100%;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;

    img {
        width: 250px;
        margin-bottom: 48px;
    }
`;

function Onboarding(): JSX.Element {
    const dispatch = useDispatch();
    const isOnboardingComplete = useSelector((state: State) => state.onboarding.initialisation);
    
    useEffect(() => {
        // Redirect to /timeline if the user has already completed the
        // first-time application onboarding screen
        if (isOnboardingComplete) {
            // history.push('/timeline');
        }

        return () => {
            // If the user has not completed onboarding yet, dispatch the
            // completion action for this onboarding when the component is unmounted.
            if (!isOnboardingComplete) {
                dispatch(completeOnboarding('initialisation'));
            }
        }
    });

    return (
        <Container>
            <img src={Logo} />
            <H2>Welcome to Aeon!</H2>
            <p>Aeon is an application that makes managing where your data is found online easy. If you&apos;re feeling adventerous, feel free to explore around. Adding your first account is also a good place to start.</p>
            <LinkButton to="/accounts">
                Add your first account
                <MarginLeft><FontAwesomeIcon icon={faPlus} /></MarginLeft>
            </LinkButton>
        </Container>
    );
}

export default Onboarding;