import {
    ProvidedDataTypes,
    ProviderParser,
    Follower,
    AccountFollowing,
    Photo,
    PrivacySetting,
    PostSeen,
} from '../types/Data';
import { objectToKeyValueTransformer } from 'main/lib/map-object-to-key-value';
import path from 'path';
import Instagram from '.';
import { repositoryPath } from 'main/lib/constants';

/**
 * This specifies an input object in which the data is structured in an object,
 * in which the keys represent usernames, and the values are ISO dates. These
 * can be iterated upon to extract the desired data
 */
type GenericKeyedData = {
    [key: string]: string
};

const parsers: ProviderParser[] = [
    {
        source: 'account_history.json',
        schemas: [
            {
                type: ProvidedDataTypes.SESSION,
                key: 'login_history',
                // eslint-disable-next-line
                transformer: (data: any[]): (Array<{ data: any }>) => data.map(d => ({ data: d })),
            },
        ],
    },
    {
        source: 'accounts_following_you.json',
        schemas: [
            {
                key: 'text',
                type: ProvidedDataTypes.FOLLOWER,
            },
        ],
    },
    {
        source: 'accounts_following_you.json',
        schemas: [
            {
                key: 'text',
                type: ProvidedDataTypes.FOLLOWER,
            },
        ],
    },
    {
        source: 'accounts_you_follow.json',
        schemas: [
            {
                key: 'text',
                type: ProvidedDataTypes.ACCOUNT_FOLLOWING,
            },
        ],
    },
    {
        source: 'ads_interests.json',
        schemas: [
            {
                key: 'text',
                type: ProvidedDataTypes.AD_INTEREST,
            },
        ],
    },
    {
        source: 'ads_interests.json',
        schemas: [
            {
                key: 'text',
                type: ProvidedDataTypes.AD_INTEREST,
            },
        ],
    },
    {
        source: 'connections.json',
        schemas: [
            {
                key: 'followers',
                type: ProvidedDataTypes.FOLLOWER,
                transformer: (obj: GenericKeyedData): Partial<Follower>[] => {
                    return Object.keys(obj).map((key): Partial<Follower> => {
                        return {
                            data: key,
                            timestamp: obj[key],
                        };
                    });
                },
            }, {
                key: 'following',
                type: ProvidedDataTypes.ACCOUNT_FOLLOWING,
                transformer: (obj: GenericKeyedData): Partial<AccountFollowing>[] => {
                    return Object.keys(obj).map((key): Partial<AccountFollowing> => {
                        return {
                            data: key,
                            timestamp: obj[key],
                        };
                    });
                },
            },
        ],
    },
    {
        source: 'information_about_you.json',
        schemas: [
            {
                key: 'city_name',
                type: ProvidedDataTypes.PLACE_OF_RESIDENCE,
            },
        ],
    },
    {
        source: 'media.json',
        schemas: [
            {
                key: 'profile',
                type: ProvidedDataTypes.PROFILE_PICTURE,
                transformer: (obj: { caption: string; taken_at: string; path: string }[]): Partial<Photo>[] => {
                    return obj.map((photo): Partial<Photo> => ({
                        data: {
                            url: 'file://' + path.join(repositoryPath, Instagram.key, photo.path),
                            description: photo.caption,
                        },
                        timestamp: photo.taken_at,
                    }));
                },
            },
            {
                key: 'photos',
                type: ProvidedDataTypes.PHOTO,
                transformer: (obj: { caption: string; taken_at: string; path: string }[]): Partial<Photo>[] => {
                    return obj.map((photo): Partial<Photo> => ({
                        data: {
                            url: 'file://' + path.join(repositoryPath, Instagram.key, photo.path),
                            description: photo.caption,
                        },
                        timestamp: photo.taken_at,
                    }));
                },
            },
        ],
    }, 
    {
        source: 'profile.json',
        schemas: [
            {
                key: 'date_joined',
                type: ProvidedDataTypes.JOIN_DATE,
                // eslint-disable-next-line
                transformer: (date: string): any => ({ timestamp: date })
            }, 
            {
                key: 'email',
                type: ProvidedDataTypes.EMAIL,
            }, 
            {
                key: 'gender',
                type: ProvidedDataTypes.GENDER,
            },
            {
                key: 'private_account',
                type: ProvidedDataTypes.PRIVACY_SETTING,
                transformer: (value: boolean): Partial<PrivacySetting> => ({ 
                    data: {
                        key: 'private_account',
                        value,
                    },
                }),
            },
            {
                key: 'name',
                type: ProvidedDataTypes.FULL_NAME,
            },
            {
                key: 'profile_pic_url',
                type: ProvidedDataTypes.PROFILE_PICTURE,
            },
            {
                key: 'username',
                type: ProvidedDataTypes.USERNAME,
            },
            {
                key: 'date_of_birth',
                type: ProvidedDataTypes.DATE_OF_BIRTH,
            },
        ],
    },
    {
        source: 'seen_content.json',
        schemas: [
            {
                key: 'posts_seen',
                type: ProvidedDataTypes.POST_SEEN,
                transformer: (obj: { timestamp: string; author: string }[]): Partial<PostSeen>[] => {
                    return obj.map((post): Partial<PostSeen> => ({
                        data: post.author,
                        timestamp: post.timestamp,
                    }));
                },
            },
        ],
    },
    {
        source: 'settings.json',
        schemas: [
            {
                type: ProvidedDataTypes.PRIVACY_SETTING,
                transformer: objectToKeyValueTransformer,
            },
        ],
    },
    {
        source: 'logins.json',
        schemas: [
            {
                type: ProvidedDataTypes.LOGIN_INSTANCE,
                key: 'timestamp',
            },
        ],
    },
    {
        source: ['account_information', 'personal_information.json'],
        schemas: [
            {
                selector: 'profile_user[].string_map_data.Email.value',
                type: ProvidedDataTypes.EMAIL,
            },
            {
                selector: 'profile_user[].string_map_data.Confirmed.value',
                type: ProvidedDataTypes.TELEPHONE_NUMBER,
            },
            {
                selector: 'profile_user[].string_map_data.Username.value',
                type: ProvidedDataTypes.USERNAME,
            },
            {
                selector: 'profile_user[].string_map_data.Name.value',
                type: ProvidedDataTypes.FULL_NAME,
            },
            {
                selector: 'profile_user[].string_map_data.Bio.value',
                type: ProvidedDataTypes.BIOGRAPHY,
            },
            {
                selector: 'profile_user[].string_map_data.Gender.value',
                type: ProvidedDataTypes.GENDER,
            },
            {
                selector: 'profile_user[].string_map_data."Date of birth".value',
                type: ProvidedDataTypes.DATE_OF_BIRTH,
            },
        ],
    },
    {
        source: ['ads_and_businesses', 'advertisers_using_your_activity_or_information.json'],
        schemas: [
            {
                selector: 'ig_custom_audiences_all_types[].advertiser_name',
                type: ProvidedDataTypes.ADVERTISER,
            },
        ],
    },
    {
        source: ['device_information', 'devices.json'],
        schemas: [
            {
                selector: 'devices_devices[].string_map_data."User Agent".value',
                type: ProvidedDataTypes.USER_AGENT,
            },
        ],
    },
];

export default parsers;