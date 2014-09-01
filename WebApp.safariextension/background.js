function bigCalc(startVal, callback) {
    // imagine hundreds of lines of code here...
    var endVal = startVal + 2;
    // return to sender
    callback(endVal);
}


var self = typeof self != 'undefined' ? self : this;

var UniversalWebApp = {
    browser: 'safari',
    // browser: 'chrome',
    foregroundCallbacks: [],
    foregroundInit: function() {
        switch (this.browser) {
            case 'safari':
                safari.self.addEventListener('message', this.foregroundCallbackHandler, false);
                break;
            case 'chrome':
                //
        }
    },
    backgroundInit: function() {
        switch (this.browser) {
            case 'safari':
                safari.application.addEventListener('message', this.backgroundCallbackHandler, false);
                break;
            case 'chrome':
                //
        }
    },
    foregroundCallbackHandler: function(theMessageEvent) {
        var rawEvent = JSON.parse(theMessageEvent.name);
        UniversalWebApp.foregroundCallbacks[rawEvent.callback_index](theMessageEvent.message);
        delete UniversalWebApp.foregroundCallbacks[rawEvent.callback_index];
    },
    backgroundCallbackHandler: function(theMessageEvent) {
        var rawEvent = JSON.parse(theMessageEvent.name);
        if (typeof rawEvent.method === 'string' && rawEvent.method !== '' && typeof self[rawEvent.method] === 'function') {
            self[rawEvent.method](theMessageEvent.message, function(res) {
                theMessageEvent.target.page.dispatchMessage(theMessageEvent.name, res);
            });
            return true;
        }
        return false;
    },
    callBackground: function(method, args, callback) {
        // var browser = 'chrome';
        switch (this.browser) {
            case 'safari':
                var callback_index = this.foregroundCallbacks.push(callback) - 1;
                safari.self.tab.dispatchMessage(JSON.stringify({
                    method         : method,
                    callback_index : callback_index
                }), args);
                break;
            case 'chrome':

        }
    }
};

UniversalWebApp.backgroundInit();
