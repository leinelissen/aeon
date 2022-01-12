import React from 'react';
import { Category, List, NavigatableListEntry, PanelGrid } from 'app/components/PanelGrid';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import EmailSettings from './email';
import { useParams } from 'react-router-dom';
import { RouteProps } from '../types';

type CategoryPanel = (props: { settingId?: string }) => JSX.Element;

/**
 * This objects maps a category paramater to a particular settings panel, so
 * that all settings are seperated out into their own components.
 */
const mapCategoryToPanel: Record<string, CategoryPanel> = {
    'email-accounts': EmailSettings,
};

function Settings(): JSX.Element {
    const { category, settingId } = useParams<RouteProps['settings']>();
    const SettingsPanel = category && category in mapCategoryToPanel
        ? mapCategoryToPanel[category] 
        : List;

    return (
        <PanelGrid>
            <List>
                <Category title="Categories">
                    <NavigatableListEntry to="/settings/email-accounts" icon={faEnvelope}>
                        Email Accounts
                    </NavigatableListEntry>
                </Category>
            </List>
            <SettingsPanel settingId={settingId} />
        </PanelGrid>
    );
}

export default Settings;