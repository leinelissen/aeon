import React from 'react';
import { GhostButton } from 'app/components/Button';
import styled from 'styled-components';
import { Transition } from 'react-spring/renderprops'
import { slideProps, SlideDirection } from 'app/components/SlideIn';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from 'app/assets/fa-light';

export interface RightSideOverlayProps {
    children: JSX.Element;
    onClose: () => void;
}

const Container = styled.div`
    position: absolute;
    background-color: white;
    z-index: 2;
    font-size: 14px;
    width: 33vw;
    max-height: calc(100% - 20px);
    right: 10px;
    margin: 10px;
    border-radius: 16px;
    padding-top: 16px;
    overflow-y: auto;
    box-shadow: -1px 0 1px rgba(0,0,0,0.01), 
              -2px 0 2px rgba(0,0,0,0.01), 
              -4px 0 4px rgba(0,0,0,0.01), 
              -8px 0 8px rgba(0,0,0,0.01), 
              -16px 0 16px rgba(0,0,0,0.01), 
              -32px 0 32px rgba(0,0,0,0.01);
`;

export const CloseButton = styled(GhostButton)`
    position: absolute;
    left: 16px;
    top: 8px;
`;

export const Section = styled.div`
    border-bottom: 1px solid #eee;
    padding: 16px 32px;

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
        children
    } = props;

    return (
        <Transition
            items={children}
            {...slideProps(SlideDirection.RIGHT)}
        >
            {children => children && 
                (props =>
                    <Container style={props}>
                        <CloseButton onClick={handleClose}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </CloseButton>
                        {children}
                    </Container>
                )
            }
        </Transition>
    );
};

export default RightSideOverlay;