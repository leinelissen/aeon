import { List, PanelBottomButtons, RowHeading, SplitPanel } from 'app/components/PanelGrid';
import React from 'react';
import NewAccountModal from './components/NewAccountModal';

function EmailSettings(): JSX.Element {
    return (
        <>
            <SplitPanel>
                <List>
                    <RowHeading>
                        Email accounts are necessary for some providers that do not have an automated way of processing data requests. By linking an email-address associated with your accounts, Aeon can send emails and track responses to help make it easy for you.
                    </RowHeading>
                </List>
                <PanelBottomButtons>
                    <NewAccountModal />
                </PanelBottomButtons>
            </SplitPanel>
        </>
    );
}

export default EmailSettings;