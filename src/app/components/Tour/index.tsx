import { State, useAppDispatch } from 'app/store';
import { completeTour } from 'app/store/onboarding/actions';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import Reactour from 'reactour';
import steps, { TourKeys } from './steps';
import { createGlobalStyle } from 'styled-components';
import theme from 'app/styles/theme';

const Overrides = createGlobalStyle`
    #___reactour {
        .reactour__helper {
            border-radius: 8px;
        }
        [data-tour-elem="controls"] {
            justify-content: center;
        }
    }
`;

interface Props {
    tour: TourKeys
}

function Tour({ tour }: Props): JSX.Element {
    const dispatch = useAppDispatch();
    const isTourComplete = useSelector((state: State) => state.onboarding.tour.includes(tour));
    const [isOpen, setOpen] = useState(!isTourComplete);

    // Handle a close of the window
    const handleClose = useCallback(() => {
        // First, we close the Tour overlay
        setOpen(false);

        // Then we dispatch an action to store the tour state in Redux. We
        // assume at this point that closing the window means you're done with
        // it completely.
        dispatch(completeTour(tour));
    }, [setOpen]);

    return (
        <>
            <Overrides />
            <Reactour
                steps={steps[tour]}
                isOpen={isOpen}
                onRequestClose={handleClose}
                accentColor={theme.colors.blue.primary}
            />
        </>
    );
}

export default Tour;