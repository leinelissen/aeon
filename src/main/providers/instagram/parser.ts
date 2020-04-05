import { ProvidedDataTypes, ProviderSchema, Follower, AccountFollowing, Photo, JoinDate, PrivacySetting, PostSeen } from '../types';
import { parseISO } from 'date-fns';
import { objectToKeyValueTransformer } from 'main/lib/map-object-to-key-value';

/**
 * This specifies an input object in which the data is structured in an object,
 * in which the keys represent usernames, and the values are ISO dates. These
 * can be iterated upon to extract the desired data
 */
type GenericKeyedData = {
    [key: string]: string
};

const schema: ProviderSchema[] = [
    {
        source: 'account_history.json',
        schema: [
            {
                key: 'ip_address',
                type: ProvidedDataTypes.IP_ADDRESS,
            },
            {
                key: 'language_code',
                type: ProvidedDataTypes.USER_LANGUAGE,
            },
            {
                key: 'user_agent',
                type: ProvidedDataTypes.USER_AGENT,
            },
        ],
    },
    {
        source: 'accounts_following_you.json',
        schema: [
            {
                key: 'text',
                type: ProvidedDataTypes.FOLLOWER
            }
        ],
    },
    {
        source: 'accounts_following_you.json',
        schema: [
            {
                key: 'text',
                type: ProvidedDataTypes.FOLLOWER
            }
        ],
    },
    {
        source: 'accounts_you_follow.json',
        schema: [
            {
                key: 'text',
                type: ProvidedDataTypes.ACCOUNT_FOLLOWING
            }
        ],
    },
    {
        source: 'ads_interests.json',
        schema: [
            {
                key: 'text',
                type: ProvidedDataTypes.AD_INTEREST
            }
        ],
    },
    {
        source: 'ads_interests.json',
        schema: [
            {
                key: 'text',
                type: ProvidedDataTypes.AD_INTEREST
            }
        ],
    },
    {
        source: 'connections.json',
        schema: [
            {
                key: 'followers',
                type: ProvidedDataTypes.FOLLOWER,
                transformer: (obj: GenericKeyedData): Partial<Follower>[] => {
                    return Object.keys(obj).map((key): Partial<Follower> => {
                        return {
                            data: key,
                            timestamp: parseISO(obj[key]),
                        };
                    });
                }
            }, {
                key: 'following',
                type: ProvidedDataTypes.ACCOUNT_FOLLOWING,
                transformer: (obj: GenericKeyedData): Partial<AccountFollowing>[] => {
                    return Object.keys(obj).map((key): Partial<AccountFollowing> => {
                        return {
                            data: key,
                            timestamp: parseISO(obj[key]),
                        };
                    });
                }
            }
        ],
    },
    {
        source: "information_about_you.json",
        schema: [
            {
                key: 'city_name',
                type: ProvidedDataTypes.PLACE_OF_RESIDENCE
            }
        ]
    },
    {
        source: 'media.json',
        schema: [
            {
                key: 'profile',
                type: ProvidedDataTypes.PHOTO,
                transformer: (obj: { caption: string; taken_at: string; path: string }[]): Partial<Photo>[] => {
                    return obj.map((photo): Partial<Photo> => ({
                        data: {
                            url: photo.path,
                            description: photo.caption
                        },
                        timestamp: parseISO(photo.taken_at)
                    }))
                }
            }
        ]
    }, 
    {
        source: 'profile.json',
        schema: [
            {
                key: 'date_joined',
                type: ProvidedDataTypes.JOIN_DATE,
                transformer: (date: string) => ({ timestamp: parseISO(date) }),
            }, 
            {
                key: 'email',
                type: ProvidedDataTypes.EMAIL
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
                    }
                })
            },
            {
                key: 'name',
                type: ProvidedDataTypes.FULL_NAME
            },
            {
                key: 'profile_pic_url',
                type: ProvidedDataTypes.PROFILE_PICTURE,
            },
            {
                key: 'username',
                type: ProvidedDataTypes.USERNAME
            },
            {
                key: 'date_of_birth',
                type: ProvidedDataTypes.DATE_OF_BIRTH
            },
        ]
    },
    {
        source: 'seen_content.json',
        schema: [
            {
                key: 'posts_seen',
                type: ProvidedDataTypes.POST_SEEN,
                transformer: (obj: { timestamp: string; author: string }[]): Partial<PostSeen>[] => {
                    return obj.map((post): Partial<PostSeen> => ({
                        data: post.author,
                        timestamp: parseISO(post.timestamp)
                    }));
                }
            }
        ]
    },
    {
        source: 'settings.json',
        schema: [
            {
                type: ProvidedDataTypes.PRIVACY_SETTING,
                transformer: objectToKeyValueTransformer
            }
        ]
    },
];

export default schema;