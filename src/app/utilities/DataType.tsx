import React from 'react';
import {
    ProvidedDataTypes,
    ProviderDatum,
    Address,
    Photo,
    PrivacySetting,
    LoginInstance,
    ProfilePicture,
    Session, Employment, EventResponse, VisitedPage, OffSiteActivity, EducationExperience, MobileDevice, RegistrationDate, PlayedSong
} from "main/providers/types/Data";
import {
    IconDefinition,
    faSquare,
    faCookieBite,
    faBan,
    faHashtag,
    faPhone,
    faComment,
    faAd,
    faHome,
    faAddressCard,
    faFlag,
    faHeart,
    faSignInAlt,
    faSignOutAlt,
    faImage,
    faComments,
    faVenusMars,
    faIdCard,
    faLanguage,
    faIdBadge,
    faCalendar,
    faSearch,
    faEye,
    faUserCog,
    faAddressBook,
    faEnvelope,
    faNetworkWired,
    faTablet,
    faUserCircle,
    faUserFriends,
    faShoePrints,
    faBook, 
    faUsers, 
    faBriefcase, 
    faFile, 
    faMoneyBillWaveAlt,
    faListAlt,
    faCheck,
    faClock,
    faUniversity,
    faUserPlus,
    faMobile,
    faMusic,
    faRobot
} from '@fortawesome/free-solid-svg-icons';

class DataType {
    /**
     * Retrieve an icon for a given ProvidedDateType
     * @param type 
     */
    static getIcon(type: ProvidedDataTypes): IconDefinition {
        switch(type) {
            case ProvidedDataTypes.EMAIL:
                return faEnvelope;
            case ProvidedDataTypes.FIRST_NAME:
                return faIdCard;
            case ProvidedDataTypes.LAST_NAME:
                return faIdCard;
            case ProvidedDataTypes.FULL_NAME:
                return faIdCard;
            case ProvidedDataTypes.USER_AGENT:
                return faIdBadge;
            case ProvidedDataTypes.USER_LANGUAGE:
                return faLanguage;
            case ProvidedDataTypes.COOKIE:
                return faCookieBite;
            case ProvidedDataTypes.BLOCKED_ACCOUNT:
                return faBan;
            case ProvidedDataTypes.HASHTAG_FOLLOWING:
                return faHashtag;
            case ProvidedDataTypes.AD_INTEREST:
                return faAd;
            case ProvidedDataTypes.TELEPHONE_NUMBER:
                return faPhone;
            case ProvidedDataTypes.COMMENT:
                return faComment;
            case ProvidedDataTypes.PLACE_OF_RESIDENCE:
                return faHome;
            case ProvidedDataTypes.ADDRESS:
                return faAddressCard;
            case ProvidedDataTypes.COUNTRY:
                return faFlag;
            case ProvidedDataTypes.LIKE:
                return faHeart;
            case ProvidedDataTypes.LOGIN_INSTANCE:
                return faSignInAlt;
            case ProvidedDataTypes.LOGOUT_INSTANCE:
                return faSignOutAlt;
            case ProvidedDataTypes.PHOTO:
                return faImage;
            case ProvidedDataTypes.MESSAGE:
                return faComments;
            case ProvidedDataTypes.GENDER:
                return faVenusMars;
            case ProvidedDataTypes.DATE_OF_BIRTH:
                return faIdCard;
            case ProvidedDataTypes.JOIN_DATE:
                return faCalendar;
            case ProvidedDataTypes.SEARCH_QUERY:
                return faSearch;
            case ProvidedDataTypes.POST_SEEN:
                return faEye;
            case ProvidedDataTypes.PRIVACY_SETTING:
                return faUserCog;
            case ProvidedDataTypes.UPLOADED_CONTACT:
                return faAddressBook;
            case ProvidedDataTypes.IP_ADDRESS:
                return faNetworkWired;
            case ProvidedDataTypes.DEVICE:
                return faTablet;
            case ProvidedDataTypes.PROFILE_PICTURE:
                return faUserCircle;
            case ProvidedDataTypes.FOLLOWER:
                return faUserFriends;
            case ProvidedDataTypes.ACCOUNT_FOLLOWING:
                return faShoePrints;
            case ProvidedDataTypes.USERNAME:
                return faIdBadge;
            case ProvidedDataTypes.SESSION:
                return faBook;
            case ProvidedDataTypes.PEER_GROUP:
                return faUsers;
            case ProvidedDataTypes.EMPLOYMENT:
                return faBriefcase;
            case ProvidedDataTypes.VISITED_PAGE:
                return faFile;
            case ProvidedDataTypes.OFF_SITE_ACTIVITY:
                return faListAlt;
            case ProvidedDataTypes.EVENT_RESPONSE:
                return faCheck;
            case ProvidedDataTypes.TIMEZONE:
                return faClock;
            case ProvidedDataTypes.CURRENCY:
                return faMoneyBillWaveAlt;
            case ProvidedDataTypes.EDUCATION_EXPERIENCE:
                return faUniversity;
            case ProvidedDataTypes.REGISTRATION_DATE:
                return faUserPlus;
            case ProvidedDataTypes.MOBILE_DEVICE:
                return faMobile;
            case ProvidedDataTypes.PLAYED_SONG:
                return faMusic;
            case ProvidedDataTypes.INFERENCE:
                return faRobot;
            default:
                return faSquare;
        }
    }

