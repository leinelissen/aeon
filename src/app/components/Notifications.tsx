import { NotificationTypes } from 'main/lib/notifications/types';
import { Component } from 'react';
import cogoToast, { CTOptions } from 'cogo-toast';

class Notifications extends Component {
    handler: EventHandlerNonNull;

    config: CTOptions = {
        position: 'top-right',
        hideAfter: 10,
    };

    componentDidMount(): void {
        window.api.on('notifications', this.handleMessage)
        console.log('Registered handler')
    }

    componentWillUnmount(): void {
        window.api.removeListener('notifications', this.handleMessage);
    }

    handleMessage = (event: Event, type: NotificationTypes, message: string): void => {
        console.log(event, type, message);
        switch (type) {
            case NotificationTypes.SUCCESS:
                cogoToast.success(message, this.config);
                break;
            case NotificationTypes.INFO:
                cogoToast.info(message, this.config);
                break;
            case NotificationTypes.LOADING:
                cogoToast.loading(message, this.config);
                break;
            case NotificationTypes.WARN:
                cogoToast.warn(message, this.config);
                break;
            case NotificationTypes.ERROR:
                cogoToast.error(message, this.config);
                break;
            default:
                cogoToast.info(message, this.config);
                break;
        }
    }

    render(): null {
        return null;
    }
}

export default Notifications;