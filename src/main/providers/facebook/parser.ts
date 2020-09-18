import { Employment, EventResponse, OffSiteActivity, ProvidedDataTypes, ProviderParser, VisitedPage } from '../types';
import path from 'path';

const parsers: ProviderParser[] = [
    {
        source: path.join('about_you, friend_peer_group.json'),
        schemas: [{
            type: ProvidedDataTypes.PEER_GROUP,
            key: 'friend_peer_group',
        }]
    },
    {
        source: path.join('about_you', 'messenger.json'),
        schemas: [
            {
                key: 'CITY',
                type: ProvidedDataTypes.PLACE_OF_RESIDENCE
            },
            {
                key: 'COUNTRY',
                type: ProvidedDataTypes.COUNTRY,
            },
            {
                key: 'GENDER',
                type: ProvidedDataTypes.GENDER
            },
            {
                key: 'EMAIL',
                type: ProvidedDataTypes.EMAIL
            },
            {
                type: ProvidedDataTypes.EMPLOYMENT,
                transformer: (data: any): Partial<Employment>[] => {
                    return [{
                        data: {
                            job_title: data?.messenger?.autofill_information?.JOB_TITLE,
                            company: data?.messenger?.autofill_information?.COMPANY,
                        }
                    }];
                }
            },
        ],
    },
    {
        source: path.join('about_you', 'preferences.json'),
        schemas: [
            {
                type: ProvidedDataTypes.USER_LANGUAGE,
                key: 'value'
            },
        ]
    },
    {
        source: path.join('about_you', 'visited_things'),
        schemas: [
            {
                key: 'entries',
                type: ProvidedDataTypes.VISITED_PAGE,
                transformer: (data: any): Partial<VisitedPage>[] => {
                    return [{
                        data: {
                            name: data?.name,
                            uri: data?.uri,
                        },
                        timestamp: data?.timestamp,
                    }];
                }
            }
        ]
    },
    {
        source: path.join('ads_and_businesses', 'ads_interests.json'),
        schemas: [
            {
                key: 'topics',
                type: ProvidedDataTypes.AD_INTEREST
            }
        ]
    },
    {
        source: path.join('ads_and_businesses', 'your_off-facebook_activity.json'),
        schemas: [
            {
                key: 'off_facebook_activity',
                type: ProvidedDataTypes.OFF_SITE_ACTIVITY,
                transformer: (data: any): Partial<OffSiteActivity>[] => {
                    return data.flatMap((website: any) => {
                        return website.events.map((event: any): Partial<OffSiteActivity> => {
                            return {
                                data: {
                                    website: data.name,
                                    type: data.type,
                                },
                                timestamp: event.timestamp
                            };
                        });
                    });
                }
            }
        ]
    },
    {
        source: path.join('events', 'your_event_responses.json'),
        schemas: [
            {
                key: 'events_interested',
                type: ProvidedDataTypes.EVENT_RESPONSE,
                transformer: (data: any): Partial<EventResponse>[] => {
                    return data.map((event: any): Partial<EventResponse> => {
                        return {
                            data: {
                                name: data.name,
                                response: 'interested'
                            }
                        };
                    })
                }
            }
        ]
    },
    {
        source: path.join('likes_and_reactions', 'pages.json'),
        schemas: [
            {
                key: 'name',
                type: ProvidedDataTypes.LIKE
            }
        ]
    },
    {
        source: path.join('location', 'primary_location.json'),
        schemas: [
            {
                key: 'city_region_pairs',
                type: ProvidedDataTypes.PLACE_OF_RESIDENCE
            },
            {
                key: 'zipcode',
                type: ProvidedDataTypes.PLACE_OF_RESIDENCE
            }
        ]
    },
    {
        source: path.join('location', 'timezone.json'),
        schemas: [
            {
                key: 'timezone',
                type: ProvidedDataTypes.TIMEZONE
            }
        ]
    },
    {
        source: path.join('payment_history', 'payment_history.json'),
        schemas: [
            {
                key: 'preferred_currency',
                type: ProvidedDataTypes.CURRENCY
            }
        ]
    },
];

export default parsers;