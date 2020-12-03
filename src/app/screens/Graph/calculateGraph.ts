import DataType from 'app/utilities/DataType';
import { EdgeDefinition, ElementsDefinition, NodeDefinition } from 'cytoscape';
import { uniqBy } from 'lodash-es';
import { ProviderDatum } from 'main/providers/types';

/**
 * Transforms an incoming set of ProivderDatums into a graph that can be
 * consumed by Cytoscape
 * @param data 
 */
export default function calculateGraph(data: ProviderDatum<unknown, unknown>[]): ElementsDefinition {
    // Retrieve all unique providers, accounts and sources that are present on the data
    const uniqueProviders = uniqBy(data, 'provider');
    const uniqueAccounts = uniqBy(data, datum => `${datum.provider}_${datum.account}`);
    // const uniqueSources = uniqBy(data, 'source');
    const uniqueTypes = uniqBy(data, 'type');

    // Create a variable that will hold all the future nodes
    const nodes: NodeDefinition[]  = [
        ...uniqueProviders.map((datum): NodeDefinition => ({
            data: {
                id: `provider_${datum.provider}`,
                label: datum.provider,
                type: 'provider',
            },
        })),
        ...uniqueAccounts.map((datum): NodeDefinition => ({
            data: {
                id: `account_${datum.provider}_${datum.account}`,
                label: datum.account,
                type: 'account',
            }
        })),
        ...uniqueTypes.map((datum): NodeDefinition => ({
            data: {
                id: `type_${datum.type}`,
                label: datum.type,
                type: 'type',
                datumType: datum.type,
            }
        })),
        ...data.map((datum, i): NodeDefinition => ({
            data: {
                id: `datum_${i}`,
                label: DataType.toString(datum),
                type: 'datum',
                datumType: datum.type,
                parent: `parent_type_${datum.type}`,
                i
            }
        }))
    ];

    // Create a variable that will hold all future edges
    const edges: EdgeDefinition[] = [
        ...uniqueAccounts.map((datum): EdgeDefinition => ({
            data: {
                source: `account_${datum.provider}_${datum.account}`,
                target: `provider_${datum.provider}`,
                type: 'account_provider'
            }
        })),
        ...data.flatMap((datum, i): EdgeDefinition[] => ([
            {
                data: {
                    source: `datum_${i}`,
                    target: `account_${datum.provider}_${datum.account}`,
                    type: 'datum_account'
                },
            },
            {
                data: {
                    source: `type_${datum.type}`,
                    target: `datum_${i}`,
                    type: 'datum_type',
                },
            },
        ]))
    ];

    return {
        nodes,
        edges,
    }
}