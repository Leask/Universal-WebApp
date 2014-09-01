var initialVal=1;
var calculatedVal=0 ;

UniversalWebApp.foregroundInit();

UniversalWebApp.callBackground('bigCalc', initialVal, function(res) {
    console.log(res);
});

