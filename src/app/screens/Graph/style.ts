import Button from 'app/components/Button';
import { Stylesheet } from 'cytoscape';
import styled, { css } from 'styled-components';
import renderNode from './renderNode';

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
            'background-color': '#eee',
            'font-size': '10px',
            'font-family': 'IBM Plex Mono',
        }
    },
    {
        selector: 'node.hover',
        style: {
            'background-color': '#0000FF',
            'color': '#fff'
        }
    },
    {
        selector: 'node[type="provider"]',
        style: {
            'background-color': '#0000FF',
            'background-image': renderNode('#FFF', 36),
            'background-position-x': '50%',
            'background-position-y': '50%',
            'color': '#FFF',
            'font-size': 16,
            'border-width': 10,
            'border-color': '#BAD7FF',
            width: 100,
            height: 100,
        }
    },
    {
        selector: 'node[type="provider"].hover',
        style: {
            'background-color': '#0000DD',
        }
    },
    {
        selector: 'node[type="account"]',
        style: {
            width: 75,
            height: 75,
            'background-color': '#BAD7FF',
            content: 'data(label)'
        }
    },
    {
        selector: 'node[type="type"]',
        style: {
            shape: 'roundrectangle',
            'background-image': renderNode('#333', 24),
            'background-position-x': '50%',
            'background-position-y': '50%',
            content: '',
            color: '#ccc',
        }
    },
    {
        selector: 'node[type="type"].hover',
        style: {
            'background-image': renderNode('#fff', 24),
        }
    },
    {
        selector: 'node[type="account"].hover',
        style: {
            'background-color': '#a9c4e9',
            'color': '#000',
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
            'background-color': '#0000FF',
        }
    },
    {
        selector: 'edge',
        style: {
            'line-color': '#ddd',
            width: 2,
            // label: 'data(label)',
            'font-size': '8px',
            'font-family': 'IBM Plex Mono',
        }
    },
    {
        selector: 'edge[type="datum_type"]',
        style: {
            'line-color': '#eee',
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
            'line-color': '#BAD7FF',
            width: 10,
        }
    },
    {
        selector: 'edge.secondary-hover',
        style: {
            'line-color': '#0000FF'
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
    background-color: white;
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