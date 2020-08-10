const wdio = require("webdriverio");

const opts = {
    host : "127.0.0.1",
    port: 4723,
    capabilities : {
        "platformName": "tvOS",
        "platformVersion": "13.3",
        "automationName": "XCUITest",
        "app": "com.dishdigital.sling-dev",
        "realDevice": true,
        "udid": "961b4cdc311028b2af6e6247058c3b3df93399f4",
        "deviceName": "Apple TV"
      }
};

const KEY_LAYOUT = {
    ' ' : [0,0],'a' : [0,1], 'b' : [0,2],'c' : [0,3],'d' : [0,4],'e' : [0,5],'f' : [0,6],'g' : [0,7],'h' : [0,8],
    '9' : [0,6],'j' : [0,10],'k' : [0,11],'l' : [0,12],'m' : [0,13],'n' : [0,14],'o' : [0,15],'p' : [0,16],'q' : [0,17],
    'r' : [0,18],'s' : [0,19],'t' : [0,20],'u' : [0,21],'v' : [0,22],'w' : [0,23],'x' : [0,24],'y' : [0,25],
    'z' : [0,26],
    '1' : [1,3],'2' : [1,4],'3' : [1,5],'4' : [1,6],'5' : [1,7],'6' : [1,8],'7' : [1,9],'8' : [1,10],
    '9' : [1,11],'0' : [1,12],'.' : [1,13],'-' : [1,14],'_' : [1,15],'@' : [1,16],
    '#' : [1,18],'$' : [1,19],'%' : [1,20],'^' : [1,21],'&' : [1,22],'*' : [1,23],'CAPS' : [2, 11],
    '$SMALL' : [2, 13],
    '$CAPS' : [2, 11],
    '$SPECIAL' : [2,15],
    '$DN' : [3, 11],
    '$NEXT' : [3, 11],
    '$DONE' : [3, 11]
}

async function moveKeyboardFocus(driver, cursor_index, to_index){
    console.log(cursor_index);
    console.log(to_index);
    console.log('Indices..');
    
    if(cursor_index[1] == to_index[1]){
        console.log('X is already in expected position..');
    }else{
        if(cursor_index[1] > to_index[1]){
            console.log('Will move left..');
            await movement(driver, 'Left', cursor_index[1]-to_index[1])
        }else{
            console.log('Will move right');
            await movement(driver, 'Right', to_index[1]-cursor_index[1])
        }
    }
    
    // Y Movement
    if(cursor_index[0] == to_index[0]){
        console.log('Y is already in expected position..');
    }else{
        if(cursor_index[0] > to_index[0]){
            console.log('Will move upwards..');
            await movement(driver, 'Up', cursor_index[0]-to_index[0])
        }else{
            console.log('Will move downwards');
            await movement(driver, 'Down', to_index[0]-cursor_index[0])
        }
    }
}

async function sendKeys(driver, text){
    await driver.pause(3000);
    let keys = [];
    if(text == '$DONE' || text == '$SMALL' || text == "$NEXT"){
        keys[0] = text;
    }else{
        keys = text.split('');
    }
    let cursor_index = [0,1];
    let state = 'SMALL';
    for(var i=0; i<keys.length; i++){
        if(isAlpha(keys[i])){
            if(isUpperCase(keys[i]) && state == 'SMALL'){
                // Need to switch the state to uppercase
                console.log('State is lower, but the character is upper, hence switching to upper case state..');
                await moveKeyboardFocus(driver, cursor_index, KEY_LAYOUT['$CAPS']);
                cursor_index = KEY_LAYOUT['$CAPS'];
                await driver.execute('mobile: pressButton', {name: 'Select'});
                state = 'CAPS'
            }else if(isLowerCase(keys[i]) && state == 'CAPS'){
                console.log('State is upper, but the character is lower, hence switching to lower case state..');
                await moveKeyboardFocus(driver, cursor_index, KEY_LAYOUT['$SMALL']);
                cursor_index = KEY_LAYOUT['$SMALL'];
                await driver.execute('mobile: pressButton', {name: 'Select'});
                state = 'SMALL'
            }
        }
        
        console.log('Searching for Key -> '+keys[i]);
        console.log('Current position -> ');
        console.log(cursor_index);
        console.log('Move to Position');

        let to_index = KEY_LAYOUT[keys[i]];
        console.log(to_index);
        // X Movement
        await moveKeyboardFocus(driver, cursor_index, to_index);
        // Click
        cursor_index = to_index;
        await driver.execute('mobile: pressButton', {name: 'Select'});
    }
}

