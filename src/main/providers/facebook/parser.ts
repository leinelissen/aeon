import { EducationExperience, Employment, EventResponse, MobileDevice, OffSiteActivity, ProvidedDataTypes, ProviderParser, SearchQuery, VisitedPage } from "../types/Data";
import path from 'path';

const parsers: ProviderParser[] = [
    {
        source: path.join('about_you', 'friend_peer_group.json'),
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
                            company: data?.messenger?.autofill_information?.COMPANY_NAME,
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
        source: path.join('about_you', 'visited.json'),
        schemas: [
            {
                key: 'entries',
                type: ProvidedDataTypes.VISITED_PAGE,
                transformer: (entry: any): Partial<VisitedPage> => {
                    return {
                        data: {
                            name: entry?.data?.name,
                            uri: entry?.data?.uri,
                        },
                        timestamp: entry.timestamp && new Date(entry.timestamp * 1000)
                    };
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
                transformer: (website: any): Partial<OffSiteActivity>[] => {
                    return website.events.map((event: any): Partial<OffSiteActivity> => {
                        return {
                            data: {
                                website: website.name,
                                type: event.type,
                            },
                            timestamp: new Date(event.timestamp * 1000)
                        };
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
                transformer: (data: any): Partial<EventResponse> => {
                    return {
                        data: {
                            name: data.name,
                            response: 'interested'
                        }
                    };
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
    {
        source: path.join('profile_information', 'profile_information.json'),
        schemas: [
            {
                key: 'full_name',
                type: ProvidedDataTypes.FULL_NAME
            },
            {
                key: 'first_name',
                type: ProvidedDataTypes.FIRST_NAME
            },
            {
                key: 'last_name',
                type: ProvidedDataTypes.LAST_NAME
            },
            {
                key: 'emails',
                type: ProvidedDataTypes.EMAIL,
                transformer: (data: any) => {
                    return Object.keys(data).reduce((emails, key): string[] => {
                        emails.push(...data[key]);
                        return emails;
                    }, []).map((email) => {
                        return {
                            data: email
                        };
                    });
                }
            },
            {
                key: ['current_city', 'hometown'],
                type: ProvidedDataTypes.PLACE_OF_RESIDENCE,
                transformer: (data: any) => {
                    return [{
                        data: data.name,
                    }];
                }
            },
            {
                key: ['gender_option', 'pronoun'],
                type: ProvidedDataTypes.GENDER,
            },
            {
                key: 'education_experiences',
                type: ProvidedDataTypes.EDUCATION_EXPERIENCE,
                transformer: (experience: any): Partial<EducationExperience> => {
                    return {
                        data: {
                            institution: experience.name,
                            type: experience.school_type,
                            graduated: experience.graduated,
                        }
                    };
                }
            },
            {
                key: 'work_experiences',
                type: ProvidedDataTypes.EMPLOYMENT,
                transformer: (experience: any): Partial<Employment>  => {
                    return {
                        data: {
                            job_title: experience.title,
                            company: experience.employer,
                        }
                    };
                }
            },
            {
                key: 'registration_timestamp',
                type: ProvidedDataTypes.REGISTRATION_DATE,
                transformer: (timestamp: number) => [{ data: new Date(timestamp * 1000) }],
            },
        ]
    },
    {
        source: path.join('search_history', 'your_search_history.json'),
        schemas: [{
            key: 'searches',
            type: ProvidedDataTypes.SEARCH_QUERY,
            transformer: (query: any): Partial<SearchQuery> => {
                return {
                    data: query.data.reduce((sum: string, q: any) => sum + q.text, ''),
                    timestamp: new Date(query.timestamp * 1000),
                };
            }
        }]
    },
    {
        source: path.join('security_and_login_information', 'mobile_devices.json'),
        schemas: [{
            key: 'devices',
            type: ProvidedDataTypes.MOBILE_DEVICE,
            transformer: (device: any): Partial<MobileDevice> => {
                return {
                    data: {
                        type: device.type,
                        os: device.os,
                        advertiser_id: device.advertiser_id,
                        device_locale: device.device_locale,
                    },
                    timestamp: new Date(device.update_time * 1000),
                }
            }
        }]
    },
    {
        source: path.join('security_and_login_information', 'user_ip_addresses.json'),
        schemas: [{
            key: 'user_ip_address',
            type: ProvidedDataTypes.IP_ADDRESS,
            transformer: (entry: any) => {
                return {
                    data: entry.ip,
                    timestamp: new Date(entry.timestamp * 1000),
                }
            }
        }]
    }
];

export default parsers;