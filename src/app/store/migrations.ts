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
    }
}

export default migrations;