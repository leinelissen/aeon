import React, { PropsWithChildren } from 'react';
import { Switch, useLocation } from 'react-router-dom';
import { useTransition, animated } from 'react-spring';
import styled from 'styled-components';

export enum TransitionDirection {
    left = 'LEFT',
    right = 'RIGHT'
}

const Transitions: Map<TransitionDirection, unknown> = new Map([
    [TransitionDirection.left, {
        transform: 'translate3d(-100%,0,0)'
    }],
    [TransitionDirection.right, {
        transform: 'translate3d(100%,0,0)'
    }],
]);

const Animated = styled(animated.div)`
    width: 100%;
    height: 100%;
    background-color: #FBFBFB;
    grid-area: content;
    overflow: auto;
`;

/**
 * A function that allows for transitions between route changes
 */
function AnimatedSwitch({ children }: PropsWithChildren<unknown>): JSX.Element {
    const location = useLocation();

    const transitions = useTransition(location, location => location.pathname, {
        initial: { transform: 'translate3d(0, 0%,0)' },
        leave: { transform: 'translate3d(0,0,0)' },
        enter: { transform: 'translate3d(0%,0,0)' },
        from: (location) => {
            // Everytime a switch is made, we pull the direction from the route params
            const query = new URLSearchParams(location.search);
            const direction = query.get('transition') as TransitionDirection;

            // Then we load the correct css from the map
            return Transitions.get(direction) || {};
        },
        config: { duration: 200 },
    });

    return (
        <>
            {transitions.map(({ item: location, props, key }) => (
                <Animated 
                    key={key} 
                    style={props}
                >
                    <Switch location={location}>
                        {children}
                    </Switch>
                </Animated>
            ))}
        </>
    );
}

        
export default AnimatedSwitch;