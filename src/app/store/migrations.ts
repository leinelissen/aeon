import { MigrationManifest } from 'redux-persist';

const migrations: MigrationManifest = {
    /**
     * Migrate from the undux-based store to Redux
     */
    5: (state: any) => {
        return {
            _persist: state._persist,
            onboarding: state.onboardingComplete,
            telemetry: state.telemetry,
            newCommits: state.newCommit || [],
        }
    },
    6: (state: any) => {
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
    7: (state: any) => {
        const { requests, ...rest} = state;
        return {
            ...rest,
            accounts: requests,
        }
    },
    8: (state) => {
        return {
            ...state,
            onboarding: {
                initialisation: false,
                tour: [],
            }
        }
    },
    9: (state: any) => {
        return {
            ...state,
            accounts: {
                ...state.accounts,
                emailProviders: {
                    all: [],
                    byKey: {},
                }
            }
        }
    }
}

export default migrations;