function bigCalc(startVal, callback) {
    // imagine hundreds of lines of code here...
    var endVal = startVal + 2;
    // return to sender
    callback(endVal);
}

UniversalWebApp.backgroundInit({
    appName: 'Universal WebApp',
    devMode: true
});
