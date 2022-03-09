import React, { Component, useRef, useEffect, PropsWithChildren, HTMLAttributes, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Transition, config, animated } from 'react-spring';
import { GhostButton } from '../Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { LargeShadow } from 'app/styles/snippets';

interface SpringProps {
    transform?: string;
    backgroundOpacity?: number;
    opacity?: number;
    pointerEvents?: CSSProperties['pointerEvents'];
}
type NextFunc = (props: SpringProps) => Promise<void>;

interface Props {
    isOpen?: boolean;
    onRequestClose?: () => void;
}

const Container = styled(animated.div)`
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 10vh 0;
    z-index: 5000;
    /* backdrop-filter: blur(50px); */
    
    @media (prefers-color-scheme: dark) {
        background-color: #222222f0;
    }
    
    @media (prefers-color-scheme: light) {
        background-color: #eeeeeef0;
    }
`;

const StyledDialog = styled(animated.div)`
    border-radius: 8px;
    margin-top: 10vh;
    min-width: 50vw;
    min-height: 25h;
    max-height: 80vh;
    max-width: 700px;
    padding-top: 32px;
    overflow-y: auto;
    background-color: var(--color-modal-background);
    ${LargeShadow}
`;

type DialogProps = PropsWithChildren<
HTMLAttributes<HTMLDivElement>
>;

function Dialog(props: DialogProps): JSX.Element {
    const { children, ...rest } = props;
    const ref = useRef<HTMLDivElement>();

    useEffect(() => {
        ref.current?.focus();
    }, []);

    return (
        <StyledDialog  {...rest} ref={ref} tabIndex={0}>
            {children}
        </StyledDialog>
    );
}

const CloseButton = styled(GhostButton)`
    position: fixed;
    top: 0;
    left: 4px;
    padding: 16px;
`;

class Modal extends Component<Props> {
    element = document.getElementById('modal');

    handleBlur = (): void => this.props.onRequestClose();

    componentDidMount(): void {
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount(): void {
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key === 'Escape') {
            this.props.onRequestClose();
        }
    };

    handleContainerClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
        // GUARD: Check if the currenttarget is the parent where the events
        // orginate from.
        if (event.currentTarget === event.target) {
            this.props.onRequestClose();
        }   
    };

    render(): JSX.Element {
        const { isOpen, onRequestClose, children } = this.props;

        return createPortal((
            <Transition
                items={isOpen}
                from={{ transform: 'translate3d(0,-40px,0)', opacity: 0, backgroundOpacity: 0, pointerEvents: 'all' }}
                enter={() => async (next: NextFunc) => {
                    try {
                        next({ backgroundOpacity: 1, pointerEvents: 'all' }).catch(() => null);
                        await new Promise((resolve) => setTimeout(resolve, 200));
                        await next({ transform: 'translate3d(0,0px,0)', opacity: 1 });
                    } catch {
                        // Async animation may be interruped. We don't care
                        // about this, but we still need to catch an error so we
                        // can suppress any warnings about it to the user.
                    }
                }}
                leave={{ transform: 'translate3d(0,-40px,0)', opacity: 0, backgroundOpacity: 0, pointerEvents: 'none' }}
                config={config.wobbly}
            >
                {({ backgroundOpacity, pointerEvents, ...props }, item) => {
                    return item && (
                        <Container style={{ opacity: backgroundOpacity, pointerEvents }} onClick={this.handleContainerClick}>
                            <Dialog 
                                style={props}
                                // onBlur={this.handleBlur}
                            >
                                {children}
                                <CloseButton onClick={onRequestClose} data-telemetry-id="modal-close">
                                    <FontAwesomeIcon icon={faArrowUp} fixedWidth />
                                </CloseButton>
                            </Dialog>
                        </Container>
                    );
                }}
            </Transition>
        ), this.element);
    }
}

export default Modal;