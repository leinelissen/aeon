import React, { Component } from 'react';
import Modal from 'app/components/Modal';
import { H2 } from 'app/components/Typography';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faArrowDown, faEnvelope, faArrowRight, faCheck } from '@fortawesome/pro-light-svg-icons';
import Providers from 'app/utilities/Providers';

const Container = styled.div`
    margin: 32px 16px;
`;

class TutorialOverlay extends Component {
    state = {
        page: 0,
        isOpen: true,
        isLoading: false,
    };

    next = () => this.setState({ page: this.state.page + 1 });
    done = () => this.setState({ isOpen: false });

    updateAllProviders = async () => {
        this.setState({ isLoading: true });
        await Providers.updateAll();
        this.setState({ isLoading: false, page: 1 });
    }

    sendAllDataRequests = async () => {
        this.setState({ isLoading: true });
        console.log('DISPATCH!')
        const res = await Providers.dispatchDataRequestToAll();
        console.log(res);
        this.setState({ isLoading: false, page: 2 });
    }

    getContent() {
        const { page, isLoading } = this.state;

        switch(page) {
            case 0:
                return (
                    <>
                        <H2>How does this thing work?</H2>
                        <p>First of all, thank you for using Aeon! Now that your account is setup, we'll guide you through what to expect. </p>
                        <p>Aeon will gather data from the service you have provided your credentials for. Let's get your first batch of data.</p>
                        <Button
                            icon={faArrowDown}
                            loading={isLoading} 
                            onClick={this.updateAllProviders}
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
                        <p>Before we dive in, there's another type of data we need to tell you about. We just retrieved all the data you can normally access. However, services may save additional data to which you have no direct access (such as IP addresses). We can access this data through starting a <i>data request</i>.</p>
                        <p>Note: you may receive an email about this. This is normal.</p>
                        <Button
                            icon={faEnvelope}
                            loading={isLoading} 
                            onClick={this.sendAllDataRequests}
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
                        <p>Great! First data request on the way. Do note that since this request needs to be processed on your platforms' side, it may take some time to complete. While you sit and relax, Aeon will check on it in the background and let you know when it is completed.</p>
                        <p></p>
                        <Button
                            icon={faArrowRight}
                            onClick={this.next}
                            fullWidth
                        >
                            Great! Now what?
                        </Button>
                    </>
                )
            case 3:
                return (
                    <>
                        <H2>🕵️‍♂️ Let's have a look at your data!</H2>
                        <p>This is how all your data gets here in the first place. Now that we've gathered it all (with some coming later), let's have a look.</p>
                        <p>On the left, you'll find a timeline of updates. Clicking through them shows what's changed over time. The right side shows you the specifics of what was added and removed.</p>
                        <p>When you're done checking out your data, find the "Create a new Identity" button and click it to see how Aeon helps you change your identity.</p>
                        <Button
                            icon={faCheck}
                            onClick={this.done}
                            fullWidth
                        >
                            Got it!
                        </Button>
                    </>
                )
        }
    }

    render() {
        const { page, isOpen } = this.state;

        return (
            <Modal isOpen={isOpen} onRequestClose={this.done}>
                <Container>
                    {this.getContent()}
                </Container>
            </Modal>
        );
    }
}

export default TutorialOverlay;