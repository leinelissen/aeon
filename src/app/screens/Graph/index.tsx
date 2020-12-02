
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Repository from 'app/utilities/Repository';
import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types';
import styled from 'styled-components';
import cytoscape, { NodeSingular, Position } from 'cytoscape';
import fcose from 'cytoscape-fcose';
import calculateGraph from './calculateGraph';

const Container = styled.div`
    width: 100%;
    height: 100%;
`;

const Tooltip = styled.div<{ top: number, left: number }>`
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

type HoveredNode = {
    position: Position;
    type?: string;
    label: string;
}

function Graph(): JSX.Element {
    const cy = useRef<cytoscape.Core>();
    const container = useRef<HTMLDivElement>();
    const [hoveredNode, setHoveredNode] = useState<HoveredNode>(null);

    const handleMouseOver = useCallback((event) => {
        const node = event.target as NodeSingular;
        node.addClass('hover');
        setHoveredNode({
            position: node.renderedPosition(),
            label: node.data('label'),
            type: node.data('datumType'),
        });
    }, [setHoveredNode]);

    const handleMouseOut = useCallback((event) => {
        const node = event.target as NodeSingular;
        setHoveredNode(null);
        node.removeClass('hover');
    }, [setHoveredNode]);

    useEffect((): void => {
        if (!container.current) {
            return;
        }

        // Allow async functions
        async function createCytoInstance() {
            // Retrieved all data for this commit from the repository
            const data = await Repository.parsedCommit() as ProviderDatum<string, ProvidedDataTypes>[];
            cytoscape.use(fcose);
            // cytoscape.use(popper);
            cy.current = cytoscape({
                container: container.current,
                minZoom: 0.5,
                maxZoom: 2,
                layout: {
                    name: 'fcose'
                },
                elements: calculateGraph(data),
                style: [
                    {
                        selector: 'node',
                        style: {
                            shape: 'ellipse',
                            content: 'data(label)',
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
                            'background-color': '#ccc',
                        }
                    },
                    {
                        selector: 'node[type="provider"]',
                        style: {
                            'background-color': '#0000FF',
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
                        }
                    },
                    {
                        selector: 'node[type="account"].hover',
                        style: {
                            'background-color': '#a9c4e9',
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
                ]
            });
            cy.current.on('mouseover', 'node', handleMouseOver);
            cy.current.on('drag', 'node', handleMouseOver);
            cy.current.on('mouseout', 'node', handleMouseOut);
        }

        createCytoInstance();
    }, [container]);

    return (
        <>
            <Container ref={container} />
            {hoveredNode && 
                <Tooltip top={hoveredNode.position.y} left={hoveredNode.position.x}>
                    {hoveredNode.label}
                    {hoveredNode.type &&
                        <span> 
                            <br />
                            [{hoveredNode.type}]
                        </span>
                    }
                </Tooltip>
            }
        </>
    );
}

export default Graph;