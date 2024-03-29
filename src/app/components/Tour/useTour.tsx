import { State, useAppDispatch } from 'app/store';
import { completeTour } from 'app/store/onboarding/actions';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import steps, { TourKeys } from './steps';
import { useTour as useBaseTour } from '@reactour/tour';
import { tour } from 'app/utilities/env';

function useTour(screen: TourKeys) {
    const dispatch = useAppDispatch();
    const isTourComplete = useSelector((state: State) => state.onboarding.tour.includes(screen));
    const { setIsOpen, setSteps, setCurrentStep } = useBaseTour();

    useEffect(() => {
        // GUARD: Check if tours are enabled application-wide
        if (!tour) {
            return;
        }

        if (!isTourComplete) {
            setSteps(steps[screen]);
            setCurrentStep(0);
            setIsOpen(true);
            dispatch(completeTour(screen));
        }
    }, [setIsOpen, setSteps, isTourComplete, screen]);
}

export function Tour({ screen }: { screen: TourKeys }): null {
    useTour(screen);
    return null;
}

export default useTour;
