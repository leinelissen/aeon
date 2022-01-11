import React, { PropsWithChildren } from 'react';
import { GhostButton } from 'app/components/Button';
import styled from 'styled-components';
import { Transition } from 'react-spring'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from 'app/assets/fa-light';

export type RightSideOverlayProps = PropsWithChildren<{
    onClose?: () => void;
    marginTop?: number;
}>;

const Container = styled.div`
    pointer-events: all;

    code {
        margin-bottom: 0;
    }
`;

export const CloseButton = styled(GhostButton)`
    position: absolute;
    left: 16px;
    top: 8px;
`;

export const Section = styled.div<{ smallPadding?: boolean}>`
    padding: ${props => props.smallPadding ? 15: 25}px;

    &:not(:last-child) {
        border-bottom: 1px solid var(--color-border);
    }

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
`;

export const DetailListItem = styled.div`
    display: flex;

    & > *:first-child {
        margin-right: 8px;
    }
`;

export const RightSideOverlayOffset = styled.div`
    margin-top: 50px;
    position: relative;
    height: 100%;
`;

const RightSideOverlay = (props: RightSideOverlayProps): JSX.Element => {
    const { 
        onClose: handleClose,
        children,
        marginTop,
        ...otherProps
    } = props;

    return (
        <Transition
            items={children}
            from={{ opacity: 0 }}
            enter={{ opacity: 1 }}
        >
            {({ opacity }, items) => items ? (
                <Container
                    style={{ 
                        opacity: opacity.to({ range: [0.0, 1.0], output: [0, 1]}),
                        transform: opacity.to((x: number) => `translateX(${-x * 20 + 20}%)`),
                        marginTop,
                    }}
                    {...otherProps}
                >
                    {handleClose ? 
                        <CloseButton onClick={handleClose}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </CloseButton>
                        : null}
                    {items || ''}
                </Container>
            ) : null}
        </Transition>
    );
};

export default RightSideOverlay;