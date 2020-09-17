import React, { Component, useRef, useEffect, PropsWithChildren, HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Transition, config } from 'react-spring/renderprops';
import { GhostButton } from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp } from 'app/assets/fa-light';

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
    padding: 10vh 0;
`;

const StyledDialog = styled.div`
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0,0,0,0.07), 
                0 2px 4px rgba(0,0,0,0.07), 
                0 4px 8px rgba(0,0,0,0.07), 
                0 8px 16px rgba(0,0,0,0.07),
                0 16px 32px rgba(0,0,0,0.07), 
                0 32px 64px rgba(0,0,0,0.07);
    background-color: white;
    min-width: 50vw;
    min-height: 25h;
    max-height: 80vh;
    max-width: 80vw;
    padding-top: 32px;
    overflow-y: auto;
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
    background: white;
    top: 0;
    left: 0;
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
    }

    render(): JSX.Element {
        const { isOpen, onRequestClose, children } = this.props;

        return createPortal((
            <Transition
                items={isOpen}
                from={{ transform: 'translate3d(0,-40px,0)', opacity: 0, backgroundOpacity: 0 }}
                enter={() => async (next: NextFunc) => {
                    next({ backgroundOpacity: 1 })
                    await new Promise((resolve) => setTimeout(resolve, 200))
                    await next({ transform: 'translate3d(0,0px,0)', opacity: 1 })
                }}
                leave={{ transform: 'translate3d(0,-40px,0)', opacity: 0, backgroundOpacity: 0 }}
                config={config.wobbly}
            >
                {isOpen => isOpen &&
                    (({ backgroundOpacity, ...props }: SpringProps) => 
                        <Container style={{ opacity: backgroundOpacity }}>
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
                    )
                }
            </Transition>
        ), this.element);
    }
}

export default Modal;