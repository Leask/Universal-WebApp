
var initialVal=1;
var calculatedVal=0 ;

UniversalWebApp.foregroundInit({
    appName: 'Universal WebApp',
    devMode: true
});


UniversalWebApp.callBackground('bigCalc', initialVal, function(result) {
    console.log(result);
});
