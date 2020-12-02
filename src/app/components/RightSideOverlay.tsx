import React, { PropsWithChildren } from 'react';
import { GhostButton } from 'app/components/Button';
import styled from 'styled-components';
import { Transition } from 'react-spring/renderprops'
import { slideProps, SlideDirection } from 'app/components/SlideIn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from 'app/assets/fa-light';

export type RightSideOverlayProps = PropsWithChildren<{
    onClose?: () => void;
}>;

const Container = styled.div`
    position: absolute;
    z-index: 2;
    height: 100%;
    width: 100%;
    max-width: 500px;
    right: 0;
    top: 0;
    pointer-events: none;
`;

const InnerContainer = styled.div`
    position: relative;
    margin: 10px;
    border-radius: 16px;
    padding-top: 16px;
    overflow-y: auto;
    max-height: calc(100% - 20px);
    background-color: white;
    pointer-events: all;
    box-shadow: 0 1px 1px rgba(0,0,0,0.01), 
              0 2px 2px rgba(0,0,0,0.01), 
              0 4px 4px rgba(0,0,0,0.01), 
              0 8px 8px rgba(0,0,0,0.01), 
              0 16px 16px rgba(0,0,0,0.01), 
              0 32px 32px rgba(0,0,0,0.01);
`;

export const CloseButton = styled(GhostButton)`
    position: absolute;
    left: 16px;
    top: 8px;
`;

export const Section = styled.div<{ smallPadding?: boolean}>`
    border-bottom: 1px solid #eee;
    padding: ${props => props.smallPadding ? 15: 25}px;

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

const RightSideOverlay = (props: RightSideOverlayProps): JSX.Element => {
    const { 
        onClose: handleClose,
        children,
    } = props;

    return (
        <Transition
            items={children}
            {...slideProps(SlideDirection.RIGHT)}
        >
            {children => children && 
                (props =>
                    <Container style={props}>
                        <InnerContainer>
                            {handleClose ? 
                                <CloseButton onClick={handleClose}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </CloseButton>
                                : null}
                            {children}
                        </InnerContainer>
                    </Container>
                )
            }
        </Transition>
    );
};

export default RightSideOverlay;