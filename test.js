const wdio = require("webdriverio");
let opts= {port:4723};
opts["capabilities"] = {
    "platformName": "Android",
    "platformVersion": "9",
    "noReset": true,
    "automationName": "UIAutomator2",
    "appActivity": "com.movenetworks.StartupActivity",
    "udid": "G070L82292871PLQ",
    "deviceName": "FireTV",
    "appPackage": "com.sling",
    "newCommandTimeout": 100000
};
opts["logLevel"] = "error";
console.log(opts);

let main = async () => {
   let driver = await wdio.remote(opts)
   console.log("Driver initialized")
   let found = 0;
   let count = 30;
   await driver.pause(25000);
   let ele = await getElement(driver, 'xpath', '//androidx.recyclerview.widget.RecyclerView[@content-desc="Trending Live"]/android.widget.FrameLayout[1]/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.ImageView');
   console.log(ele);

   ele = await getElement(driver, 'multi', {text: 'Friends', class_name: 'android.widget.TextView'});
   console.log(ele);
   driver.elementClick(ele.elementId)
}


let getElement = async (driver, key, selector) => {
    if (key == "xpath") {
      let element = await driver.findElement("xpath", selector);
      return element;
    } else if (key == "resource-id") {
      const android_selector =
        'new UiSelector().resourceId("' + selector + '")';
      const element = await driver.$(`android=${android_selector}`);
      return element;
    } else if (key == "text") {
      const android_selector =
        'new UiSelector().textContains("' + selector + '")';
      const element = await driver.$(`android=${android_selector}`);
      return element;
    } else if (key == "multi") {
      console.log('Its a multiple element');
      // const android_selector = `new UiSelector().resourceId("${selector.resource_id}").text("${selector.text}")`;
      const android_selector = 'new UiSelector().text("'+selector.text+'").className("'+ selector.class_name +'")';
      console.log(android_selector);
      const element = await driver.$(`android=${android_selector}`)
      return element;
    }
}



main().then(function(d){
    console.log("Done");
})
