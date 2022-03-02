import { Dropdown, Label } from 'app/components/Input';
import { Margin, MarginSmall, PullCenter } from 'app/components/Utility';
import { State, useAppDispatch } from 'app/store';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncSelect, { AsyncProps } from 'react-select/async';
import { useSelector } from 'react-redux';
import { GroupBase } from 'react-select';
import styled from 'styled-components';
import Button from 'app/components/Button';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { createEmailAccount } from 'app/store/accounts/actions';
import { useNavigate } from 'react-router-dom';

export interface APIResponse {
    count: number;
    next: string;
    previous: null;
    results: Result[];
}

export interface Result {
    id: number;
    display_name: string;
    legal_name: string;
    url: string;
    department: string;
    street_address: null | string;
    city: null | string;
    neighbourhood: null | string;
    postal_code: null | string;
    region: null | string;
    country: string;
    postal_address: string;
    requires_identification: boolean | null;
    operating_countries: string[];
    custom_identifier: null | string;
    identifiers: string[];
    requests:Requests;
}

export interface Requests {
    url?:string;
    note?: string;
    email: string;
    access: Access;
    deletion:Access;
    portability: Access;
    correction: Access;
}

export interface Access {
    url?: string;
    note?: string;
}

const Select = styled(AsyncSelect)`
    & .Select__control {
        border: 1px solid #eee;
        padding: 6px 8px;
        font-family: var(--font-body);
    }
`;

function EmailProvider(): JSX.Element {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const emailAccounts = useSelector((state: State) => state.email.accounts.all);

    const [selectedEmail, setSelectedEmail] = useState(emailAccounts.length ? emailAccounts[0] : '');
    const [selectedOrganisation, setSelectedOrganisation] = useState<Result>(undefined);
    const [organisations, setOrganisations] = useState<Result[]>([]);
    
    // A handler responding to React-Select requesting more options
    const handleSearch: AsyncProps<unknown, false, GroupBase<unknown>>['loadOptions'] = useCallback(async (inputValue: string) => {
        // Retrieve a set of organisations from the MyDataDone right API
        const response = await fetch(`https://api.mydatadoneright.eu/api/v1/organizations.json?limit=5&q=${inputValue}`)
            .then((res) => res.json()) as APIResponse;

        // Translate the response to a react-select readable set of options
        const options = response.results.map((organisation) => {
            return {
                label: organisation.display_name,
                value: organisation.id,
            };
        });

        // Feed them back to react-select
        setOrganisations(response.results);
        return options;
    }, []);

    // Also create a handler for an organisation being selected
    const handleSelect = useCallback(({ value }: { value: number }) => {
        const organisation = organisations.find((d) => d.id === value);
        setSelectedOrganisation(organisation);
    }, [setSelectedOrganisation, organisations]);

    // Lastly, handle creating a email-account for the selected provider
    const handleCreate = useCallback(() => {
        dispatch(createEmailAccount({
            account: `${selectedOrganisation.display_name}_${selectedEmail}`,
            emailAccount: selectedEmail,
            organisation: selectedOrganisation.display_name,
            status: {},
            provider: 'email',
        }));
        navigate('/accounts');
    }, [selectedOrganisation, selectedEmail, navigate]);
    
    // Redirect a user to the Create New Email Account modal, when they select
    // the option from the email accounts dropdown
    useEffect(() => {
        if (selectedEmail === 'Create New Email Account...') {
            navigate('/settings/email-accounts?create-new-email-account');
            setSelectedEmail(emailAccounts.length ? emailAccounts[0] : '');
        }
    }, [selectedEmail, setSelectedEmail, navigate]);

    return (
        <Margin>
            <p>For organisations that do not offer dedicated manners of requesting data, there is always email. You will be able to send out a generated email, after which you can upload the retrieved data yourself.</p>
            <p>In order to use this provider, you must link an email address to Aeon. Selected a previously linked email address in the list below or link one first. Also select the organisation you wish to receive data from.</p>
            <Dropdown 
                options={[...emailAccounts, 'Create New Email Account...']}
                label="Email Account" 
                value={selectedEmail}
                onSelect={setSelectedEmail}
            />
            <Label>
                Organisation
                <Select
                    classNamePrefix="Select"
                    loadOptions={handleSearch}
                    onChange={handleSelect}
                    placeholder="Start typing to select..."
                />
            </Label>
            <MarginSmall>
                <PullCenter>
                    <Button 
                        disabled={!selectedEmail || !selectedOrganisation}
                        onClick={handleCreate}
                        icon={faEnvelope}
                    >
                        Create account for {selectedOrganisation?.display_name}
                    </Button>
                </PullCenter>
            </MarginSmall>
        </Margin>
    );
}

export default EmailProvider;