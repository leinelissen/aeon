import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types';

export type GroupedData =  { [key: string]: ProviderDatum<string, ProvidedDataTypes>[] };
export type DeletedData = { [key: string]: number[] };