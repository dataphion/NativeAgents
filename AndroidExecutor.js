import AndroidUtils from "./AndroidUtils";
import axios from "axios";
// import constants from "./constant";
// import io from "socket.io-client";
import GenericUtils from "./GenericUtils";
// const socket = io.connect(constants.host);

export default class AndroidExecutor {
  constructor(driver) {
    console.log("Executor Initialized..");
    this.driver = driver;
    this.au = new AndroidUtils();
  }

  async remoteFunctions(action) {
    if (action == "home") {
      await this.driver.pressKeyCode(3);
    } else if (action == "up") {
      await this.driver.pressKeyCode(19);
    } else if (action == "left") {
      await this.driver.pressKeyCode(21);
    } else if (action == "select") {
      await this.driver.pressKeyCode(23);
    } else if (action == "right") {
      await this.driver.pressKeyCode(22);
    } else if (action == "down") {
      await this.driver.pressKeyCode(20);
    } else if (action == "back") {
      await this.driver.pressKeyCode(4);
    }
  }

  async getElementByTagName(tag) {
    let element = await GenericUtils.getElementByTagName(tag, "tvOS");
    console.log("Received value from API..");
    return element.element_attributes;
  }

  async tap(element_props) {
    console.log("Tap Entered..");
    let element = await this.au.findElement(this.driver, element_props);
    if (element.error) {
      await this.driver.pause(10000);
      element = await this.tap(element_props);
    } else {
      await this.driver.elementClick(element.ELEMENT);
    }
    console.log("Tap completed..");
  }

  async sendKeys(element_props, text) {
    console.log("sendKeys Entered..");
    const element = await this.au.findElement(this.driver, element_props);
    await this.driver.elementSendKeys(element.ELEMENT, text);
    console.log("sendKeys completed..");
  }

  async focus(element_props) {
    console.log("FOCUS is not required for Android...");
  }
  async goto(type, element_props, ribbon_name, tile_name) {
    let element;
    if (type == "RIBBON") {
      console.log("going to ribbon");
      element = await this.au.goingtoribbon(this.driver, element_props, ribbon_name, tile_name);
    }
    if (type == "TILE") {
      console.log("going to tile");
      element = await this.au.goingtotile(this.driver, element_props, ribbon_name, tile_name);
    }
    console.log("Found Error");
    if (element.error) {
      await this.driver.pause(10000);
      element = await this.goto(type, element_props, ribbon_name, tile_name);
    }
  }
  async executeGroup(group_name) {
    let actions = await GenericUtils.getTestStepsByGroupName(group_name, "Android");
    console.log(actions);
    let count = 0;
    for (const tc of actions) {
      count++;
      console.log(`STEP ${count} & ACTION IS ${tc.objectrepository.action.toUpperCase()}`);
      // before execute step
      let element_props = tc.objectrepository.element_attributes;
      if (tc.objectrepository.action === "tap") {
        console.log("Tap Started..");
        await this.tap(element_props);
        console.log("Tap Completed..");
      } else if (tc.objectrepository.action === "sendkey") {
        console.log("Send key started");
        await this.sendKeys(element_props, tc.objectrepository.element_value);
        console.log("Sendkey is completed..");
      } else if (["up", "left", "select", "right", "down", "back", "home"].includes(tc.objectrepository.action)) {
        console.log("Remote action started");
        await this.remoteFunctions(tc.objectrepository.action);
        console.log("Remote action compelted");
      }
    }
  }

