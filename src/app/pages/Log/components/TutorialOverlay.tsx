import React, { Component } from 'react';
import Modal from 'app/components/Modal';
import { H2 } from 'app/components/Typography';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faArrowDown, faEnvelope, faArrowRight, faCheck } from '@fortawesome/pro-light-svg-icons';
import Providers from 'app/utilities/Providers';
import Store, { StoreProps } from 'app/store';

interface State {
    page: number;
    isLoading: boolean;
}

const Container = styled.div`
    margin: 32px 16px;
`;

class TutorialOverlay extends Component<StoreProps, State> {
    state = {
        page: 0,
        isLoading: false,
    };

    next = () => this.setState({ page: this.state.page + 1 });
    done = () => this.props.store.set('onboardingComplete')({
        ...this.props.store.get('onboardingComplete'),
        log: true,
    });


    updateAllProviders = async () => {
        this.setState({ isLoading: true });
        await Providers.updateAll();
        this.setState({ isLoading: false, page: 1 });
    }

    sendAllDataRequests = async () => {
        this.setState({ isLoading: true });
        await Providers.dispatchDataRequestToAll();
        this.setState({ isLoading: false, page: 2 });
    }

    getContent() {
        const { page, isLoading } = this.state;

        switch(page) {
            case 0:
                return (
                    <>
                        <H2>How does this thing work?</H2>
                        <p>First of all, thank you for using Aeon! Now that your account is setup, we&apos;ll guide you through what to expect. </p>
                        <p>Aeon will gather data from the service you have provided your credentials for. Let&apos;s get your first batch of data.</p>
                        <Button
                            icon={faArrowDown}
                            loading={isLoading} 
                            onClick={this.updateAllProviders}
                            data-telemetry-id="log-tutorial-page-1"
                            fullWidth
                        >
                            Retrieve my data
                        </Button>
                    </>
                )
            case 1:
                return (
                    <>
                        <H2>✅ First pieces of data</H2>
                        <p>All right! You retrieved your first pieces of data. This process will happen in the background from now on. This means that occasionally, you may get a pop-up to enter your credentials. This is to check for updates to your data. If you want to know any update status, find the bar on the bottom.</p>
                        <p>Before we dive in, there&apos;s another type of data we need to tell you about. We just retrieved all the data you can normally access. However, services may save additional data to which you have no direct access (such as IP addresses). We can access this data through starting a <i>data request</i>.</p>
                        <p>Note: you may receive an email about this. This is normal.</p>
                        <Button
                            icon={faEnvelope}
                            loading={isLoading} 
                            onClick={this.sendAllDataRequests}
                            data-telemetry-id="log-tutorial-page-2"
                            fullWidth
                        >
                            Request all the additional data!
                        </Button>
                    </>
                )
            case 2:
                return (
                    <>
                        <H2>✅ Your first data request!</H2>
                        <p>Great! First data request on the way. Do note that since this request needs to be processed on your platforms&apos; side, it may take some time to complete. While you sit and relax, Aeon will check on it in the background and let you know when it is completed.</p>
                        <p></p>
                        <Button
                            icon={faArrowRight}
                            onClick={this.next}
                            data-telemetry-id="log-tutorial-page-3"
                            fullWidth
                        >
                            Great! Now what?
                        </Button>
                    </>
                )
            case 3:
                return (
                    <>
                        <H2>🕵️‍♂️ Let&apos;s have a look at your data!</H2>
                        <p>This is how all your data gets here in the first place. Now that we&apos;ve gathered it all (with some coming later), let&apos;s have a look.</p>
                        <p>On the left, you&apos;ll find a timeline of updates. Clicking through them shows what&apos;s changed over time. The right side shows you the specifics of what was added and removed.</p>
                        <p>When you&apos;re done checking out your data, find the &lsquo;Create a new Identity&rsquo; button and click it to see how Aeon helps you change your identity.</p>
                        <Button
                            icon={faCheck}
                            onClick={this.done}
                            data-telemetry-id="log-tutorial-page-4"
                            fullWidth
                        >
                            Got it!
                        </Button>
                    </>
                )
        }
    }

    render() {
        const { log: isCompleted } = this.props.store.get('onboardingComplete');

        return (
            <Modal isOpen={!isCompleted} onRequestClose={this.done}>
                <Container>
                    {this.getContent()}
                </Container>
            </Modal>
        );
    }
}

export default Store.withStore(TutorialOverlay);