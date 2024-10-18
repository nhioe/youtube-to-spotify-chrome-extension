/*global chrome*/

import { getToken, refreshToken } from "./authTokens.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openAuthTab') {
        chrome.tabs.create({ url: request.url });
        sendResponse({ success: true });
        return false;
    } 
    else if (request.action === 'getToken') {
        getToken(request.code)
            .then(token => {
                console.log("Token received:", token);
                sendResponse({ success: true, token });
            })
            .catch(error => {
                console.error('Error retrieving token:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    } 
    else if (request.action === 'refreshToken') {
        refreshToken()
            .then(token => {
                console.log("Token refreshed:", token);
                sendResponse({ success: true, token });
            })
            .catch(error => {
                console.error('Error refreshing token:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true;
    } 
    else {
        console.error('Unknown action:', request.action);
        sendResponse({ success: false, error: 'Unknown action' });
        return false;
    }
});