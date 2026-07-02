console.log('[background.js] sentinel-apiproxy.ts loaded');

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
export let pendingSessionData: {
    cookies: chrome.cookies.Cookie[], 
    headers: chrome.webRequest.HttpHeader[] | undefined}  | null  = null;
let pendingTenantData: string | null = null;

const DEBOUNCE_MS = 500;

    function flushLatestData(){
        if (pendingSessionData){
            chrome.runtime.sendMessage({
                source: "[background.js]",
                type: 'tenantId',
                data: pendingTenantData
            });

        //    pendingTenantData = null;
        }

        if (pendingSessionData){
            chrome.runtime.sendMessage({
                source: '[background.js]',
                type: 'sessionData',
                data: pendingSessionData
            });
        //    pendingSessionData = null;
        }
    }

    function scheduledFlush(){
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(()=> {
           debounceTimer = null;
           flushLatestData();
        }, DEBOUNCE_MS)
    }

    function getRequestHeader(details: chrome.webRequest.OnBeforeSendHeadersDetails):any {
        chrome.tabs.query({url: "https://security.microsoft.com/*"},
            (tabs) => {
                if (!tabs.length) return;

                const tab = tabs[0];

                const tenantId = new URL(details.url).searchParams.get('tid');
                    if (tenantId){
                            pendingTenantData = tenantId;
                    }

                chrome.cookies.getAll({url: tab.url},
                    cookies => {
                        pendingSessionData = {
                            cookies, 
                            headers: details.requestHeaders
                        };
                        scheduledFlush();
                    }
                )
            }
        )
    }

chrome.webRequest.onBeforeSendHeaders.addListener( 
    getRequestHeader, 
    {urls: ['https://security.microsoft.com/apiproxy/*']},
    ['requestHeaders']
)

export {};