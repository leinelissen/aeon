import React, { useCallback, useState } from 'react';
import Modal from 'app/components/Modal';
import { H2 } from 'app/components/Typography';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faSunglasses, faBoxingGlove } from 'app/assets/fa-light';
import { State, useAppDispatch } from 'app/store';
import { completeOnboarding } from 'app/store/onboarding/actions';
import { useSelector } from 'react-redux';

const Container = styled.div`
    margin: 32px 16px;
`;

function PageContent(page: number, next: () => void, done: () => void) {
    switch(page) {
        case 0:
            return (
                <>
                    <H2>Have a detailed look at your data!</H2>
                    <p>This is where you can check out what data is currently saved by all platforms. It is sorted by category, and you can select individual data points to see what they contain and when they were saved.</p>
                    <Button
                        icon={faSunglasses}
                        onClick={next}
                        data-telemetry-id="new-commit-tutorial-page-1"
                        fullWidth
                    >
                        Cool!
                    </Button>
                </>
            )
        case 1:
            return (
                <>
                    <H2>Putting the I in Identity</H2>
                    <p>The thing with your identity, is that it is yours to change. The same goes for your data.</p>
                    <p>If you wish to remove data from these platforms, click the delete button when inspecting a single data point. This change is then queued. If you wish to make the change permanent, click the &quot;Save Identity&quot; button in the top right.</p>
                    <Button
                        icon={faBoxingGlove}
                        onClick={done}
                        data-telemetry-id="new-commit-tutorial-page-2"
                        fullWidth
                    >
                        Let&apos;s get to it
                    </Button>
                </>
            )
    }
}

function TutorialOverlay(): JSX.Element {
    const [page, setPage] = useState(0);
    const dispatch = useAppDispatch();
    const isCompleted = useSelector((state: State) => state.onboarding.newCommit);

    const next = useCallback(() => setPage(page + 1), [page, setPage]);
    const done = useCallback(() => {
        dispatch(completeOnboarding('newCommit'));
    }, [dispatch]);

    return (
        <Modal isOpen={!isCompleted} onRequestClose={done}>
            <Container>
                {PageContent(page, next, done)}
            </Container>
        </Modal>
    );
}

export default TutorialOverlay;