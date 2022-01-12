import { Placement } from '@popperjs/core';
import React, { PropsWithChildren, ReactNode, useCallback, useMemo, useState } from 'react';
import { usePopper } from 'react-popper';
import { animated, useTransition } from 'react-spring';
import styled from 'styled-components';

const StyledTooltip = styled(animated.div)`
    background-color: var(--color-background);
    border-radius: 4px;
    padding: 4px 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 
                0 2px 4px rgba(0,0,0,0.04), 
                0 4px 8px rgba(0,0,0,0.04), 
                0 8px 16px rgba(0,0,0,0.04);
`;

function getTransitionConfig(placement: Placement) {
    switch (placement) {
        case 'left':
        case 'left-end':
        case 'left-start':
            return {
                from: { opacity: 0, pos: [-25, 0] },
                enter: { opacity: 1, pos: [0, 0] },
                leave: { opacity: 0, pos: [-25, 0] },
            };
        case 'right':
        case 'right-end':
        case 'right-start':
            return {
                from: { opacity: 0, pos: [25, 0] },
                enter: { opacity: 1, pos: [0, 0] },
                leave: { opacity: 0, pos: [25, 0] },
            };
        case 'bottom':
        case 'bottom-end':
        case 'bottom-start':
        default:
            return {
                from: { opacity: 0, pos: [0, -25] },
                enter: { opacity: 1, pos: [0, 0] },
                leave: { opacity: 0, pos: [0, -25] },
            };
        case 'top':
        case 'top-end':
        case 'top-start':
            return {
                from: { opacity: 0, pos: [0, 25] },
                enter: { opacity: 1, pos: [0, 0] },
                leave: { opacity: 0, pos: [0, 25] },
            };
    }
}

type TooltipProps = PropsWithChildren<{
    title: ReactNode;
    placement?: Placement;
}>;

/**
 * This component will render a tooltip (passed as `title`) when hovering over a
 * component (passed as `children`). The implementation is deliberately simple.
 */
function Tooltip({ title, children, placement = 'auto' }: TooltipProps) {
    // Track whether the child components are being hovered
    const [isHovered, setHovered] = useState(false);

    // Set refs for Popper
    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);

    // Create config for popper
    const { styles, attributes, state } = usePopper(referenceElement, popperElement, {
        placement,
        modifiers: [
            { name: 'offset', options: { offset: [0, 8] } },
            { name: 'hide' },
        ],
    });

    // Define callback handlers for hover events
    const handleMouseOver = useCallback(() => setHovered(true), [setHovered]);
    const handleMouseOut = useCallback(() => setHovered(false), [setHovered]);
    

    // Create config for react-spring
    const config = useMemo(() => getTransitionConfig(state?.placement), [state?.placement]);
    const transitions = useTransition(isHovered, {
        ...config,
        config: {
            tension: 300,
            friction: 20,
        },
    });

    return (
        <>
            <span
                ref={setReferenceElement}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
            >
                {children}
            </span>
            {transitions(({ opacity, pos }, item) => (
                item && (
                    <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
                        <StyledTooltip style={{
                            opacity,
                            transform: pos.to((x, y) => `translate3d(${x}%,${y}%,0)`),
                        }}>
                            {title}
                        </StyledTooltip>
                    </div>
                )
            ))}
        </>
    );
}

export default Tooltip;