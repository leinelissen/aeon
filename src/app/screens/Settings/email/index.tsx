import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { GhostButton } from 'app/components/Button';
import { List, NavigatableListEntry, PanelBottomButtons, RowDescription, SplitPanel } from 'app/components/PanelGrid';
import RightSideOverlay, { Section } from 'app/components/RightSideOverlay';
import { MarginLeft } from 'app/components/Utility';
import { State } from 'app/store';
import Email from 'app/utilities/Email';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import NewAccountModal from './components/NewAccountModal';
import { IconBadgeWithTitle } from 'app/components/IconBadge';

function EmailSettings({ settingId: selectedAccount }: { settingId?: string }): JSX.Element {
    const navigate = useNavigate();
    const { all, byId } = useSelector((state: State) => state.email.accounts);
    const deleteAccount = useCallback(async () => {
        // GUARD: Double-check the user wants to actually delete the account
        if (window.confirm(`Are you sure you want to delete ${selectedAccount}?`)) {
            // Delete the account
            await Email.delete(selectedAccount); 
            
            // Then return to the previous menu
            navigate('/settings/email-accounts');
        }
    }, [selectedAccount]);

    return (
        <>
            <SplitPanel>
                <List>
                    <RowDescription>
                        Email accounts are necessary for some providers that do not have an automated way of processing data requests. By linking an email-address associated with your accounts, Aeon can send emails and track responses to help make it easy for you.
                    </RowDescription>
                    {all.map((account) => (
                        <NavigatableListEntry key={account} to={`/settings/email-accounts/${account}`}>
                            <FontAwesomeIcon icon={Email.getIcon(byId[account])} />
                            <MarginLeft>{account}</MarginLeft>
                        </NavigatableListEntry>
                    ))}
                </List>
                <PanelBottomButtons>
                    <NewAccountModal />
                </PanelBottomButtons>
            </SplitPanel>
            <List>
                {selectedAccount && 
                    <RightSideOverlay>
                        <>
                            <Section>
                                <IconBadgeWithTitle icon={Email.getIcon(selectedAccount)}>
                                    {selectedAccount}
                                </IconBadgeWithTitle>
                            </Section>
                            <Section>
                                <p>This email address is used to check on data requests associated with the account.</p>
                            </Section>
                            <Section>
                                <p>By deleting this account, Aeon will no longer have access to it. Requests that are in progress with this e-mail address may be cancelled as a result.</p>
                                <GhostButton backgroundColor="red" icon={faTrash} fullWidth onClick={deleteAccount}>
                                    Delete {selectedAccount}
                                </GhostButton>
                            </Section>
                        </>
                    </RightSideOverlay>
                }
            </List>
        </>
    );
}

export default EmailSettings;