    /**
     * Convert the datum provided by a data extraction diff into a string
     * @param datum ProviderDatum
     */
    static toString(datum: ProviderDatum<unknown, unknown>): JSX.Element | string {
        switch (datum.type) {
            case ProvidedDataTypes.PHOTO: {
                const { data: photo } = datum as Photo;   
                return <img src={photo.url} />;
            }
            case ProvidedDataTypes.ADDRESS: {
                const { data: address } = datum as Address;   
                return `${address.street} ${address.number} ${address.state && address.state + '\n'}`;
            }
            case ProvidedDataTypes.JOIN_DATE: {
                const { timestamp } = datum as ProviderDatum<Date, unknown>;
                return timestamp.toLocaleString();
            }
            case ProvidedDataTypes.PRIVACY_SETTING: {
                const { data: setting } = datum as PrivacySetting;
                return `${setting.key}: ${setting.value}`;
            }
            case ProvidedDataTypes.LOGIN_INSTANCE: {
                const { data: instance } = datum as LoginInstance;
                return new Date(instance * 1000).toLocaleString();
            }
            case ProvidedDataTypes.PROFILE_PICTURE: {
                const { data: src } = datum as ProfilePicture;
                return <img src={src} />;
            }
            case ProvidedDataTypes.SESSION: {
                const { data: session } = datum as Session;
                return `${session?.user_agent}, ${session?.ip_address} at ${session?.timestamp}`;
            }
            case ProvidedDataTypes.EMPLOYMENT: {
                const { data: { job_title, company } } = datum as Employment;
                return `${job_title} at ${company}`;
            }
            case ProvidedDataTypes.EVENT_RESPONSE: {
                const { data: { name, response } } = datum as EventResponse;
                return `${name} ${response && `(${response})`}`;
            }
            case ProvidedDataTypes.VISITED_PAGE: {
                const { data: { name } } = datum as VisitedPage;
                return name;
            }
            case ProvidedDataTypes.OFF_SITE_ACTIVITY: {
                const { data: { website, type } } = datum as OffSiteActivity;
                return `${type} at ${website}`;
            }
            case ProvidedDataTypes.EDUCATION_EXPERIENCE: {
                const { data: { institution, type } } = datum as EducationExperience;
                return `${type ? type + ' at ' : ''} ${institution}`;
            }
            case ProvidedDataTypes.MOBILE_DEVICE: {
                const { data: { type, os } } = datum as MobileDevice;
                return `${type} (${os})`;
            }
            case ProvidedDataTypes.REGISTRATION_DATE: {
                const { data: registrationDate } = datum as RegistrationDate;
                return registrationDate.toLocaleString();
            }
            case ProvidedDataTypes.PLAYED_SONG: {
                const { data: { track, artist } } = datum as PlayedSong;
                return `${artist} - ${track}`;
            }
            case ProvidedDataTypes.EMAIL:
            case ProvidedDataTypes.FIRST_NAME:
            case ProvidedDataTypes.LAST_NAME:
            case ProvidedDataTypes.FULL_NAME:
            case ProvidedDataTypes.IP_ADDRESS:
            case ProvidedDataTypes.USER_AGENT:
            case ProvidedDataTypes.USER_LANGUAGE:
            case ProvidedDataTypes.FOLLOWER:
            case ProvidedDataTypes.ACCOUNT_FOLLOWING:
            case ProvidedDataTypes.BLOCKED_ACCOUNT:
            case ProvidedDataTypes.HASHTAG_FOLLOWING:
            case ProvidedDataTypes.AD_INTEREST:
            case ProvidedDataTypes.TELEPHONE_NUMBER:
            case ProvidedDataTypes.DEVICE:
            case ProvidedDataTypes.USERNAME:
            case ProvidedDataTypes.PLACE_OF_RESIDENCE:
            case ProvidedDataTypes.COUNTRY:
            case ProvidedDataTypes.LIKE:
            case ProvidedDataTypes.MESSAGE:
            case ProvidedDataTypes.GENDER:
            case ProvidedDataTypes.SEARCH_QUERY:
            case ProvidedDataTypes.POST_SEEN:
            case ProvidedDataTypes.INFERENCE:
            default:
                return datum.data as string;
        }
    }

