Object.extend = function(destination, source) {
  for (var property in source) {
    if (source.hasOwnProperty(property)) {
      destination[property] = source[property];
    }
  }
  return destination;
};

(function() {
  var authTabId = 0;

  parseToken = function(message) {
    return message.match(/access_token=(\w+)/)[1]
  }

  setToken = function(message, callback) {
    chrome.storage.local.set(
      { access_token: parseToken(message) },
      callback
    );
  }

  getToken = function(callback) {
    chrome.storage.local.get('access_token', function(d) {
      callback(d.access_token);
    });
  }

  validToken = function(args) {
    opts = Object.extend({
      valid: function(token) {},
      invalid: function() {},
      always: function() {}
    }, args)

    getToken(function(token) {
      if (token && token != "")
        opts.valid(token);
      else
        opts.invalid();
      opts.always();
    });
  }

  chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
      if(request.message) {
        setToken(request.message, function() {
          chrome.tabs.remove(authTabId);
        });
      }
    }
  );

  chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "gh_auth");
    port.onMessage.addListener(function(msg) {
      if (msg.auth) {
        validToken({
          invalid: function() {
            var newURL = 'https://salty-basin-7245.herokuapp.com/authorize?scope=repo,read:org';
            chrome.tabs.create({ url: newURL }, function(data) {
              authTabId = data.id;
            });
          },
          valid: function(token) {
            console.log("already authd with token", token);
          }
        });
      }
    });
  });
})()
