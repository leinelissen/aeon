import React from 'react';
import { List, NavigatableListEntry, PanelGrid, RowHeading } from 'app/components/PanelGrid';
import { faEnvelope } from 'app/assets/fa-light';
import EmailSettings from './email';
import { useParams } from 'react-router-dom';
import { RouteProps } from '../types';

type CategoryPanel = (props: { settingId?: string }) => JSX.Element;

/**
 * This objects maps a category paramater to a particular settings panel, so
 * that all settings are seperated out into their own components.
 */
const mapCategoryToPanel: Record<string, CategoryPanel> = {
    'email-accounts': EmailSettings
}

function Settings(): JSX.Element {
    const { category, settingId } = useParams<RouteProps['settings']>();
    const SettingsPanel = category && category in mapCategoryToPanel
        ? mapCategoryToPanel[category] 
        : List;

    return (
        <PanelGrid>
            <List>
                <RowHeading>Categories</RowHeading>
                <NavigatableListEntry to="/settings/email-accounts" icon={faEnvelope}>
                    Email Accounts
                </NavigatableListEntry>
            </List>
            <SettingsPanel settingId={settingId} />
        </PanelGrid>
    );
}

export default Settings;