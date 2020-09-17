import React from 'react';
import {
    ProvidedDataTypes,
    ProviderDatum,
    Address,
    Photo,
    PrivacySetting,
    LoginInstance,
    ProfilePicture,
    Session
} from 'main/providers/types';
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
    faSignIn,
    faSignOut,
    faImage,
    faComments,
    faVenusMars,
    faIdCard,
    faLanguage,
    faIdBadge,
    faCalendar,
    faSearch,
    faEye,
    faBlinds,
    faAddressBook,
    faEnvelope,
    faNetworkWired,
    faTablet,
    faUserCircle,
    faUserFriends,
    faShoePrints,
    faBookAlt
} from 'app/assets/fa-light';

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
                return faSignIn;
            case ProvidedDataTypes.LOGOUT_INSTANCE:
                return faSignOut;
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
                return faBlinds;
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
                return faBookAlt;
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
            default:
                return datum.data as string;
        }
    }
}

export default DataType;