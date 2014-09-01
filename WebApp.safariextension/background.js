
// just a demo


// init UniversalWebApp

UniversalWebApp.backgroundInit({
    appName: 'Universal WebApp',
    devMode: true
});


// put your background codes below

function test(val, callback) {
    // imagine hundreds of lines of code here...
    var result = val + ', we can reach every corner in the world.';
    // return to sender
    callback(result);
}
