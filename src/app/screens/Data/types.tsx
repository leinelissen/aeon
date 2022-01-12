import { ProvidedDataTypes, ProviderDatum } from 'main/providers/types/Data';

export type GroupedData =  { [key: string]: ProviderDatum<string, ProvidedDataTypes>[] };
export type DeletedData = { [key: string]: number[] };