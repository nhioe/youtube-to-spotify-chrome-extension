/*global chrome*/

// Extract the authorization code from the URL
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // Send the code to the background script to get the token
  chrome.runtime.sendMessage({ action: 'getToken', code: code }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Runtime error:', chrome.runtime.lastError.message);
      return;
    }
    if (response && response.success) {
      console.log('Access Token:', response.token);
    } else {
      console.error(
        'Error retrieving token:',
        response ? response.error : 'No response',
      );
    }
  });
} else {
  console.error('No authorization code found.');
}
window.close();
