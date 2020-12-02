import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import DataType from 'app/utilities/DataType';
import Providers from 'app/utilities/Providers';
import { NodeSingular } from 'cytoscape';

/**
 * Convert a Cytoscape-provided element into a FontAwesome Icon
 * @param element 
 */
export function getIconFromNode(element: NodeSingular): IconDefinition {
    switch (element.data('type')) {
        case 'type':
        case 'datum': {
            const type = element.data('datumType');
            return DataType.getIcon(type);
        }
        case 'provider': {
            const provider = element.data('label');
            return Providers.getIcon(provider);
        }
    }
}

/**
 * Render a FontAwesome SVG icon as background-image for any node
 * @param element 
 */
export default function renderNode(color: string, size: number): (element: NodeSingular) => string {
    return function(element: NodeSingular) {
        const [width, height, , , path] = getIconFromNode(element).icon;
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${size * 1.25}" height="${size}" style="text-align: center">
            <path d="${path}" fill="${color}" transform="translate(0,0)"></path>
          </svg>`;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }
}
