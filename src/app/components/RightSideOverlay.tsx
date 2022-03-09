import React, { PropsWithChildren } from 'react';
import { GhostButton } from 'app/components/Button';
import styled, { css } from 'styled-components';
import { animated, useTransition } from 'react-spring';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Shadow } from 'app/styles/snippets';
import usePrevious from 'app/utilities/usePrevious';

export type RightSideOverlayProps = PropsWithChildren<{
    onClose?: () => void;
    marginTop?: number;
    overlay?: boolean;
}>;

const Container = styled.div`
    pointer-events: all;
    padding-bottom: 1em;

    code {
        margin-bottom: 0;
    }
`;

export const CloseButton = styled(GhostButton)`
    margin-left: 8px;
    color: var(--color-gray-400);
    
    &:hover {
        color: var(--color-gray-800);
    }
`;

export const Section = styled.div<{ well?: boolean }>`
    margin: 24px 36px;

    p:first-child {
        margin-top: 0;
    }

    p:last-child {
        margin-bottom: 0;
    }

    img {
        max-width: 100%;
        height: auto;
        border-radius: 5px;
    }

    ${(props) => props.well && css`
        background-color: var(--color-gray-100);
        padding: 16px 24px;
        border-radius: 8px;
        margin: 8px 16px;
        overflow: hidden;
        font-family: var(--font-heading);
    `}
`;

export const DetailListItem = styled.div`
    display: flex;

    &:not(:last-child) {
        margin-bottom: 4px;
    }

    & > * {
       flex: 0 1 auto; 
       color: var(--color-gray-800);
       overflow: hidden;
       white-space: nowrap;
    }

    & > *:first-child {
        margin-right: 12px;
        flex: 0 0 auto;
    }
`;

export const RightSideOverlayOffset = styled.div`
    margin-top: 50px;
    position: relative;
    height: 100%;
`;

export const AbsolutePosition = styled(animated.div)`
    position: absolute;
    right: 8px;
    top: 58px;
    background-color: var(--color-background);
    border-radius: 8px;
    width: 33%;
    ${Shadow};
`;

const RightSideOverlay = (props: RightSideOverlayProps): JSX.Element => {
    const { 
        onClose: handleClose,
        children,
        marginTop,
        overlay,
        ...otherProps
    } = props;

    const previousChildren = usePrevious(children);
    const transitions = useTransition(children, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: {
            tension: 300,
            friction: 20,
        },
        immediate: !!children && !!previousChildren,
    });

    // Optionally wrap the overlay in an absolute position
    const Wrapper = overlay ? AbsolutePosition : animated.div;

    return transitions(({ opacity }, items) => 
        items ? (
            <Wrapper
                style={{ 
                    opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1] }),
                    transform: opacity.to((x: number) => `translateX(${-x * 20 + 20}%)`),
                    marginTop,
                }}
                {...otherProps}
            >
                <Container>
                    {handleClose ? 
                        <CloseButton onClick={handleClose}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </CloseButton>
                        : null}
                    {items || ''}
                </Container>
            </Wrapper>
        ) : null,
    );
};

export default RightSideOverlay;