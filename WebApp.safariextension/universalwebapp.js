
var self = typeof self != 'undefined' ? self : this;


var UniversalWebApp = {

    browser: null,

    appName: 'Universal WebApp',

    foregroundCallbacks: [],

    devMode: false,

    log: function() {
        return this.devMode ? console.log.apply(
            console, ['[' + this.appName + ']'].concat([].slice.call(arguments))
        ) : null;
    },

    getCurUrl: function(callback) {
        // returning feature is for Safari only!
        switch (this.browser) {
            case 'safari':
                var url = safari.application.activeBrowserWindow.activeTab.url;
                if (typeof callback === 'function') {
                    callback(url);
                }
                return url;
            case 'chrome':
                return chrome.tabs.query({
                    active  : true,
                    windowId: chrome.windows.WINDOW_ID_CURRENT
                }, function(tabs) {
                    callback(tabs[0].url);
                });
            default:
                return null;
        }
    },

    getAppUrl: function(path) {
        switch (this.browser) {
            case 'safari':
                return safari.extension.baseURI + path;
            case 'chrome':
                return chrome.extension.getURL(path);
            default:
                return null;
        }
    },

    browserIdentify: function() {
        if (typeof safari !== 'undefined') {
            return (this.browser = 'safari');
        } else if (typeof chrome !== 'undefined') {
            return (this.browser = 'chrome');
        } else {
            return (this.browser = null);
        }
    },

    init: function(options) {
        if (options) {
            if (options.appName) {
                this.appName = options.appName;
            }
            if (options.devMode) {
                this.devMode = options.devMode;
            }
        }
        this.browserIdentify();
    },

    foregroundInit: function(options) {
        this.init(options);
        switch (this.browser) {
            case 'safari':
                return safari.self.addEventListener(
                    'message', this.foregroundCallbackHandler, false
                );
                break;
            case 'chrome':
                // NOTHING TO DO
                return true;
            default:
                return null;
        }
    },

    backgroundInit: function(options) {
        this.init(options);
        switch (this.browser) {
            case 'safari':
                return safari.application.addEventListener(
                    'message', this.backgroundCallbackHandler, false
                );
                break;
            case 'chrome':
                // chrome.runtime.onMessage.addListener.apply(
                //     chrome.runtime.onMessage, arguments
                // );
                return chrome.runtime.onMessage.addListener(
                    function (request, sender, sendResponse) {
                        if (typeof request.method == 'string'
                                && request.method != ''
                    && typeof self[request.method] == 'function') {
                            self[request.method](
                                request.params, function(result) {
                                    sendResponse(result);
                                }
                            );
                            return true;
                        }
                        return false;
                    }
                );
        }
    },

    foregroundCallbackHandler: function(theMessageEvent) {
        var rawEvent = null;
        try {
            rawEvent = JSON.parse(theMessageEvent.name);
        } catch (error) {
            return null;
        }
        if (typeof UniversalWebApp.foregroundCallbacks[rawEvent.callback_index]
        !== 'function') {
            return null;
        }
        UniversalWebApp.foregroundCallbacks[rawEvent.callback_index](
            theMessageEvent.message
        );
        return delete UniversalWebApp.foregroundCallbacks[
            rawEvent.callback_index
        ];
    },

    backgroundCallbackHandler: function(theMessageEvent) {
        var rawEvent = null;
        try {
            rawEvent = JSON.parse(theMessageEvent.name);
        } catch (error) {
            return null;
        }
        if (typeof rawEvent.method  === 'string'
                && rawEvent.method  !== ''
    && typeof self[rawEvent.method] === 'function') {
            self[rawEvent.method](theMessageEvent.message, function(result) {
                if (typeof theMessageEvent.target === 'undefined') {
                    theMessageEvent.message = result;
                    // @todo: this [0] is a walkaround
                    return safari.extension.popovers[0]
                          .contentWindow.UniversalWebApp
                          .foregroundCallbackHandler(theMessageEvent);
                } else {
                    return theMessageEvent.target.page.dispatchMessage(
                        theMessageEvent.name, result
                    );
                }
            });
        }
        return false;
    },

    dispatchMessage: function(name, message) {
        if (safari.self.tab) {
            safari.self.tab.dispatchMessage(name, message);
        } else if (safari.extension.globalPage.contentWindow) {
            safari.extension.globalPage
           .contentWindow.UniversalWebApp
           .backgroundCallbackHandler({name: name, message: message});
        }
    },

    callBackground: function(method, params, callback) {
        callback = typeof callback === 'function' ? callback : function() {};
        switch (this.browser) {
            case 'safari':
                var callback_index = this.foregroundCallbacks.push(callback)
                                   - 1;
                this.dispatchMessage(JSON.stringify({
                    method         : method,
                    callback_index : callback_index
                }), params);
                break;
            case 'chrome':
                chrome.runtime.sendMessage(
                    {method: method, params: params},
                    function(result) { callback(result); }
                );
        }
    }

};
