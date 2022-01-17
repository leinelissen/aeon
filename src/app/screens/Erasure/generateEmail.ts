import DataType from 'app/utilities/DataType';
import { ProviderDatum } from 'main/providers/types/Data';

/**
 * Generate an email body using the supplied data, with the selected provider.
 * Email text courtesy of Bits of Freedom, adapted 09/12/2020, from:
 * https://code.bitsoffreedom.nl/bitsoffreedom/mydatadoneright/frontend/-/tree/master/assets/locales/en
 */
function generateEmail(data: ProviderDatum<unknown, unknown>[], provider: string): string {
    return `
        Date: ${new Date().toLocaleDateString()}
        To Whom It May Concern:

        I am invoking my right to erasure as specified in Article 17 of the General Data Protection Regulation. I am requesting ${provider} to erase the following personal data it processes about me without undue delay:
        ${data.map((datum) => `* ${datum.type}: ${DataType.toString(datum)} (found in: ${Array.isArray(datum.source) ? datum.source.join('/') : datum.source})`).join('\n')}

        The reason for my removal request is that I withdraw my prior given consent. This request relates to any processing of my personal data by ${provider}, including any processors processing personal data on behalf of ${provider}.

        Please provide your response through secure means by email to ${data[0].account}. I look forward to receiving a response within one month of receipt of my request.
    `;
}

export default generateEmail;