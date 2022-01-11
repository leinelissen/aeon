
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { debounce } from 'lodash-es';
import cytoscape, { NodeSingular, Position } from 'cytoscape';
import fcose from 'cytoscape-fcose';

import { ProvidedDataTypes, ProviderDatum } from "main/providers/types/Data";
import Repository from 'app/utilities/Repository';
import calculateGraph from './calculateGraph';
import DatumOverlay from '../Data/components/DatumOverlay';
import { RouteProps } from '../types';
import style, { Container, ResetButton, Tooltip } from './style';
import { faUndo } from 'app/assets/fa-light';
import Loading from 'app/components/Loading';
import NoData from 'app/components/NoData';
import useTour from 'app/components/Tour/useTour';

type HoveredNode = {
    position: Position;
    type: string;
    datumType?: string;
    label: string;
}

type CytoEvent = { target: NodeSingular };

function Graph(): JSX.Element {
    useTour('/screen/graph');

    // Register refs for cytoscape and the container to which it is assigned respectively
    const cy = useRef<cytoscape.Core>();
    const container = useRef<HTMLDivElement>();

    // Retrieve the params for selected nodes
    const navigate = useNavigate();
    const selectedNode = useParams<RouteProps['graph']>().datumId;

    // Assign state for hovered nodes and all data
    const [hoveredNode, setHoveredNode] = useState<HoveredNode>(null);
    const [data, setData] = useState(null);

    /**
     * Handle a mouseover on one of the Cytoscape node elements
     */
    const handleMouseOver = useCallback((event: CytoEvent) => {
        // Retrieve the node from the event
        const node = event.target;

        // Assign the hovered class to the node
        node.addClass('hover');

        // Assign a secondary hover class to connected nodes
        if (node.data('type') === 'type') {
            const neighbours = node.openNeighborhood();
            neighbours.addClass('secondary-hover');
        }

        // Then store the hovered node in state for the hover element
        setHoveredNode({
            position: node.renderedPosition(),
            label: node.data('label'),
            type: node.data('type'),
            datumType: node.data('datumType'),
        });
    }, [setHoveredNode]);

    /**
     * Handle the mouseout from one of the Cytoscape nodes
     */
    const handleMouseOut = useCallback((event: CytoEvent) => {
        // Extract node
        const node = event.target as NodeSingular;

        // Reset stored node
        setHoveredNode(null);

        // Remove class from the unhovered node, but also all elements that have
        // been assigned a secondary hover previously
        node.removeClass('hover');
        cy.current.elements('.secondary-hover').removeClass('secondary-hover')
    }, [setHoveredNode, cy]);

    /**
     * Handle a mouse tap on of the Cytoscape nodes
     */
    const handleSelectNode = useCallback((event: CytoEvent) => {
        // GUARD: If it's not a datum node, we don't handle it
        if (event.target.data('type') !== 'datum') {
            return;
        }

        // Retrieve the particular datum
        const i = event.target.data('i');
        if (i) {
            navigate(`/graph/${i}`);
        }
    }, []);

    const handleReset = useCallback(() => {
        cy.current.fit();
    }, [cy]);

    useEffect((): void => {
        // GUARD: If the container hasn't mounted yet, we cannot initialise
        // cytoscape in it.
        if (!container.current) {
            return;
        }

        /**
         * Create a new Cytoscape instance
         */
        async function createCytoInstance() {
            // Retrieved all data for this commit from the repository
            const data = await Repository.parsedCommit() as ProviderDatum<string, ProvidedDataTypes>[];
            setData(data);

            // GUARD: Don't render anything if no data is present. It will crash cytoscape
            if (data.length === 0) {
                return;
            }
            
            // Add the fcose layout to cytoscape
            // eslint-disable-next-line
            cytoscape.use(fcose);

            // Init Cytoscape
            cy.current = cytoscape({
                container: container.current,
                minZoom: 0.5,
                maxZoom: 2,
                layout: {
                    name: 'fcose'
                },
                elements: calculateGraph(data),
                style
            });

            // Initialise the hover handlers
            cy.current.on('mouseover', 'node', handleMouseOver);
            cy.current.on('drag', 'node', handleMouseOver);
            cy.current.on('mouseout', 'node', handleMouseOut);
            cy.current.on('tap', handleSelectNode);
        }

        createCytoInstance();
    }, [container, setData]);

    /**
     * Add a handler for window resizes, so Cytoscape participates neatly when
     * someone wants to see a bit more
     */
    useEffect(() => {
        // Register handler
        const handleResize = () => cy.current.fit();
        // Debounce the function so we don't spam cytoscape too often
        const debouncedHandler = debounce(handleResize, 100);

        // Register listener, and cleanup function
        window.addEventListener('resize', debouncedHandler);
        return () => window.removeEventListener('resize', debouncedHandler);
    });

    // If there is not data to display, render a view imploring the user to
    // start adding accounts
    if (data && !data.length) {
        return <NoData />;
    }

    return (
        <>
            <Container
                ref={container}
                isHovered={hoveredNode && hoveredNode.type === 'datum'}
                data-tour="graph-container" 
            />
            {!data && <Loading />}
            {hoveredNode && 
                <Tooltip top={hoveredNode.position.y} left={hoveredNode.position.x}>
                    {hoveredNode.label}
                    {hoveredNode.type === 'datum' &&
                        <span> 
                            <br />
                            [{hoveredNode.datumType}]
                        </span>
                    }
                </Tooltip>
            }
            {selectedNode && <DatumOverlay datumId={Number.parseInt(selectedNode)} />}
            <ResetButton icon={faUndo} onClick={handleReset}>Reset View</ResetButton>
        </>
    );
}

export default Graph;