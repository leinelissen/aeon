import { app } from "electron";

// This is the path our files should be stored under
export const APP_DATA_PATH = process.env.NODE_ENV === 'production' ? app.getPath('userData') : app.getAppPath();
