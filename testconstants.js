const options = {
    android : {
        port: 4723,
        capabilities : {
            "platformName": "Android",
            "platformVersion": "9",
            "noReset": true,
            "automationName": "UIAutomator2",
            "appActivity": "com.movenetworks.StartupActivity",
            "udid": "G070L82292871PLQ",
            "deviceName": "FireTV",
            "appPackage": "com.sling",
            "newCommandTimeout": 100000
        }
    },
    roku : {
        capabilities: {
            hostname : "10.0.25.141",
            port : 9517,
            path: '/',
            capabilities : {
            'browserStartWindow': '*', 
            'reuseUI': true
            },
            logLevel:"error"
        }        
    }
}

module.exports=options;

