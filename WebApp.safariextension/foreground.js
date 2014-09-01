
// just a demo


// init UniversalWebApp

UniversalWebApp.foregroundInit({
    appName: 'Universal WebApp',
    devMode: true
});


// put your foreground codes below

UniversalWebApp.callBackground(
    'test',                  // background method name
    'Across the Great Wall', // passing params
    function(result) {       // callback function
        console.log(result);
    }
);
