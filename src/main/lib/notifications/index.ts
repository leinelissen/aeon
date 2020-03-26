import { ipcMain, BrowserWindow, Notification } from 'electron';
import { NotificationTypes } from './types';
import WindowStore from 'main/lib/window-store';

const channelName = 'notifications';

class Notifications {
    public static success(message: string): void {
        const window = WindowStore.getInstance().window;
        window.webContents.send(channelName, NotificationTypes.SUCCESS, message);
    }
    
    public static info(message: string): void {
        const window = WindowStore.getInstance().window;
        window.webContents.send(channelName, NotificationTypes.INFO, message);
    }

    public static loading(message: string): void {
        const window = WindowStore.getInstance().window;
        window.webContents.send(channelName, NotificationTypes.LOADING, message);
    }

    public static warn(message: string): void {
        const window = WindowStore.getInstance().window;
        window.webContents.send(channelName, NotificationTypes.WARN, message);
    }

    public static error(message: string): void {
        const window = WindowStore.getInstance().window;
        window.webContents.send(channelName, NotificationTypes.ERROR, message);
    }
}

export default Notifications;