  async startTest(testcase_id, event) {
    const query = `{testcases(where:{id:"${testcase_id}"}){name,application{id}
                        testcasecomponents{type,related_object_id,sequence_number,
                        objectrepository{id,action,element_xpaths,height,width,element_label,
                          element_type,placeholder,x_cord,y_cord,pixel_ratio,element_value,
                          text,element_attributes}}}}`;

    const data = JSON.stringify({
      query,
    });
    const headers = {
      "Content-Type": "application/json",
    };

    const testcase_req = await axios.post(constants.graphql, data, {
      headers: headers,
    });
    // console.log(testcase_req);
    const testcase_json = await testcase_req.data;
    let tcc = testcase_json.data.testcases[0].testcasecomponents;
    tcc = tcc.sort(function (a, b) {
      var x = parseInt(a["sequence_number"], 10);
      var y = parseInt(b["sequence_number"], 10);

      return x < y ? -1 : x > y ? 1 : 0;
    });

    const steps_data = [];
    for (const data of tcc) {
      steps_data.push({
        id: data.objectrepository.id,
        title: data.objectrepository.element_type,
        desc: data.objectrepository.element_label,
        button: data.objectrepository.action.toUpperCase(),
        element_attributes: data.objectrepository.element_attributes,
      });
    }

    for (const tc of tcc) {
      if (tc.type === "mobile") {
        console.log(`STEP ${tc.sequence_number} & ACTION IS ${tc.objectrepository.action.toUpperCase()}`);
        // before execute step
        // await socket.emit("ui_execution", {
        //   status: "started",
        //   id: tc.objectrepository.id,
        //   testcase_id: testcase_id,
        //   action: tc.objectrepository.action
        // });

        let element_props = tc.objectrepository.element_attributes;
        if (tc.objectrepository.action === "tap") {
          console.log("Tap Started..");
          await this.tap(element_props);
          console.log("Tap Completed..");
        } else if (tc.objectrepository.action === "sendkey") {
          console.log("Send key started");
          await this.sendKeys(element_props, tc.objectrepository.element_value);
          console.log("Sendkey is completed..");
        } else if (["up", "left", "select", "right", "down", "back", "home"].includes(tc.objectrepository.action)) {
          console.log("Remote action started");
          await this.remoteFunctions(tc.objectrepository.action);
          console.log("Remote action compelted");
        }

        // else if (tc.objectrepository.action === "focus") {
        //   console.log("Focus started");
        //   await this.focus(element_props);
        //   console.log("Focus Completed");
        if (event) {
          await refreshStatus(event);
        }

        // after execute step
        // await socket.emit("ui_execution", {
        //   status: "completed",
        //   testcase_id: testcase_id,
        //   id: tc.objectrepository.id,
        //   action: tc.objectrepository.action
        // });
      }
    }

    // for (const i in tcc) {
    //     if (tcc[i].type === "mobile") {
    //         console.log(`STEP ${tcc[i].sequence_number} & ACTION IS ${tcc[i].objectrepository.action.toUpperCase()}`);
    //         let element_props = tcc[i].objectrepository.element_attributes;
    // before execute step
    // await socket.emit("ui_execution", {
    //     status: "started",
    //     id: tcc[i].objectrepository.id,
    //     testcase_id: testcase_id,
    //     action: tcc[i].objectrepository.action
    // });

    //         if (tcc[i].objectrepository.action === "tap") {
    //           this.tap(element_props);
    //           console.log('Remote Click completed..');
    //         } else if (tcc[i].objectrepository.action === "sendkey") {
    //             await this.du.sendKeys(this.driver, element_props, tcc[i].objectrepository.element_value);
    //             console.log("Sendkey is completed..");

    //         } else if (["up", "left", "select", "right", "down", "back", "home"].includes(tcc[i].objectrepository.action)) {
    //             await ipcRenderer.send("REMOTE", tcc[i].objectrepository.action);
    //         }

    // after execute step
    // await socket.emit("ui_execution", {
    //     status: "completed",
    //     testcase_id: testcase_id,
    //     id: tcc[i].objectrepository.id,
    //     action: tcc[i].objectrepository.action
    // });

    //         if(event){
    //             await refreshStatus(event);
    //         }

    //         // document.getElementById(`step-${tcc[i].objectrepository.id}`).classList.add("layout-execution-successfull");
    //     }
    // (function() {
    // setTimeout(async function() {

    //     // Add execution successfull class in cell
    //     document.getElementById(`step-${tcc[i].objectrepository.id}`).classList.add("layout-execution-successfull");
    //     }
    // }, i * 5000);
    // };
  }
}
