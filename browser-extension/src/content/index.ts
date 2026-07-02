
chrome.runtime.onMessage.addListener(
    function(msg: any, sender: chrome.runtime.MessageSender, sendResponse){
        if (msg?.type === 'content'){
            const h1 = document.createElement('h1');
            const text = document.createTextNode(`Please contact ${msg}`);
            h1.appendChild(text);
            document.body.appendChild(h1);
            sendResponse('Successfully added'); 
        }
        return true;
    }
)