function isLowerCase(str)
{
    return str == str.toLowerCase() && str != str.toUpperCase();
}

function isUpperCase(str)
{
    return str == str.toLowerCase() && str != str.toLowerCase();
}

async function movement(driver, direction, count){
    for(var i=0; i<count; i++){
        await driver.execute('mobile: pressButton', {name: direction});
    }
}

function isAlpha(str){
    return str.match(/^[^a-zA-Z]+$/) ? true : false;
}



// Settings Icon

// name = Icon Title & label = Settings
// Click
// Left
// Name = signoutButton & Label = Sign Out

// XCUIElementTypeKey, name='a'

// name=emailField, type=XCUIElementTypeTextField
// name=passwordField, type=XCUIElementTypeSecureTextField
// name=signinButton, label=Sign In, type=XCUIElementTypeOther
// name=forgotButton, label=Forgot Password?


function elementBySelector(selector){
    return `-ios predicate string:${selector}`;
    //   const element = await driver.$(`-ios predicate string:${selector}`)
}


async function selectElement(driver, element){
    // Check if element is focused, if not 
    // identify x movement
    // if expected x position +/- 50
    // Start with y movement.
    // Get required element's position.
    // while(driver.getElementAttribute(element.ELEMENT, 'focused'))
    
}

function isInPosition(exp_val, cur_val){
    console.log(exp_val, cur_val);
    
    if(cur_val <= (exp_val+50) && cur_val >= (exp_val-50)){
        console.log("IN POS..");
        return true
    }else{
        console.log("OUT OF POS..");
        return false
    }
}

async function navigateToElement(driver, element){
    console.log("Starting the Navigation Now...");
    let location = await element.getLocation();
    console.log('Elements location is ');
    console.log(location);
    
    console.log('Focused element..');
    let e = await driver.getActiveElement();
    console.log('Focused element location is');
    let cur_location = await driver.getElementLocation(e.ELEMENT);
    console.log(cur_location);
    
    // let focused_status = await driver.getElementAttribute(ele.ELEMENT, 'focused');
    // console.log("Element focus status is");
    // console.log(focused_status);

    if(isInPosition(location.x, cur_location.x) && isInPosition(location.y, cur_location.y)){
        console.log("We're focused on required element..");
        return
        // await driver.execute('mobile: pressButton', {name: 'Select'});
    }else{
        console.log("We're not in expected position. Hence Moving..");
        console.log("Adjusting X Coordinate..");
        // Adjust x position..
        while(true){
            e = await driver.getActiveElement();
            console.log('Focused element location is');
            cur_location = await driver.getElementLocation(e.ELEMENT);
            console.log(cur_location);
            if(isInPosition(location.x, cur_location.x)){
                console.log('X is in position now..');
                break;
            }
            if(cur_location.x < location.x){
                // Move Right.
                await driver.execute('mobile: pressButton', {name: 'Right'});
            }else{
                // Move Left.
                await driver.execute('mobile: pressButton', {name: 'Left'});
            }
            location = await element.getLocation();
        }
        console.log("Adjusting Y Coordinate..");
        // Adjust Y Position
        while(true){
            e = await driver.getActiveElement();
            console.log('Focused element location is');
            cur_location = await driver.getElementLocation(e.ELEMENT);
            console.log(cur_location);
            if(isInPosition(location.y, cur_location.y)){
                console.log('Y is in position now..');
                break;
            }
            if(cur_location.y < location.y){
                // Move Right.
                await driver.execute('mobile: pressButton', {name: 'Down'});
            }else{
                // Move Left.
                await driver.execute('mobile: pressButton', {name: 'up'});
            }
            location = await element.getLocation();
        }
    }
}


