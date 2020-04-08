import React, { Component } from 'react';
import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebookF, faSpotify, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import theme from 'app/styles/theme';
import Providers from 'app/utilities/Providers';
import Store, { StoreProps } from 'app/store';

interface State {
    isInitialised: boolean;
}

const Container = styled.div`
    width: 100%;
    height: 100%;
    max-width: 1000px;
    margin: 0 auto;
    min-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px;
`;

const Bottom = styled.div`
    margin-top: auto;
`;

const Center = styled.div`
    margin-top: auto;
    margin-bottom: auto;
    display: flex;
    align-items: center;

    & > * {
        width: 50%;
        padding: 20px;
    }
`;

const BrandContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

interface ProviderProps {
    disabled?: boolean;
    active?: boolean;
}

const Provider = styled.button<ProviderProps>`
    width: 120px;
    height: 120px;
    border-radius: 120px;
    margin: 5px;
    border: 1px solid #eee;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #888;

    ${(props) => props.disabled && css`
        color: #eee;
        opacity: 0.5;
    `}

    ${(props) => props.active && css`
        color: ${theme.colors.blue.primary};
        border-color: ${theme.colors.blue.primary};
    `}

    &:hover:not(:disabled) {
        color: #555;
    }
`;

class Onboarding extends Component<StoreProps, State> {
    state = {
        isInitialised: false
    };

    handleClick = async (): Promise<void> => {
        const isInitialised = await Providers.initialise('instagram');
        this.setState({ isInitialised });
        this.props.store.set('isOnboarded')(true);
    }

    render(): JSX.Element {
        const { isInitialised } = this.state;

        return (
            <Container>
                <Center>
                    <div>
                        <p>There is lots of data out there on you.  You don't always have power over what makes up your online identity, how you're perceived, how you're treated and so on. Aeon allows you to exercise your rights to manage your online identity by changing or deleting details, or even fully start over.</p>
                        <p><strong>Connect to the platforms of your choice in order to reshape your online identity.</strong></p>
                    </div>
                    <BrandContainer>
                        <Provider active={isInitialised} onClick={this.handleClick}>
                            <FontAwesomeIcon icon={faInstagram} size="3x" />
                        </Provider>
                        <div style={{ display: 'flex' }}>
                            <Provider disabled>
                                <FontAwesomeIcon icon={faFacebookF} size="3x" />
                            </Provider>
                            <Provider disabled>
                                <FontAwesomeIcon icon={faSpotify} size="3x" />
                            </Provider>
                        </div>
                        <Provider disabled>
                            <FontAwesomeIcon icon={faLinkedin} size="3x" />
                        </Provider>
                    </BrandContainer>
                </Center>
                <Bottom>
                    {isInitialised ? <Link to="/log">Continue</Link> : <br />}
                </Bottom>
            </Container>
        );
    }
}

export default Store.withStore(Onboarding);