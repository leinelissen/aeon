import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { Transition, config } from 'react-spring/renderprops';
import { GhostButton } from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/pro-light-svg-icons';

interface SpringProps {
    transform?: string;
    backgroundOpacity?: number;
    opacity?: number;
}
type NextFunc = (props: SpringProps) => Promise<void>;

interface Props {
    isOpen?: boolean;
    onRequestClose?: () => void;
}

const Container = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    background-color: #eeeeeecc;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: scroll;
    padding: 10vh 0;
`;

const Dialog = styled.div`
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.07), 
                0 2px 4px rgba(0,0,0,0.07), 
                0 4px 8px rgba(0,0,0,0.07), 
                0 8px 16px rgba(0,0,0,0.07),
                0 16px 32px rgba(0,0,0,0.07), 
                0 32px 64px rgba(0,0,0,0.07);
    background-color: white;
    min-width: 50vw;
    min-height: 25vw;
    padding-top: 32px;
`;

const CloseButton = styled(GhostButton)`
    position: absolute;
    top: 0;
    left: 0;
    padding: 8px;
`;

class Modal extends Component<Props> {
    element = document.getElementById('modal');

    render() {
        const { isOpen, onRequestClose, children } = this.props;

        return ReactDOM.createPortal((
            <Transition
                items={isOpen}
                from={{ transform: 'translate3d(0,-40px,0)', opacity: 0, backgroundOpacity: 0, }}
                enter={() => async (next: NextFunc) => {
                    await next({ backgroundOpacity: 1 })
                    await next({ transform: 'translate3d(0,0px,0)', opacity: 1 })
                }}
                leave={{ transform: 'translate3d(0,-40px,0)', opacity: 0, backgroundOpacity: 0, }}
                config={config.wobbly}
            >
                {(isShown: boolean) => isShown &&
                    (({ backgroundOpacity, ...props }: SpringProps) => 
                        <Container style={{ opacity: backgroundOpacity }}>
                            <Dialog style={props}>
                                {children}
                                <CloseButton onClick={onRequestClose}>
                                    <FontAwesomeIcon icon={faArrowUp} fixedWidth />
                                </CloseButton>
                            </Dialog>
                        </Container>
                    )
                }
            </Transition>
        ), this.element);
    }
}

export default Modal;