export default class AndroidUtils {
  constructor(props) {
    // super(props);
    console.log("Creating utils object..");
  }

  async findElement(driver, element_props) {
    let element;
    if (element_props.XPath) {
      element = await this.getElement(driver, "xpath", element_props.XPath);
    } else if (element_props.text) {
      element = await this.getElement(driver, "text", element_props.text);
    } else if (element_props["resource-id"]) {
      element = await this.getElement(
        driver,
        "resource-id",
        element_props["resource-id"]
      );
    }
    return element;
  }
  async goingtoribbon(driver, element_props, ribbon_name, tile_name) {
    let element = await this.getElement(
      driver,
      "xpath",
      `//androidx.recyclerview.widget.RecyclerView[@content-desc="${ribbon_name}"]/android.widget.FrameLayout[1]/android.widget.LinearLayout/android.widget.FrameLayout/android.widget.ImageView`
    );
    if(element.error){
      return element
    }
    console.log("FOCUS - Navigating to Element");
    await this.navigateToElement(driver, element);
    console.log("FOCUS - Navigation completed..");
    return element;
  }
  async goingtotile(driver, element_props, ribbon_name, tile_name){
    console.log('Going to ribbon..');
    console.log(element_props, ribbon_name, tile_name);
    await this.goingtoribbon(driver, element_props, ribbon_name, tile_name);
    console.log('Ribbon Navigation Done...');
    let element = await this.getElement(driver, "multi", {text: tile_name, class_name: 'android.widget.TextView'});
    if(element.error){
      return element
    }
    element.ELEMENT = element.elementId;
    console.log(element);
    console.log("FOCUS - Navigating to Element");
    await this.navigateToElement(driver, element);
    console.log("FOCUS - Navigation completed..");
    return element;
  }

  async getElement(driver, key, selector) {
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
      const android_selector = 'new UiSelector().text("'+selector.text+'").className("'+selector.class_name+'")';
      console.log(android_selector);
      const element = await driver.$(`android=${android_selector}`)
      return element;
    }
  }

  isInPosition(exp_val, cur_val, delta) {

    console.log(exp_val, cur_val);
    if(!delta){
      if (cur_val <= exp_val + 50 && cur_val >= exp_val - 50) {
        console.log("IN POS..");
        return true;
      } else {
        console.log("OUT OF POS..");
        return false;
      }
    }else{
      console.log("Cur ->"+cur_val);
      // Buffer of 25 px to avoid overlapping
      if (exp_val+20 <=  cur_val + delta && exp_val >= cur_val) {
        console.log("IN POS..");
        return true;
      } else {
        console.log("OUT OF POS..");
        return false;
      }
    }
    
  }

  async getActiveElement(driver){
    let e = await this.findElement(driver, {XPath: "//*[@focused='true']"})
    console.log(e);
    let cur_location = await driver.getElementLocation(e.ELEMENT);
    console.log(cur_location);
    return e;
  }

  async remoteFunctions(driver, action) {
    if (action == "home") {
      await driver.pressKeyCode(3);
    } else if (action == "up") {
      await driver.pressKeyCode(19);
    } else if (action == "left") {
      await driver.pressKeyCode(21);
    } else if (action == "select") {
      await driver.pressKeyCode(23);
    } else if (action == "right") {
      await driver.pressKeyCode(22);
    } else if (action == "down") {
      await driver.pressKeyCode(20);
    } else if (action == "back") {
      await driver.pressKeyCode(4);
    }
  }

  async navigateToElement(driver, element) {
    
    console.log("Starting the Navigation Now...");
    let location = await driver.getElementLocation(element.ELEMENT);
    console.log("Elements location is ");
    console.log(location);

    // console.log("Focused element..");
    // let e = await driver.getActiveElement();
    let e = await this.findElement(driver, {XPath: "//*[@focused='true']"})
    console.log(e);
    console.log("Focused element location is");
    let cur_location = await driver.getElementLocation(e.ELEMENT);
    console.log(cur_location);

    // let focused_status = await driver.getElementAttribute(ele.ELEMENT, 'focused');
    // console.log("Element focus status is");
    // console.log(focused_status);

    if (
      this.isInPosition(location.x, cur_location.x, cur_location.width) &&
      this.isInPosition(location.y, cur_location.y, cur_location.height)
    ) {
      console.log("We're focused on required element..");
      return;
      // await driver.execute('mobile: pressButton', {name: 'Select'});
    } else {
      console.log("We're not in expected position. Hence Moving..");
      console.log("Adjusting Y Coordinate..");
      // Adjust Y Position
      while (true) {
        e = await this.getActiveElement(driver);
        location = await driver.getElementLocation(element.ELEMENT);
        console.log("Focused element location is");
        cur_location = await driver.getElementRect(e.ELEMENT);
        console.log(cur_location);
        console.log(location);

        if (this.isInPosition(location.y, cur_location.y, cur_location.height)) {
          console.log("Y is in position now..");
          break;
        }
        if (cur_location.y < location.y) {
          // Move Right.
          await this.remoteFunctions(driver, 'down');
          // await driver.execute("mobile: pressButton", { name: "Down" });
        } else {
          // Move Left.
          await this.remoteFunctions(driver, 'up');
          // await driver.execute("mobile: pressButton", { name: "up" });
        }
        location = await driver.getElementLocation(element.ELEMENT);
      }
      console.log("Adjusting X Coordinate..");
      // Adjust x position..
      while (true) {
        e = await this.getActiveElement(driver);
        location = await driver.getElementRect(element.ELEMENT);
        console.log("Focused element location is");
        cur_location = await driver.getElementRect(e.ELEMENT);
        console.log(cur_location);
        console.log('Expected element location is');
        console.log(location);
        
        if (this.isInPosition(location.x, cur_location.x, cur_location.width)) {
          console.log("X is in position now..");
          break;
        }
        if (cur_location.x < location.x) {
          // Move Right.
          await this.remoteFunctions(driver, 'right');
          // await driver.execute("mobile: pressButton", { name: "Right" });
        } else {
          // Move Left.
          await this.remoteFunctions(driver, 'left');
          // await driver.execute("mobile: pressButton", { name: "Left" });
        }
        location = await driver.getElementLocation(element.ELEMENT);
      }
    }
  }
}
