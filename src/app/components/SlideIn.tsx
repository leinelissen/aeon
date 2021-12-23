import React from 'react';
import { config, useTransition, animated, UseTransitionProps } from 'react-spring';

export enum SlideDirection {
    UP,
    RIGHT,
    LEFT,
    DOWN,
}

const defaultAnimation = {
    transform: 'translate3d(0%, 0%, 0)',
    opacity: 1,
}

const Transitions: Map<SlideDirection, Record<string, unknown>> = new Map([
    [SlideDirection.LEFT, {
        opacity: 0,
        transform: 'translate3d(-100%,0,0)',
    }],
    [SlideDirection.RIGHT, {
        opacity: 0,
        transform: 'translate3d(100%,0,0)',
    }],
    [SlideDirection.UP, {
        opacity: 0,
        transform: 'translate3d(0,100%,0)',
    }],
    [SlideDirection.DOWN, {
        opacity: 0,
        transform: 'translate3d(0,-100%,0)',
    }],
]);

interface Props {
    visible: boolean;
    direction: SlideDirection;
    children: JSX.Element;
}

const SlideIn  = ({ visible, direction, children }: Props): JSX.Element => {
    const transitions = useTransition(visible, slideProps(direction));

    return <>
        {transitions(({ item, key, props }) =>
            item && <animated.div key={key} style={props}>{children}</animated.div>
        )}
    </>;
}

export function slideProps(direction: SlideDirection): Omit<UseTransitionProps<unknown>, 'items'> {
    return {
        enter: defaultAnimation,
        from: Transitions.get(direction),
        leave: Transitions.get(direction),
        config: config.stiff,
    };
}

export default SlideIn