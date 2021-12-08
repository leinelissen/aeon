import Button from 'app/components/Button';
import { Stylesheet } from 'cytoscape';
import styled, { css } from 'styled-components';
import renderNode from './renderNode';

const bodyStyles = window.getComputedStyle(document.body);
const cssVar = (name: string) => bodyStyles.getPropertyValue(name);

const style: Stylesheet[] = [
    {
        selector: 'node',
        style: {
            shape: 'ellipse',
            width: 50,
            height: 50,
            'text-wrap': 'wrap',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-max-width': '10px',
            'background-color': cssVar('--color-gray-200'),
            'color': cssVar('--color-text'),
            'font-size': '10px',
            'font-family': 'IBM Plex Mono',
        }
    },
    {
        selector: 'node.hover',
        style: {
            'background-color': cssVar('--color-primary'),
            'color': cssVar('--color-white'),
        }
    },
    {
        selector: 'node[type="provider"]',
        style: {
            'background-color': cssVar('--color-primary'),
            'background-image': renderNode(cssVar('--color-white'), 36),
            'background-position-x': '50%',
            'background-position-y': '50%',
            'color': '#FFF',
            'font-size': 16,
            'border-width': 10,
            'border-color': cssVar('--color-blue-300'),
            width: 100,
            height: 100,
        }
    },
    {
        selector: 'node[type="provider"].hover',
        style: {
            'background-color': cssVar('--color-blue-600'),
        }
    },
    {
        selector: 'node[type="account"]',
        style: {
            width: 75,
            height: 75,
            'background-color': cssVar('--color-blue-300'),
            content: 'data(label)'
        }
    },
    {
        selector: 'node[type="type"]',
        style: {
            shape: 'roundrectangle',
            'background-image': renderNode(cssVar('--color-text'), 24),
            'background-position-x': '50%',
            'background-position-y': '50%',
            content: '',
            color: '#ccc',
        }
    },
    {
        selector: 'node[type="type"].hover',
        style: {
            'background-image': renderNode(cssVar('--color-white'), 24),
        }
    },
    {
        selector: 'node[type="account"].hover',
        style: {
            'background-color': cssVar('--color-blue-400'),
        }
    },
    {
        selector: 'node[type="datum"]',
        style: {
            width: 10,
            height: 10,
            label: '',
        }
    },
    {
        selector: 'node.secondary-hover',
        style: {
            'background-color': cssVar('--color-primary'),
        }
    },
    {
        selector: 'edge',
        style: {
            'line-color': cssVar('--color-gray-300'),
            width: 2,
            // label: 'data(label)',
            'font-size': '8px',
            'font-family': 'IBM Plex Mono',
        }
    },
    {
        selector: 'edge[type="datum_type"]',
        style: {
            'line-color': cssVar('--color-gray-300'),
            width: 1,
        }
    },
    {
        selector: 'edge[type="datum_account"]',
        style: {
            
        }
    },
    {
        selector: 'edge[type="account_provider"]',
        style: {
            'line-color': cssVar('--color-blue-300'),
            width: 10,
        }
    },
    {
        selector: 'edge.secondary-hover',
        style: {
            'line-color': cssVar('--color-primary')
        }
    }
];

export const Container = styled.div<{ isHovered?: boolean }>`
    width: 100%;
    height: 100%;

    ${props => props.isHovered && css`
        cursor: pointer;
    `}
`;

export const Tooltip = styled.div<{ top: number, left: number }>`
    position: absolute;
    top: ${props => props.top + 15}px;
    left: ${props => props.left}px;
    transform: translateX(-50%);
    background-color: var(--color-modal-background);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    line-height: 1.5;
    text-align: center;
    pointer-events: none;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04), 
                0 2px 4px rgba(0,0,0,0.04), 
                0 4px 8px rgba(0,0,0,0.04), 
                0 8px 16px rgba(0,0,0,0.04);

    span {
        opacity: 0.5;
        font-family: 'IBM Plex Mono';
        font-size: 10px;
    }
`;

export const ResetButton = styled(Button)`
    position: fixed;
    bottom: 25px;
    left: 250px;
`;

export default style;