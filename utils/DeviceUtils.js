export default class DeviceUtils {
  constructor(props) {
    // super(props);
    console.log("Creating utils object..");
  }

  getPossibleLocator(key, obj) {
    // console.log("---Locator Props----");
    // console.log(obj);
    if (obj !== null && obj !== undefined) {
      if (key == "name" && key in obj) {
        try {
          let resp = JSON.parse(obj[key]);
          console.log("\n\n\n-------------*********------------");
          console.log("name CONTAINS '\"" + resp.channelName + "\"'");

          console.log("-------------*********------------\n\n\n");

          return "name CONTAINS '\"" + resp.channelName + "\"'";
        } catch (error) {}
      }
    }

    if (key in obj) {
      if (obj[key] !== null && obj[key] !== undefined) {
        if (obj[key] != "") {
          return key + "=='" + obj[key] + "'";
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  constructElementSelector(element_props) {
    let locator = "";
    let locators = [];
    let ids = ["name", "label", "value"];
    console.log("Constructing element locator");
    console.log(element_props);

    for (var i = 0; i < ids.length; i++) {
      const resp = this.getPossibleLocator(ids[i], element_props);
      if (resp) {
        // console.log('Including -> '+resp);
        locators.push(resp);
      }
    }
    locator = locators.join(" && ");
    console.log("Locators are --> " + locator);

    return this.elementBySelector(locator);
  }

  getElement(element_props) {
    const selector = this.constructElementSelector(element_props);
    console.log(selector);

    // const identifier = this.elementBySelector(selector);
    return selector;
  }

  isInPosition(exp_val, cur_val) {
    console.log(exp_val, cur_val);

    if (cur_val <= exp_val + 50 && cur_val >= exp_val - 50) {
      console.log("IN POS..");
      return true;
    } else {
      console.log("OUT OF POS..");
      return false;
    }
  }

  elementBySelector(selector) {
    return `-ios predicate string:${selector}`;
  }

  async tvRemoteEvent(driver, event) {
    console.log("Executing remote event -> " + event);
    if (event == "back") {
      event = "menu";
    }
    await driver.execute("mobile: pressButton", { name: event });
  }

  async sendKeys(driver, element, text) {
    // const s = this.elementBySelector("type == '"+element.type+"'")
    const s = this.elementBySelector("type == 'XCUIElementTypeTextView'");
    const f = await driver.$(s);

    await f.setValue(text);
    return true;
  }

  async navigateToElement(driver, element) {
    console.log("Starting the Navigation Now...");
    let location = await element.getLocation();
    console.log("Elements location is ");
    console.log(location);

    console.log("Focused element..");
    let e = await driver.getActiveElement();
    console.log("Focused element location is");
    let cur_location = await driver.getElementLocation(e.ELEMENT);
    console.log(cur_location);

    // let focused_status = await driver.getElementAttribute(ele.ELEMENT, 'focused');
    // console.log("Element focus status is");
    // console.log(focused_status);

    if (this.isInPosition(location.x, cur_location.x) && this.isInPosition(location.y, cur_location.y)) {
      console.log("We're focused on required element..");
      return;
      // await driver.execute('mobile: pressButton', {name: 'Select'});
    } else {
      console.log("We're not in expected position. Hence Moving..");
      console.log("Adjusting X Coordinate..");
      // Adjust x position..
      while (true) {
        e = await driver.getActiveElement();
        console.log("Focused element location is");
        cur_location = await driver.getElementLocation(e.ELEMENT);
        console.log(cur_location);
        if (this.isInPosition(location.x, cur_location.x)) {
          console.log("X is in position now..");
          break;
        }
        if (cur_location.x < location.x) {
          // Move Right.
          await driver.execute("mobile: pressButton", { name: "Right" });
        } else {
          // Move Left.
          await driver.execute("mobile: pressButton", { name: "Left" });
        }
        location = await element.getLocation();
      }
      console.log("Adjusting Y Coordinate..");
      // Adjust Y Position
      while (true) {
        e = await driver.getActiveElement();
        console.log("Focused element location is");
        cur_location = await driver.getElementLocation(e.ELEMENT);
        console.log(cur_location);
        if (this.isInPosition(location.y, cur_location.y)) {
          console.log("Y is in position now..");
          break;
        }
        if (cur_location.y < location.y) {
          // Move Right.
          await driver.execute("mobile: pressButton", { name: "Down" });
        } else {
          // Move Left.
          await driver.execute("mobile: pressButton", { name: "up" });
        }
        location = await element.getLocation();
      }
    }
  }
}
