import React, { PropsWithChildren } from 'react';
import { TourProvider } from '@reactour/tour';
import steps, { TourKeys } from './steps';
import { faCheck } from 'app/assets/fa-light';
import Button from '../Button';

function Tour({ children }: PropsWithChildren<unknown>): JSX.Element {
    return (
        <TourProvider
            steps={Object.keys(steps).flatMap((key) => steps[key as TourKeys])}
            nextButton={({
                Button: BaseButton,
                currentStep,
                stepsLength,
                setIsOpen,
                setCurrentStep,
            }) => {
                const last = currentStep === stepsLength - 1
                return (
                    <BaseButton
                        hideArrow={last}
                        onClick={() => {
                            if (last) {
                                setIsOpen(false)
                            } else {
                                setCurrentStep(s => (s === Object.keys(steps).length - 1 ? 0 : s + 1))
                            }
                        }}
                    >
                        {last ? <Button icon={faCheck}>Done</Button> : null}
                    </BaseButton>
                )
            }}
            styles={{
                maskWrapper: base => ({ ...base, color: 'var(--color-gray-400)', opacity: 0.9 }),
                popover: base => ({ 
                    ...base, 
                    borderRadius: 8,
                    '--reactour-accent': 'var(--color-primary)', 
                })
            }}
        >
            {children}
        </TourProvider>
    );
}

export default Tour;