    /**
     * Convert the datum type to a description
     * @param datum 
     */
    static getDescription(datum: ProviderDatum<unknown, unknown>): string {
        switch(datum.type) {
            case ProvidedDataTypes.EMAIL:
                return 'A email adress';
            case ProvidedDataTypes.FIRST_NAME:
                return 'A first name';
            case ProvidedDataTypes.LAST_NAME:
                return 'A last name';
            case ProvidedDataTypes.FULL_NAME:
                return 'A full name, including first and last name';
            case ProvidedDataTypes.IP_ADDRESS:
                return 'An IP address';
            case ProvidedDataTypes.USER_AGENT:
                return 'A user-agent that was saved as part as a log file';
            case ProvidedDataTypes.USER_LANGUAGE:
                return 'A language that is used for browsing the platform';
            case ProvidedDataTypes.COOKIE:
                return 'A cookie that was saved';
            case ProvidedDataTypes.FOLLOWER:
                return 'A follower for the user';
            case ProvidedDataTypes.ACCOUNT_FOLLOWING:
                return 'Another account that the user is following';
            case ProvidedDataTypes.BLOCKED_ACCOUNT:
                return 'Another account that the user has blocked';
            case ProvidedDataTypes.HASHTAG_FOLLOWING:
                return 'A hashtag the user is following';
            case ProvidedDataTypes.AD_INTEREST:
                return 'An ad interest that was flagged by the system for the user';
            case ProvidedDataTypes.TELEPHONE_NUMBER:
                return 'A telephone number';
            case ProvidedDataTypes.COMMENT:
                return 'A comment made by the user';
            case ProvidedDataTypes.DEVICE:
                return 'A device that was used by the user on the platform';
            case ProvidedDataTypes.USERNAME:
                return 'A username that is used for a particular platform';
            case ProvidedDataTypes.PLACE_OF_RESIDENCE:
                return 'A place (city, town, village, etc.) where the user resides';
            case ProvidedDataTypes.ADDRESS:
                return 'A full adress, including street, number, ZIP-code and optionally state';
            case ProvidedDataTypes.COUNTRY:
                return 'The country where a user resides';
            case ProvidedDataTypes.LIKE:
                return 'A like thas been placed on a particular post';
            case ProvidedDataTypes.LOGIN_INSTANCE:
                return 'A saved instance of the user logging in';
            case ProvidedDataTypes.LOGOUT_INSTANCE:
                return 'A saved instance of the user logging out';
            case ProvidedDataTypes.PHOTO:
                return 'A photo';
            case ProvidedDataTypes.MESSAGE:
                return 'A message by the user, to another user';
            case ProvidedDataTypes.GENDER:
                return 'A gender';
            case ProvidedDataTypes.PROFILE_PICTURE:
                return 'A profile picture';
            case ProvidedDataTypes.DATE_OF_BIRTH:
                return 'A birth date';
            case ProvidedDataTypes.JOIN_DATE:
                return 'The date on which the user joined a platform';
            case ProvidedDataTypes.SEARCH_QUERY:
                return 'A search query by the user';
            case ProvidedDataTypes.POST_SEEN:
                return 'A post that the user has seen';
            case ProvidedDataTypes.PRIVACY_SETTING:
                return 'A privacy setting for the user';
            case ProvidedDataTypes.UPLOADED_CONTACT:
                return 'A telephone contact that has been uploaded by the user';
            case ProvidedDataTypes.SESSION:
                return 'A saved cookie with possibly extra information';
            case ProvidedDataTypes.PEER_GROUP:
                return 'A categorisation of the peer group you belong to';
            case ProvidedDataTypes.EMPLOYMENT:
                return 'A job held currently or in the past';
            case ProvidedDataTypes.VISITED_PAGE:
                return 'An in-site visited page';
            case ProvidedDataTypes.OFF_SITE_ACTIVITY:
                return 'Recorded activity outside of the platform website';
            case ProvidedDataTypes.EVENT_RESPONSE:
                return 'Response to an event invitation';
            case ProvidedDataTypes.TIMEZONE:
                return 'Timezone associated with the user';
            case ProvidedDataTypes.CURRENCY:
                return 'Currency associated with the user';
            case ProvidedDataTypes.EDUCATION_EXPERIENCE:
                return 'An education experience held currently or in the past';
            case ProvidedDataTypes.REGISTRATION_DATE:
                return 'Registration date for the platform';
            case ProvidedDataTypes.MOBILE_DEVICE:
                return 'A mobile device associated with the platform';
            case ProvidedDataTypes.INFERENCE:
                return 'An inference about an individual';
            case ProvidedDataTypes.PLAYED_SONG:
                return 'A song that has been played by the user';
            default:
                return '';
        }
    }
}

export default DataType;