async function main2(){
    let driver = await wdio.remote(opts);
    let s = elementBySelector("label CONTAINS 'MY TV'")
    let element=await driver.$(s)
    await element.waitForExist(25000);
    await navigateToElement(driver, element)
    console.log('Will click on My TV');
    await driver.pause(5000);
    await driver.execute('mobile: pressButton', {name: 'Select'});
    console.log("\n\nClick on MY TV is completed....\n\n");
    await driver.pause(5000);
    s = elementBySelector("label CONTAINS 'Pick your'")
    element=await driver.$(s)
    await element.waitForExist(25000);
    await navigateToElement(driver, element)
    await driver.execute('mobile: pressButton', {name: 'Select'});
}

async function main1(){
    let driver = await wdio.remote(opts);
    // Wait for signin button.
    let s = elementBySelector("label = 'Sign In'")
    await (await driver.$(s)).waitForExist(25000);
    s = elementBySelector("name = 'emailField'")


    let f = await driver.$(s);
    await f.click();
    console.log('Clicked on Email Address');
    driver.pause(1000);
    // driver.$$('Enter New…')
    s = elementBySelector("name CONTAINS 'Enter New'")
    f = await driver.$(s);

    await navigateToElement(driver, f);
    await driver.execute('mobile: pressButton', {name: 'Select'});
    console.log("\n\nEnter New Button Clicked..\n\n");
    driver.pause(1000);

    s = elementBySelector("type == 'XCUIElementTypeTextView'")
    f = await driver.$(s);
    f.setValue("boomerang14@sling.com");
    driver.pause(1000);
    await sendKeys(driver, '$NEXT');
    s = elementBySelector("type == 'XCUIElementTypeTextView'")
    f = await driver.$(s);
    f.setValue("Watchm3");
    await sendKeys(driver, '$NEXT');
    s = elementBySelector("name == 'signinButton'")
    f = await driver.$(s);
    f.click();

    // driver.hideKeyboard();
    // await driver.sendKeyEvent('a');
    // await driver.pause(3000);
    // driver.hideKeyboard();
    // let activeElement = await driver.getActiveElement();

    // s = elementBySelector("name == 'f'")
    // f = await driver.$(s);
    // await navigateToElement(driver, f);
    
    // await sendKeys(driver, 'boo');
    // await sendKeys(driver, 'boomerang14@sling.com');
    // Next entry..
    // await sendKeys(driver, '$NEXT');
    // await sendKeys(driver, 'Watchm3');
    // await sendKeys(driver, '$DONE');


    // s = elementBySelector("name = 'a'")
    // f = await driver.$(s);
    // console.log(f);
    // await navigateToElement(driver, f);
    // console.log('Clicking on A');
    // await driver.execute('mobile: pressButton', {name: 'Select'});

    // s = elementBySelector("name = '9'")
    // f = await driver.$(s);
    // await f.click();
    // await navigateToElement(driver, f);
    // console.log('Clicking on A');
    // await driver.execute('mobile: pressButton', {name: 'Select'});

    console.log('DONE..');
}

