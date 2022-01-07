import React, { PropsWithChildren } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimesOctagon } from 'app/assets/fa-light';
import styled, { css } from 'styled-components';
import { PullCenter } from './Utility';

enum WellType {
    INFO,
    WARNING,
    ERROR,
    SUCCESS
}

type WellProps = { type?: WellType };

export const Well = styled.div<WellProps>`
    font-weight: 600;
    padding: 1em;
    border-radius: 0.5em;
    display: inline-flex;
    align-items: center;
    font-family: var(--font-heading);

    svg {
        margin-right: 0.75em;
        font-size: 1.15em;
    }

    ${({ type }) => {
        switch(type) {
            default:
            case WellType.INFO:
                return css`
                    background-color: var(--color-blue-100);
                    color: var(--color-blue-500);
                `;
            case WellType.WARNING:
                return css`
                    background-color: var(--color-yellow-100);
                    color: var(--color-yellow-500);
                `;
            case WellType.ERROR:
                return css`
                    background-color: var(--color-red-100);
                    color: var(--color-red-500);
                `;
            case WellType.SUCCESS:
                return css`
                    background-color: var(--color-green-100);
                    color: var(--color-green-500);
                `;
        }
    }}
`;

type WellTypeProps = PropsWithChildren<unknown>;

export function InfoWell({ children }: WellTypeProps) {
    return (
        <PullCenter>
            <Well type={WellType.INFO}>
                <FontAwesomeIcon icon={faInfoCircle} />
                {children}
            </Well>
        </PullCenter>
    );
}

export function WarningWell({ children }: WellTypeProps) {
    return (
        <PullCenter>
            <Well type={WellType.WARNING}>
                <FontAwesomeIcon icon={faExclamationTriangle} />
                {children}
            </Well>
        </PullCenter>
    );
}

export function ErrorWell({ children }: WellTypeProps) {
    return (
        <PullCenter>
            <Well type={WellType.ERROR}>
                <FontAwesomeIcon icon={faTimesOctagon} />
                {children}
            </Well>
        </PullCenter>
    );
}

export function SuccessWell({ children }: WellTypeProps) {
    return (
        <PullCenter>
            <Well type={WellType.SUCCESS}>
                <FontAwesomeIcon icon={faCheckCircle} />
                {children}
            </Well>
        </PullCenter>
    );
}