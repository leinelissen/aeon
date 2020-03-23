import { Provider, ProviderFile } from '../types';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { BrowserWindow } from 'electron';

const scrapingUrls = [
    'https://www.instagram.com/accounts/access_tool/account_privacy_changes?__a=1',
    'https://www.instagram.com/accounts/access_tool/password_changes?__a=1',
    'https://www.instagram.com/accounts/access_tool/former_emails?__a=1',
    'https://www.instagram.com/accounts/access_tool/former_phones?__a=1',
    'https://www.instagram.com/accounts/access_tool/current_follow_requests?__a=1',
    'https://www.instagram.com/accounts/access_tool/accounts_following_you?__a=1',
    'https://www.instagram.com/accounts/access_tool/accounts_you_follow?__a=1',
    'https://www.instagram.com/accounts/access_tool/hashtags_you_follow?__a=1',
    'https://www.instagram.com/accounts/access_tool/accounts_you_blocked?__a=1',
    'https://www.instagram.com/accounts/access_tool/logins?__a=1',
    'https://www.instagram.com/accounts/access_tool/logouts?__a=1',
    'https://www.instagram.com/accounts/access_tool/search_history?__a=1',
    'https://www.instagram.com/accounts/access_tool/former_usernames?__a=1',
    'https://www.instagram.com/accounts/access_tool/former_full_names?__a=1',
    'https://www.instagram.com/accounts/access_tool/former_bio_texts?__a=1',
    'https://www.instagram.com/accounts/access_tool/former_links_in_bio?__a=1',
    'https://www.instagram.com/accounts/access_tool/story_poll_votes?__a=1',
    'https://www.instagram.com/accounts/access_tool/story_emoji_slider_votes?__a=1',
    'https://www.instagram.com/accounts/access_tool/story_question_responses?__a=1',
    'https://www.instagram.com/accounts/access_tool/story_question_music_responses?__a=1',
    'https://www.instagram.com/accounts/access_tool/story_countdown_follows?__a=1',
    'https://www.instagram.com/accounts/access_tool/story_quiz_responses?__a=1',
    'https://www.instagram.com/accounts/access_tool/ads_interests?__a=1',
];

class Instagram implements Provider {
    key = 'instagram';

    async update(): Promise<ProviderFile[]> {
        // In order to retrieve login cookies, we create a new window into which
        // the user enters theirs credentials.
        const window = new BrowserWindow({ width: 400, height: 400});
        const toolUrl = 'https://www.instagram.com/accounts/access_tool/';
        await window.webContents.session.clearCache();
        window.loadURL(toolUrl);

        // We then bind a handler to navigation changes and wait until a user is
        // successfully logged in.
        const cookies: Electron.Cookie[] = await new Promise((resolve) => {
            window.webContents.on('did-navigate', async (event, url) => {
                if (toolUrl === url) {
                    // If the user is successfully login, we hijack the cookies
                    // from the window and the close it.
                    const cookies = await(window.webContents.session.cookies.get({ url: 'https://instagram.com' }))
                    window.close();
                    resolve(cookies);
                }
            });
        });

        console.log(cookies);

        // We then extract the right cookies, and create a config we can then
        // use for successive requests
        const sessionid = cookies.find(cookie => cookie.name === 'sessionid').value;
        const shbid = cookies.find(cookie => cookie.name === 'shbid').value;
        const fetchConfig =  {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Referer: 'https://www.instagram.com/accounts/access_tool/ads_interests',
                'X-CSRFToken': crypto.randomBytes(20).toString('hex'),
                cookie: `sessionid=${sessionid}; shbid=${shbid}`
            },
        };

        // Now we do all API requests in order to retrieve the data
        const responses = await Promise.all(
            scrapingUrls.map(url => 
                fetch(url, fetchConfig).then(response => response.json())
            )
        );

        // We then transform the data so that we can return it to the handler
        return responses.map(response => {
            return {
                filepath: `${response.page_name}.json`,
                data: JSON.stringify(response.data.data, null, 4),
            };
        });
    }
}

export default Instagram;