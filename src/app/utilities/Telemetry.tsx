import React, { Component, createRef } from 'react';
import { addTelemetryLog } from 'app/store/telemetry/actions';
import { State as AppState } from 'app/store';
import { RouteComponentProps } from 'react-router';
import Modal from 'app/components/Modal';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Event } from 'app/store/telemetry';

const TextArea = styled.textarea`
    border: 1px solid #eee;
    background-color: #fafafa;
    border-radius: 8px;
    width: 50vw;
    height: 50vh;
    margin: 8px;
    padding: 8px;
    font-size: 12px;
    color: #666;
    font-family: 'IBM Plex Mono';
    font-weight: 300;
`;

interface State {
    isOpen: boolean;
}

interface Props {
    telemetry: AppState['telemetry'];
    addTelemetryLog: (payload: Parameters<typeof addTelemetryLog>[0]) => void;
}

class Telemetry extends Component<Props & RouteComponentProps, State> {
    state = {
        isOpen: false,
    }

    ref = createRef<HTMLTextAreaElement>();

    componentDidMount() {
        document.addEventListener('click', this.handleClick);
        document.addEventListener('keydown', this.handleKeyDown);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClick);
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    createEvent = (data: Pick<Event, 'event' | 'element'>) => {
        const { history, addTelemetryLog } = this.props;

        addTelemetryLog({
            ...data,
            timestamp: new Date().toLocaleString('en-GB'),
            route: history.location.pathname,
        });
    }

    handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLDivElement;

        this.createEvent({ 
            event: 'click',
            element: target.getAttribute('data-telemetry-id'),
        });
    }
    
    handleKeyDown = (event: KeyboardEvent) => {
        // this.createEvent({ event: 'keydown', key: event.key });

        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            this.setState({ isOpen: true });
        }
    }

    handleRequestClose = () => this.setState({ isOpen: false });

    handleTextAreaClick = () => {
        this.ref.current?.focus();
        this.ref.current?.select();
    }
        
    render(): JSX.Element {
        const { isOpen } = this.state;
        const { telemetry } = this.props;

        return (
            <Modal isOpen={isOpen} onRequestClose={this.handleRequestClose}>
                <TextArea readOnly ref={this.ref} onClick={this.handleTextAreaClick}>
                    {JSON.stringify(telemetry, null, 4)}
                </TextArea>
            </Modal>
        );
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        telemetry: state.telemetry
    };
}

const mapDispatchToProps = {
    addTelemetryLog
}

export default connect(mapStateToProps, mapDispatchToProps)(Telemetry);