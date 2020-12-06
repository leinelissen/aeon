import { MigrationManifest } from 'redux-persist';

const migrations: MigrationManifest = {
    /**
     * Migrate from the undux-based store to Redux
     */
    5: (state) => {
        return {
            _persist: state._persist,
            onboarding: state.onboardingComplete,
            telemetry: state.telemetry,
            newCommits: state.newCommit || [],
        }
    },
    6: (state) => {
        return {
            ...state,
            requests: {
                availableProviders: [],
                all: [],
                byKey: {},
                isLoading: state.accounts.isLoading,
            }
        }
    },
    7: (state) => {
        const { requests, ...rest} = state;
        return {
            ...rest,
            accounts: requests,
        }
    }
}

export default migrations;