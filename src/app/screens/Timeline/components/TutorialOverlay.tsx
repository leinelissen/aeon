import React, { useCallback, useState } from 'react';
import Modal from 'app/components/Modal';
import { H2 } from 'app/components/Typography';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faArrowDown, faEnvelope, faArrowRight, faCheck } from 'app/assets/fa-light';
import Providers from 'app/utilities/Providers';
import { State, useAppDispatch } from 'app/store';
import { completeOnboarding } from 'app/store/onboarding/actions';
import { useSelector } from 'react-redux';

const Container = styled.div`
    margin: 32px 16px;
`;

function TutorialOverlay(): JSX.Element {
    const [page, setPage] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const isCompleted = useSelector((state: State) => state.onboarding.log);
    const dispatch = useAppDispatch();

    const next = useCallback(() => setPage(page + 1), [page, setPage]);
    const done = useCallback(() => {
        dispatch(completeOnboarding('log'));
    }, [dispatch]);

    const updateAllProviders = useCallback(async () => {
        setLoading(true);
        await Providers.updateAll();
        setLoading(false);
        setPage(1);
    }, [])

    const sendAllDataRequests = useCallback(async () => {
        setLoading(true);
        await Providers.dispatchDataRequestToAll();
        setLoading(false);
        setPage(2);
    }, [])

    const getContent = useCallback(() => {
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
                            onClick={updateAllProviders}
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
                            onClick={sendAllDataRequests}
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
                            onClick={next}
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
                            onClick={done}
                            data-telemetry-id="log-tutorial-page-4"
                            fullWidth
                        >
                            Got it!
                        </Button>
                    </>
                )
        }
    }, [done, next, isLoading, updateAllProviders, sendAllDataRequests]);
    return (
        <Modal isOpen={!isCompleted} onRequestClose={done}>
            <Container>
                {getContent()}
            </Container>
        </Modal>
    );
}

export default TutorialOverlay;