async function main(){
    let driver = await wdio.remote(opts);

    let s = elementBySelector("label = 'My Channels'")

    await (await driver.$(s)).waitForExist(25000);
    console.log('Required element exists..');

    // Move down..
    // 1. Check if the cell exists, if not keep scrolling to the right until it's found..
    await driver.execute('mobile: pressButton', {name: 'Down'});
    let count = 0
    while(count < 50){
        let e = await driver.getActiveElement();
        let value = await driver.getElementAttribute(e.ELEMENT, 'label');
        value = value.split("\n").join(" ");
        console.log(value);
        if(value.indexOf('Favorite Channels') < 0){
            count ++;
            await driver.execute('mobile: pressButton', {name: 'Left'});
        }else{
            break;
        }
        // console.log('Using get Active Element');
        // console.log(e.getAttribute);
        // const label = await e.getAttribute('label');
        // console.log(label);
        
    }
    
    await driver.execute('mobile: pressButton', {name: 'Select'});

    s = elementBySelector("name CONTAINS '\"ESPN 3\"'");
    let ele = await driver.$(s);
    let location = await ele.getLocation();
    console.log('Elements location is ');
    console.log(location);
    
    console.log('Focused element..');
    let e = await driver.getActiveElement();
    console.log('Focused element location is');
    const ele_text = await driver.getElementText(e.ELEMENT);
    console.log('Focused Element Text -> '+ele_text);
    let cur_location = await driver.getElementLocation(e.ELEMENT);
    console.log(cur_location);
    
    // let focused_status = await driver.getElementAttribute(ele.ELEMENT, 'focused');
    // console.log("Element focus status is");
    // console.log(focused_status);

    if(isInPosition(location.x, cur_location.x) && isInPosition(location.y, cur_location.y)){
        console.log("We're focused on required element..");
        await driver.execute('mobile: pressButton', {name: 'Select'});
    }else{
        console.log("We're not in expected position. Hence Moving..");
        // Adjust x position..
        while(true){
            let e = await driver.getActiveElement();
            console.log('Focused element location is');
            let cur_location = await driver.getElementLocation(e.ELEMENT);
            console.log(cur_location);
            if(isInPosition(location.x, cur_location.x)){
                console.log('X is in position now..');
                break;
            }
            if(cur_location.x < location.x){
                // Move Right.
                await driver.execute('mobile: pressButton', {name: 'Right'});
            }else{
                // Move Left.
                await driver.execute('mobile: pressButton', {name: 'Left'});
            }
        }
        // Adjust Y Position
        while(true){
            let e = await driver.getActiveElement();
            console.log('Focused element location is');
            let cur_location = await driver.getElementLocation(e.ELEMENT);
            console.log(cur_location);
            if(isInPosition(location.y, cur_location.y)){
                console.log('Y is in position now..');
                break;
            }
            if(cur_location.y < location.y){
                // Move Right.
                await driver.execute('mobile: pressButton', {name: 'Down'});
            }else{
                // Move Left.
                await driver.execute('mobile: pressButton', {name: 'up'});
            }
        }
    }

    await driver.execute('mobile: pressButton', {name: 'Select'});

    // await (await driver.$(s)).waitForExist(5000);
    // await (await driver.$(s)).click();
    // await ele.click();
    // await (await driver.$('//XCUIElementTypeApplication[@name="Sling TV-53"]/XCUIElementTypeWindow/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeCollectionView/XCUIElementTypeCell[4]/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther')).click();
    // console.log("Click is complete...");
    
    // let name_attribs = await driver.getElementAttribute(ele.ELEMENT, 'name');
    // console.log("Name Attributes are");
    // console.log(name_attribs);
    
    // s = elementBySelector("name = 'DummyAssetCell'");
    // let ele = await driver.$(s);
    // ele.click();
    // console.log('Clicked on Element..');
    // driver.pause(2000);
    // Click on Edit your favourite channel..
    // s = elementBySelector("label = 'Edit your Favorite Channels'");
    // ele = await driver.$(s);

    // console.log('Found my element. Will click now..');
    // ele.click();
    
    
    // let pageSource = await driver.getPageSource();
    // console.log(pageSource);



}

main2().then(function(){
    console.log('Done');
})