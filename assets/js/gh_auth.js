


var port = chrome.runtime.connect({name: "gh_auth"});
port.postMessage({auth: true});
port.onMessage.addListener(function(msg) {
  console.log(msg);
});
