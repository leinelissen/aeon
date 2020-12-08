import path from 'path';
import { Address, PlayedSong, ProvidedDataTypes, ProviderParser } from "../types/Data";

type SpotifyStreamHistorySong = {
    endTime: string;
    artistName: string;
    trackName: string;
    msPlayed: number;
}

type SpotifyUserData = {
    username: string;
    email: string;
    country: string;
    createdFromFacebook: boolean;
    facebookUid?: string;
    birthdate: string;
    gender: string;
    postalCode?: string;
    mobileNumber?: string;
    mobileOperator?: string;
    mobileBrand?: string;
    creationTime: string;
}

const parsers: ProviderParser[] = [
    {
        source: path.join('MyData', 'Follow.json'),
        schemas: [
            {
                key: 'followingArtists',
                type: ProvidedDataTypes.ACCOUNT_FOLLOWING
            },
        ]
    },
    {
        source: path.join('MyData', 'Identity.json'),
        schemas: [
            {
                key: 'firstName',
                type: ProvidedDataTypes.FIRST_NAME
            },
            {
                key: 'lastName',
                type: ProvidedDataTypes.LAST_NAME
            },
        ]
    },
    {
        source: path.join('MyData', 'Inferences.json'),
        schemas: [
            {
                key: 'inferences',
                type: ProvidedDataTypes.INFERENCE
            }
        ]
    },
    {
        source: path.join('MyData', 'StreamingHistory0.json'),
        schemas: [
            {
                type: ProvidedDataTypes.PLAYED_SONG,
                transformer: (song: SpotifyStreamHistorySong): Partial<PlayedSong> => {
                    return {
                        data: {
                            artist: song.artistName,
                            track: song.trackName,
                            playDuration: song.msPlayed,
                        },
                        timestamp: new Date(song.endTime).toString(),
                    };
                }
            }
        ]
    },
    {
        source: path.join('MyData', 'Userdata.json'),
        schemas: [
            {
                key: 'username',
                type: ProvidedDataTypes.USERNAME,
            },
            {
                key: 'email',
                type: ProvidedDataTypes.EMAIL,
            },
            {
                key: 'country',
                type: ProvidedDataTypes.COUNTRY,
            },
            {
                key: 'birthdate',
                type: ProvidedDataTypes.DATE_OF_BIRTH,
            },
            {
                key: 'gender',
                type: ProvidedDataTypes.GENDER
            },
            {
                key: 'postcalCode',
                type: ProvidedDataTypes.ADDRESS,
                transformer: (data: SpotifyUserData['postalCode']): Partial<Address>[] => {
                    return [{
                        data: {
                            zipCode: data
                        }
                    }];
                },
            },
            {
                key: 'mobileNumber',
                type: ProvidedDataTypes.TELEPHONE_NUMBER,
            },
            {
                key: 'creationTime',
                type: ProvidedDataTypes.REGISTRATION_DATE,
            },
        ]
    },
];

export default parsers;