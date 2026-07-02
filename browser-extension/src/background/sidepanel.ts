console.log('[background.js] sidepanel.ts loaded');

chrome.sidePanel
          .setPanelBehavior({ openPanelOnActionClick: true })
          .catch((error) => console.error(error));

chrome.runtime.onInstalled.addListener(() => {
    console.log('[background] sidepanel.ts loaded');
})

export {}
