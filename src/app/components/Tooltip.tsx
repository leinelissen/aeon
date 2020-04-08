import { Manager, Reference, PopperProps, Popper } from 'react-popper';
import { Transition, config } from 'react-spring/renderprops';
import React, { PureComponent, ReactNode } from 'react';
import styled from 'styled-components';

interface State {
    isHovered: boolean;
}

interface TooltipContainerProps {
    children: (props: {
        handleChange: (isHovered: boolean) => void;
        isHovered: boolean;
    }) => ReactNode;
}

export class TooltipContainer extends PureComponent<TooltipContainerProps, State> {
    state = {
        isHovered: false
    }

    handleChange = (isHovered: boolean) => this.setState({ isHovered });

    render(): ReactNode {
        return (
            <Manager>
                {this.props.children({
                    handleChange: this.handleChange,
                    isHovered: this.state.isHovered,
                })}
            </Manager>
        );
    }
}

interface HoverAreaProps {
    onChange: (isHovered: boolean) => void;
}

export class HoverArea extends PureComponent<HoverAreaProps, State> {
    state = {
        isHovered: true
    }

    handleMouseEnter = (): void => {
        this.setState({ isHovered: true });
        this.props.onChange(true);
    }

    handleMouseLeave = () => {
        this.setState({ isHovered: false });
        this.props.onChange(false);
    }

    render(): JSX.Element {
        return (
            <Reference>
                {({ ref }) => (
                    <div ref={ref} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                        {this.props.children}
                    </div>
                )}
            </Reference>
        )
    }
}

interface TooltipProps extends Omit<PopperProps, 'children'> {
    active: boolean;
    children: JSX.Element;
}

const Container = styled.div`
    border: 1px solid #eee;
    background-color: white;
    padding: 16px;
    max-width: 200px;
    border-radius: 10px;
    transform-origin: bottom center;
    font-size: 12px;
    box-shadow: 0 1px 1px rgba(0,0,0,0.02), 
              0 2px 2px rgba(0,0,0,0.02), 
              0 4px 4px rgba(0,0,0,0.02), 
              0 8px 8px rgba(0,0,0,0.02), 
              0 16px 16px rgba(0,0,0,0.02), 
              0 32px 32px rgba(0,0,0,0.02);
`;


export const Arrow = styled('div')`
    position: absolute;
    width: 1em;
    height: 1em;

    &[data-placement*='bottom'] {
        top: 0;
        left: 0;
        margin-top: -0.9em;

        &::before, &::after {
            border-width: 0 1em 0.5em 1em;
            border-color: transparent transparent white transparent;
        }
        &::before {
            border-color: transparent transparent salmon transparent;
        }
    }
    &[data-placement*='top'] {
        bottom: 0;
        left: 0;
        margin-bottom: -0.9em;
        &::before, 
        &::after {
            border-width: 1em 0.75em 0 0.75em;
            border-color: white transparent transparent transparent;
        }
        &::before {
            transform: translateY(1px);
            border-color: #eee transparent transparent transparent;
        }
    }
    &[data-placement*='right'] {
        left: 0;
        margin-left: -0.9em;
        &::before {
            border-width: 1.5em 1em 1.5em 0;
            border-color: transparent white transparent transparent;
        }
    }
    &[data-placement*='left'] {
        right: 0;
        margin-right: -0.9em;
        &::before {
            border-width: 1.5em 0 1.5em 1em;
            border-color: transparent transparent transparent white;
        }
    }
    &::before,
    &::after {
        content: '';
        margin: auto;
        display: block;
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
    }
`;

const modifiers = [
    {
        name: 'offset',
        options: {
            offset: [16, 16],
        }
    },
    {
        name: 'preventOverflow',
        options: {
            padding: 8,
        },
    },
]

export class Tooltip extends PureComponent<TooltipProps> {
    render(): JSX.Element {
        const { children, active, ...props } = this.props;

        return (
            <Transition
                items={active}
                from={{ opacity: 0.6, top: -20 }}
                enter={{ opacity: 1, top: 0 }}
                leave={{ opacity: 0, top: -20 }}
                config={config.stiff}
            >
                {(show) => show && (({ opacity, top }) => (
                    <Popper {...props} modifiers={modifiers}>
                        {({ ref, style: popperStyles, placement, arrowProps }) => (
                            <Container 
                                data-placement={placement}
                                ref={ref}
                                style={{
                                    ...popperStyles, 
                                    opacity,
                                    transform: `${popperStyles.transform}
                                    `,
                                }}
                            >
                                <>{this.props.children}</>
                                <Arrow ref={arrowProps.ref} style={arrowProps.style} data-placement={placement} />
                            </Container>
                        )}
                    </Popper>
                ))}
            </Transition>
        );
    }
}