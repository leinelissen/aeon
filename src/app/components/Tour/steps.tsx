import GraphExplainer from 'app/screens/Graph/explainer';
import React, { useEffect } from 'react';
import { ReactourStep } from 'reactour';

/**
 * Clicks an element that is targeted by the supplied selector on mount. This is
 * especially helpful if you need to guide a user through multiple screens.
 */
const ClickOnMount = ({ selector }: { selector: string }): JSX.Element => {
    useEffect(() => {
        const el = document.querySelector(selector);
        console.log(el);
        (el as HTMLElement)?.click();
    }, [selector]);

    return null;
};

export type TourKeys = '/screen/timeline'
    | '/screen/graph'
    | '/screen/data'
    | '/screen/settings'
    | '/screen/accounts/has-accounts'
    | '/screen/accounts/no-accounts'
    | '/screen/accounts/new-account'
    | '/screen/erasure';

const steps: Record<TourKeys, ReactourStep[]> = {
    '/screen/timeline': [
        {
            content: 'This is the timeline! The timeline is where you get a chronological overview of all of your data. Every time Aeon retrieves data from the internet, a new entry is added to this list. Use this screen to get a grip on how your online identity has evolved over time.'
        },
        {
            selector: '[data-tour="timeline-commits-list"]',
            content: 'This is the list of recent changes to data belonging to you. Every time Aeon finds new data, or data is removed, this list will show it.'
        },
        {
            selector: '[data-tour="timeline-first-commit"]',
            content: 'This is the most recent change to your identity. By clicking it, you can select it.'
        },
        {
            selector: '[data-tour="timeline-diff-container"]',
            content: 'Here, we go slightly more in-depth what the last change is actually about.'
        },
        {
            selector: '[data-tour="timeline-diff-info"]',
            content: 'This contains information about the circumstances in which the change was made. It contains when the change was made, which platform the change is from and which account was involved with the change.'
        },
        {
            selector: '[data-tour="timeline-diff-data"]',
            content: 'Here, all data points that were added or removed are gathered.'
        },
        {
            content: 'If you find this view a little overwhelming, go over to the Graph screen. There, you\'ll find a slightly more convenient overview.'
        }
    ],
    '/screen/accounts/no-accounts': [
        {
            content: 'The accounts screen is all about the accounts you use in your daily life. By adding them, Aeon can automatically gather data from them.'
        },
        {
            selector: '[data-tour="accounts-create-account"]',
            content: 'Click this button to get started with adding your first account!',
        }
    ],
    '/screen/accounts/new-account': [
        {
            content: 'This pop-up will help you create a new account.'
        },
        {
            selector: '[data-tour="modal-menu-options"]',
            content: (
                <>
                    <p>These are all currently supported options for gathering your data. You&apos;ll recognise a number of popular social platforms.</p>
                    <p>If you miss any particular platform, please consider contributing these yourself.</p>
                </>
            )
        },
        {
            selector: '[data-tour="accounts-create-account-open-data-rights"]',
            content: (
                <>
                    <p>This one is a special one. Rather than being tied to a particular website, it allows data requests from any website that supports the Open Data Rights API.</p>
                    <p>Check if the organisation you want to retrieve data from supports it. If not, petition them to start doing so. Implementing it is quite straightforward!</p>
                </>
            )
        }
    ],
    '/screen/accounts/has-accounts': [
        {
            content: 'Now that you\'ve added your first account, you can get started on issuing data requests for this account.'
        },
        {
            selector: '[data-tour="accounts-first-account"]',
            content:  (
                <>
                    <p>This is the account you just created. By clicking on it, you get further information on what you can use it for.</p>
                    <ClickOnMount selector='a[data-tour="accounts-first-account"]' />
                </>
            )
        },
        {
            selector: '[data-tour="accounts-account-overlay"]',
            content: 'This details all the information for this account, such as when data was requested.'
        },
        {
            selector: '[data-tour="accounts-start-data-request"]',
            content: 'While Aeon will automatically gather data from some platforms, you will need to explicitly request it for all. If you\'re ready to get started, feel free to click it!'
        },
    ],
    '/screen/data': [
        {
            content: 'This screen gives you a bit more detailed insight into all of the data that is currently active on the internet.'
        },
        {
            selector: '[data-tour="data-categories-list"]',
            content: <>
                <p>This list contains every type of data that Aeon is capable of processing. When you click on them, you get a list of all data points of this type that are present.</p>
                <ClickOnMount selector='button[data-tour="data-category-button"]:not([disabled])' />
            </>
        },
        {
            selector: '[data-tour="data-data-points-list"]',
            content: <>
                <p>The second column contains all of the data points that exist in this particular category. When you click on a single data point, you can get a closer look.</p>
                <ClickOnMount selector='button[data-tour="data-data-point-button"]:not([disabled])' />
            </>
        },
        {
            selector: '[data-tour="data-datum-overlay"]',
            content: 'The right column shows where the data point has come from, why it\'s there and more.'
        },
        {
            selector: '[data-tour="data-delete-datum-button"]',
            content: 'If you don\'t feel whoever has created the data point should be holding on the data, you can choose to remove it. When you do so, Aeon will send out an email to ther organisation with a request to remove the data points.'
        },
    ],
    '/screen/graph': [
        {
            content: 'This screen contains a visualisation of all of your data points. It should help you get an insight.'
        },
        {
            selector: '[data-tour="graph-container"]',
            content: <>
                <p>In this visualisation, the following elements are used:</p>
                <GraphExplainer />
            </>
        },
        {
            selector: '[data-tour="graph-container"]',
            content: 'Tip: move your mouse over the various elements, and they will highlight connections!'
        }
    ],
    '/screen/settings': [],
    '/screen/erasure': [
        {
            content: 'You\'ve just tentatively deleted a data point. When you\'re done selecting data points, head over to the Erasure screen to create a erasure request.',
            selector: '[data-tour="erasure-screen"]'
        }
    ]
}

// Tentatively add a tour step for creating email-based data requests
if (window.api.env.DEMO_MODE) {
    steps['/screen/accounts/new-account'].push({
        selector: '[data-tour="accounts-create-account-email"]',
        content: 'Or, if the organisation you want to get data from an organisation that does not support any of the other methods, you can just send a plain old email! Just link an email account to Aeon and select the organisation you want to get your data from.'
    });
}

export default steps;