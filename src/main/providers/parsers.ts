import Instagram from './instagram/parser';
import { ProviderSchema } from './types';

const parsers: [ ProviderSchema[], string ][] = [
    [Instagram, 'instagram']
];

export default parsers;