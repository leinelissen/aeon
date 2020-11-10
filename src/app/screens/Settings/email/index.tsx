import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import { List, NavigatableListEntry, PanelBottomButtons, RowHeading, SplitPanel } from 'app/components/PanelGrid';
import RightSideOverlay, { Section } from 'app/components/RightSideOverlay';
import { H2 } from 'app/components/Typography';
import { MarginLeft } from 'app/components/Utility';
import { State } from 'app/store';
import theme from 'app/styles/theme';
import Email from 'app/utilities/Email';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import NewAccountModal from './components/NewAccountModal';

function EmailSettings({ settingId: selectedAccount }: { settingId?: string }): JSX.Element {
    const { all, byId } = useSelector((state: State) => state.email.accounts);
    const deleteAccount = useCallback(() => {
        if (window.confirm(`Are you sure you want to delete ${selectedAccount}?`)) {
            Email.delete(selectedAccount) 
        }
    }, [selectedAccount]);


    return (
        <>
            <SplitPanel>
                <List>
                    <RowHeading>
                        Email accounts are necessary for some providers that do not have an automated way of processing data requests. By linking an email-address associated with your accounts, Aeon can send emails and track responses to help make it easy for you.
                    </RowHeading>
                    {all.map(account => (
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
                                <H2>
                                    <FontAwesomeIcon icon={Email.getIcon(selectedAccount)} />
                                    <MarginLeft>{selectedAccount}</MarginLeft>
                                </H2>
                            </Section>
                            <Section>
                                <p>This emailaddress is used to check on data requests associated with the account.</p>
                            </Section>
                            <Section>
                                <p>By deleting this account, Aeon will no longer have access to it. Requests that are in progress with this e-mail address may be cancelled as a result.</p>
                                <Button backgroundColor={theme.colors.red} icon={faTimes} fullWidth onClick={deleteAccount}>
                                    Delete {selectedAccount}
                                </Button>
                            </Section>
                        </>
                    </RightSideOverlay>
                }
            </List>
        </>
    );
}

export default EmailSettings;