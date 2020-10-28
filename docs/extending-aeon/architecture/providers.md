# Providers

The first point of Aeon is making sure data is retrieved from a series of sources. These sources are abstracted into **Providers**. In Aeon, a _Provider_ is a binding for a particular platform \(e.g. Facebook, Instagram, LinkedIn\) that can directly pull data, initiate data requests, download data and parse data. 

### Anatomy

Each Provider owns their own folder in `src/main/providers` , and may consist of several files making up two distinct elements: the Provider itself \(a class that either implements `Provider` or `DataRequestProvider`\), and a Parser that interprets the resulting data for visualisation. For instance, see the [Instagram Provider](https://github.com/leinelissen/aeon/blob/master/src/main/providers/instagram/index.ts) and [Instagram Parser](https://github.com/leinelissen/aeon/blob/master/src/main/providers/instagram/parser.ts).

The anatomy of what a Provider, Parser and datatypes look like are described in Typescript, and are available in the [Provider types file](https://github.com/leinelissen/aeon/blob/master/src/main/providers/types.ts). This should be a regular reference when starting to build out your own providers.

### Provider

A Provider is a class that implements the bindings for a particular service. In this example we'll focus on Instagram. Each provider follows a particular workflow that covers a set of methods a platform must support: `initialise`, `update`, `dispatchDataRequest`, `isDataRequestComplete` and `parseDataRequest`.

Please note that a Provider distinguishes between immediately accessible data \(i.e. that can be directly downloaded via an API\) as _updates,_ while data that takes a while to gather and is downloaded in one go is considered as _data requests_.

#### Initialisation

When the user wants to add an account for a certain platform, a new Provider is instantiated, and the thew `initialise` function is called. The point of this function is to authenticate a user to said platform, so that we can make further calls to the platform. In the case of Instagram, a very basic implementation of this looks as follows:

```typescript
class Instagram extends Provider {
    initialise(): Promise<boolean> {
        return withSecureWindow<boolean>(windowParams, (window) => {
            // Load a URL in the browser, and see if we get redirected or not
            const profileUrl = 'https://www.instagram.com/accounts/access_tool/ads_interests';
            window.loadURL(profileUrl);
            
            // Create a promise that should resolve when the user is logged in
            return new Promise((resolve) => {
                window.webContents.on('did-navigate', () => {
                    if (profileUrl === window.webContents.getURL()) {
                        resolve();
                    }
                });
            });
        });
    }
}
```

A BrowserWindow is opened containing a link to a protected URL. Instagram will normally redirect us to the login page, which is then shown to the user. We then wait for the login form to succeed and redirect us back to the original, protected URL. When we detect this change, the user has successfully logged in and we can return true. We can later use the cookies that are set in this instance, to send out specific requests.

_Small note: you'll find that this implementation slightly differs from the_ [_actual implementation_](https://github.com/leinelissen/aeon/blob/master/src/main/providers/instagram/index.ts)_, mostly in retrieving and setting cookies relevant for later use. This is the simplest implementation, but you should find inspiration in the fully-fledged implementations that are available in the repository._

#### Updates

Now that we have a set of cookies, we can talk to any Instagram data as if we are the user. Fortunately, Instagram has a set of data APIs available that we can immediately gather our data from:import scrapingUrls from './urls.json';

```typescript
import scrapingUrls from './urls.json';
// eg: [
//    "https://www.instagram.com/accounts/access_tool/account_privacy_changes?__a=1",
//    "https://www.instagram.com/accounts/access_tool/password_changes?__a=1",
//    "https://www.instagram.com/accounts/access_tool/former_emails?__a=1",
//     ....

class Instagram extends Provider {
    update = async (): Promise<ProviderFile[]> => {
        const cookies = await this.verifyLoggedInStatus();

        // We extract the right cookies, and create a config we can then
        // use for successive requests
        const sessionid = cookies.find(cookie => cookie.name === 'sessionid').value;
        
        // Then, we'll setup a config for each individual fetch requests
        const fetchConfig =  {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Referer: 'https://www.instagram.com/accounts/access_tool/ads_interests',
                'X-CSRFToken': crypto.randomBytes(20).toString('hex'),
                cookie: `sessionid=${sessionid}; shbid=${''}`
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
```

As you can see, we have a set of URLs available, and by stealing some of the cookies from the browser, we can just call all APIs, and return the data gathered from it to the ProviderManager. For this we follow the format `{ filepath: 'path_to_file', data: { //data }` . 

_Note that retrieving data from APIs may not as easy with all services. If you do not want to implement immediate updates, you can return `null` from this function._

#### Dispatch Data Requests

Lots of services have an automated way of downloading your data. You click a button, wait some time, and then download a .ZIP file. Our goal is to automate the entirety of this process, starting with actually requesting the data. In our reference, Instagram has a dedicated page for these kinds of requests:

```typescript
class Instagram extends Provider {
    async dispatchDataRequest(): Promise<void> {
        return withSecureWindow<void>(windowParams, async (window) => {
            // Load the dispatched window
            window.hide();
            await new Promise((resolve) => {
                window.webContents.on('did-finish-load', resolve)
                window.loadURL('https://www.instagram.com/download/request/');
            });

            // We'll click the button for the user, but we'll need to defer to the
            // user for a password
            window.webContents.executeJavaScript(`
                Array.from(document.querySelectorAll('button'))
                    .find(el => el.textContent === 'Next')
                    .click?.()
            `);
            window.show();

            // Now we must defer the page to the user, so that they can enter their
            // password. We then listen for a succesfull AJAX call 
            return new Promise((resolve) => {
                window.webContents.session.webRequest.onCompleted({
                    urls: [ 'https://*.facebook.com/*' ]
                }, (details: Electron.OnCompletedListenerDetails) => {
                    console.log('NEW REQUEST', details);

                    if (details.url === 'https://www.facebook.com/api/graphql/'
                        && details.statusCode === 200) {
                        resolve();
                    }
                });
            });             
        });
    }
}
```

As you can see, Instagram requires their user so enter a password before they can send out a request. To resolve this, we present this page to the user and wait for them to enter their password. We then use particular Electron listeners to wait for the form to be submitted.

#### Check if Data Request is complete

It then might take a while for the data request to resolve. We currently use a polling approach to periodically check the particular page to see if the request has been completed:

```typescript
class Instagram extends Provider {
    async isDataRequestComplete(): Promise<boolean> {
        return withSecureWindow<boolean>(windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve)
                window.loadURL('https://www.instagram.com/download/request/');
            });
            
            // Find a heading that reads 'Your Download is Ready'
            return window.webContents.executeJavaScript(`
                !!Array.from(document.querySelectorAll('h1'))
                    .find(el => el.textContent === 'Your Download is Ready');
            `);
        });
    }
}
```

This comes down to loading the page and seeing if a particular element \(in this case a h1 tag reading "Your download is ready"\) is present on the page. This functions thus return true or false depending on whether the request is complete.

#### Download the Data Request

If the data request is complete, all that is left is downloading it and passing it back to Aeon. This is done as follows:

```typescript
import { app } from 'electron';
import AdmZip from 'adm-zip';
import fs from 'fs';

const requestSavePath = path.join(app.getAppPath(), 'data');

class Instagram extends Provider {
    async parseDataRequest(extractionPath: string): Promise<ProviderFile[]> {
        return withSecureWindow<ProviderFile[]>(windowParams, async (window) => {
            // Load page URL
            await new Promise((resolve) => {
                window.webContents.once('did-finish-load', resolve)
                window.loadURL('https://www.instagram.com/download/request/');
            });

            await new Promise((resolve) => {
                // Now we defer to the user to enter their credentials
                window.webContents.once('did-navigate', resolve); 
                window.webContents.executeJavaScript(`
                    Array.from(document.querySelectorAll('button'))
                        .find(el => el.textContent === 'Log In Again')
                        .click?.()
                `);
            });


            // We can now show the window for the login screen
            window.show();

            // Then we'll await the navigation back to the data download page from
            // the login page
            await new Promise((resolve) => {
                window.webContents.once('will-navigate', resolve); 
            });

            // We can now close the window
            window.hide();

            // Now that we're successfully authenticated on the data download page,
            // the only thing we have to do is download the data.
            const filePath = path.join(requestSavePath, 'instagram.zip');
            await new Promise((resolve) => {
                // Create a handler for any file saving actions
                window.webContents.session.once('will-download', (event, item) => {
                    // Save the item to the data folder temporarily
                    item.setSavePath(filePath);
                    item.once('done', resolve);
                });

                // And then trigger the button click
                window.webContents.executeJavaScript(`
                    Array.from(document.querySelectorAll('button'))
                        .find(el => el.textContent === 'Download Data')
                        .click?.()
                `);
            });

            // We have the ZIP, all that's left to do is unpack it and pipe it to
            // the repository
            const zip = new AdmZip(filePath);
            await new Promise((resolve) => 
                zip.extractAllToAsync(extractionPath, true, resolve)
            );

            // Translate this into a form that is readable for the ParserManager
            const files = zip.getEntries().map((entry): ProviderFile => {
                return {
                    filepath: entry.entryName,
                    data: null,
                };
            });

            // And dont forget to remove the zip file after it's been processed
            await fs.promises.unlink(filePath);

            return files;
        });
    }
}
```

While this piece of code is a bit longer, the process is still quite simple. First, we click the download button for the user. As Instagram requires users to enter their password before downloading the file, we open the window to the user and wait for them to enter their password. We then wait for the download to be registered by the BrowserWindow, save it to a particular location, unpack it and return a list of the files that were created by this dump. Aeon will recognise this data, and create a new commit that includes all changed files from the dump.

#### withSecureWindow

In the reference implementations, you'll find ample use of the `withSecureWindow` function. This functions creates and spawns an [Electron BrowserWindow](https://www.electronjs.org/docs/api/browser-window) for the duration of a set of requests. It returns a promise that can be returned from the callback, and rejects if an error occurs, or the user closes the window. It makes it easy to create windows a user should interact with \(e.g. to log in or to manually click a button\), while keeping everything secure. If you wish to keep state \(i.e. cookies\) between different windows, you should specify a global `windowParams` object that is implemented in each call to `withSecureWindow`.

### Parsers

Now that data is actually present in the repository, we need to parse into a readable format for the front-end. We do this by means of parsers. The basic layout for a parser is as follows:

```typescript
const parsers: ProviderParser[] = [
    {
        source: 'accounts_following_you.json',
        schemas: [
            {
                key: 'text',
                type: ProvidedDataTypes.FOLLOWER
            }
        ],
    },
];
```

A parser is an array of files that have specific schemas attached to them. First, a new object is specified with a source: this is the filename for a particular file that is found in the repository folder for the particular Provider. Next, a schema is a mapping of a key found anywhere in that file, to a particular datatype. This means that in the file `accounts_following_you.json` , the schema looks for any value that is associated with the key `text`. This pieces of data is then associated with the `FOLLOWER` datatype when Aeon attempts to parse the data.

In case there isn't a neat mapping, or some data needs to be converted, a `transformer` can be set on the schema that interprets and transforms the data:

```typescript
import { parseISO } from 'date-fns';

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
        source: 'connections.json',
        schemas: [
            {
                key: 'following',
                type: ProvidedDataTypes.ACCOUNT_FOLLOWING,
                // Transform the data from { username: '9 Jan 2011', ... } to an array of 
                // objects that store both the username and the date
                transformer: (obj: GenericKeyedData): Partial<AccountFollowing>[] => {
                    // Loop through each available key on the object
                    return Object.keys(obj).map((key): Partial<AccountFollowing> => {
                        // Return an object in which the data is the key (username)
                        // and the timestamp is a JS Date object.
                        return {
                            data: key,
                            timestamp: parseISO(obj[key]),
                        };
                    });
                }
            }
        ],
    },
];
```

There are many more possibilities with the returned data and the transformer. Consult the [`ProviderParser` types](https://github.com/leinelissen/aeon/blob/master/src/main/providers/types.ts) to see what possibilities you can use. For instance, you can also specify multiple keys for the same schema.

### Registering Providers and Parsers

If you have managed to setup your own providers and parsers, the last thing that is left is registering them with Aeon. This is done in three places:

First, add the `Provider` class you created to the `providers` array in [`src/main/providers/index.ts`](https://github.com/leinelissen/aeon/blob/master/src/main/providers/index.ts). Then, add the resulting `ProviderParser` object to the `providerParsers` object in [`src/main/providers/parsers.ts`](https://github.com/leinelissen/aeon/blob/master/src/main/providers/parsers.ts). Lastly, add an icon for your provider to the `getIcon` method in [`src/app/utilities/Providers.ts`](https://github.com/leinelissen/aeon/blob/master/src/app/utilities/Providers.ts) to make sure your Provider appears pretty in the interface. Job well done!

