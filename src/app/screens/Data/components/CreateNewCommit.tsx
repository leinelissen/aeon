import React, { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faSave } from 'app/assets/fa-light';
import Button from 'app/components/Button';
import Code from 'app/components/Code';
import { Label, TextInput } from 'app/components/Input';
import Modal from 'app/components/Modal';
import { MarginLeft } from 'app/components/Utility';
import DataType from 'app/utilities/DataType';
import { DeletedData, GroupedData } from '../types';
import { useHistory, useLocation } from 'react-router-dom';
import Store from 'app/store';
import { TransitionDirection } from 'app/utilities/AnimatedSwitch';
import { Commit, ExtractedDataDiff } from 'main/lib/repository/types';
import { RouteProps } from 'app/screens/types';

interface Props {
    isModalOpen: boolean;
    deletedData: DeletedData;
    groupedData: GroupedData;
}

function CreateNewCommit({ isModalOpen, deletedData, groupedData }: Props): JSX.Element {
    // Setup dependencies
    const history = useHistory();
    const location = useLocation<RouteProps['data']>();
    const store = Store.useStore();

    // Create handlers for setting a commit message
    const [ commitMessage, setCommitMessage ] = useState('');
    const handleSetCommitMessage = useCallback((event: ChangeEvent<HTMLInputElement>) => 
        setCommitMessage(event.target.value)
    , [setCommitMessage]);

    // Create handler for closing modal
    const closeModal = useCallback(() => {
        history.push(`/data/${location.state.category}/${location.state.datumId}`)
    }, [history, location]);

    // Create handler for creating new commit
    const saveIdentity = useCallback(() => {
        // First, we'll retrieve all individual datapoints that have been deleted
        const deleted = Object.keys(deletedData).flatMap((key) => 
            deletedData[key].map((i: number) => groupedData[key][i])
        );

        // Then we'll construct a commit object that can be easily displayed in the log screen
        const commit: Commit & { diff: ExtractedDataDiff } = { 
            oid: 'new-commit',
            parents: [],
            message: commitMessage,
            author: {
                when: Math.floor(new Date().getTime() / 1000),
                name: undefined,
                email: undefined,
            },
            diff: { 
                deleted,
                updated: [],
                added: [],
            },
        };

        // Then, we'll store this commit in the store
        store.set('newCommit')(commit);

        // Lastly, we'll navigate back to the log
        history.push(`/timeline?transition=${TransitionDirection.left}&newCommit=true`);
    }, [deletedData, groupedData, commitMessage]);

    // Determine if there are any changes to the current identity
    const hasChanges = useMemo(() => !!Object.values(deletedData).find(c => c.length > 0), [deletedData]);

    return (
        <Modal isOpen={isModalOpen} onRequestClose={closeModal}>
            <p style={{ padding: "0 16px" }}>You are about to commit a new identity, with the following changes. As with data requests, it may take some time for this data to actually be deleted from the platforms.</p>
            <p style={{ padding: "0 16px" }}><i>This action is not reversible. However, your data will remain saved locally in Aeon.</i></p>
            {Object.keys(deletedData).map(category =>
                deletedData[category].map(key =>
                    <Code removed key={`preview-changes-${category}-${key}`}>
                        <span><FontAwesomeIcon icon={faMinus} fixedWidth /></span>
                        <MarginLeft><FontAwesomeIcon icon={DataType.getIcon(groupedData[category][key].type)} fixedWidth /></MarginLeft>
                        <MarginLeft>{DataType.toString(groupedData[category][key])}</MarginLeft>
                    </Code>
                )
            )}
            <Label style={{ padding: 16 }}>
                Identity Change Description 
                <TextInput
                    placeholder={hasChanges
                        ? `Delete ${Object.keys(deletedData).find(d => d.length)} from identity...`
                        : "Delete part of identity..."}
                    onChange={handleSetCommitMessage}
                    value={commitMessage}
                />
            </Label>
            <Button
                icon={faSave}
                style={{ margin: '16px auto' }}
                onClick={saveIdentity}
                data-telemetry-id="confirm-save-new-identity"
                disabled={!commitMessage}
            >
                Save new Identity
            </Button>
        </Modal>
    );
}

export default CreateNewCommit;