import DeviceUtils from "./DeviceUtils";
import axios from "axios";
import constants from "./constant";
import io from "socket.io-client";
import GenericUtils from "./GenericUtils";

const socket = io.connect(constants.host);

export default class TVOSExecutor {
  constructor(driver) {
    console.log("Executor Initialized..");
    this.du = new DeviceUtils();
    this.driver = driver;
  }

  async getElement(element_props) {
    const loc = this.du.getElement(element_props);
    const element = await this.driver.$(loc);
    return element;
  }

  async getElementByTagName(tag) {
    let element = await GenericUtils.getElementByTagName(tag, "tvOS");
    console.log("Received value from API..");
    return element.element_attributes;
  }

  async executeGroup(group_name) {
    let actions = await GenericUtils.getTestStepsByGroupName(group_name, "tvOS");
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
      } else if (tc.objectrepository.action === "focus") {
        console.log("Focus started");
        await this.focus(element_props);
        console.log("Focus Completed");
      } else if (tc.objectrepository.action === "sendkey") {
        console.log("Send key started");
        console.log(tc.objectrepository);
        await this.du.sendKeys(this.driver, element_props, tc.objectrepository.element_value);
        console.log("Sendkey is completed..");
      } else if (["up", "left", "select", "right", "down", "back", "home"].includes(tc.objectrepository.action)) {
        console.log("Remote action started");
        await this.du.tvRemoteEvent(this.driver, tc.objectrepository.action);
        console.log("Remote action compelted");
      }
    }
  }

  async waitForElement(element_props) {
    const element = await this.getElement(element_props);
    await element.waitForExist(35000);
  }

  async tap(element_props) {
    if (element_props.type == "XCUIElementTypeButton") {
      if (element_props.name == "next" || element_props.name == "done") {
        // const element=await DRIVER.$(selector);
        await this.du.tvRemoteEvent(this.driver, "Down");
        await this.du.tvRemoteEvent(this.driver, "Down");
        await this.du.tvRemoteEvent(this.driver, "Down");
      }
      //
      // console.log("Clicking the button...");
      // await element.click();
      // console.log('Button click completed..');
    } else {
      console.log("Wait for element to be present..");
      await this.waitForElement(element_props);
    }
    await this.du.tvRemoteEvent(this.driver, "Select");
    console.log("Remote Click completed..");
  }

  async focus(element_props) {
    console.log("FOCUS - Entered");
    const selector = this.du.constructElementSelector(element_props);
    console.log("FOCUS - Selector -> " + selector);
    const element = await this.driver.$(selector);
    console.log("FOCUS - ELEMENT -> " + element);
    await element.waitForExist(25000);
    console.log("FOCUS - Navigating to Element");
    await this.du.navigateToElement(this.driver, element);
    console.log("FOCUS - Navigation completed..");
  }

  async remoteFunctions(action) {
    if (action == "back") {
      await this.driver.execute("mobile: pressButton", { name: "menu" });
    } else {
      await this.driver.execute("mobile: pressButton", { name: action });
    }
  }

  async sendKeys(element_props, text) {
    await this.du.sendKeys(this.driver, element_props, text);
  }

  async startTest(testcase_id, event) {
    const query = `{testcases(where:{id:"${testcase_id}"}){name,application{id}
                        testcasecomponents{type,related_object_id,sequence_number,
                        objectrepository{id,action,element_xpaths,height,width,element_label,
                          element_type,placeholder,x_cord,y_cord,pixel_ratio,element_value,
                          text,element_attributes}}}}`;

    const data = JSON.stringify({
      query
    });
    const headers = {
      "Content-Type": "application/json"
    };

    const testcase_req = await axios.post(constants.graphql, data, { headers: headers });
    // console.log(testcase_req);
    const testcase_json = await testcase_req.data;
    let tcc = testcase_json.data.testcases[0].testcasecomponents;
    tcc = tcc.sort(function(a, b) {
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
        button: data.objectrepository.action.toUpperCase()
      });
    }

    // await tcc.map(async (tc) =>
    for (const tc of tcc) {
      if (tc.type === "mobile") {
        console.log(`STEP ${tc.sequence_number} & ACTION IS ${tc.objectrepository.action.toUpperCase()}`);
        // before execute step
        await socket.emit("ui_execution", {
          status: "started",
          id: tc.objectrepository.id,
          testcase_id: testcase_id,
          action: tc.objectrepository.action
        });

        let element_props = tc.objectrepository.element_attributes;
        if (tc.objectrepository.action === "tap") {
          console.log("Tap Started..");
          await this.tap(element_props);
          console.log("Tap Completed..");
        } else if (tc.objectrepository.action === "focus") {
          console.log("Focus started");
          await this.focus(element_props);
          console.log("Focus Completed");
        } else if (tc.objectrepository.action === "sendkey") {
          console.log("Send key started");
          await this.du.sendKeys(this.driver, element_props, tc.objectrepository.element_value);
          console.log("Sendkey is completed..");
        } else if (["up", "left", "select", "right", "down", "back", "home"].includes(tc.objectrepository.action)) {
          console.log("Remote action started");
          await this.du.tvRemoteEvent(this.driver, tc.objectrepository.action);
          console.log("Remote action compelted");
        }
        if (event) {
          await refreshStatus(event);
        }

        // after execute step
        await socket.emit("ui_execution", {
          status: "completed",
          testcase_id: testcase_id,
          id: tc.objectrepository.id,
          action: tc.objectrepository.action
        });
      }
    }

    // for (const i in tcc) {
    //     if (tcc[i].type === "mobile") {
    //         console.log(`STEP ${tcc[i].sequence_number} & ACTION IS ${tcc[i].objectrepository.action.toUpperCase()}`);
    //         let element_props = tcc[i].objectrepository.element_attributes;
    //         // before execute step
    //         // await socket.emit("ui_execution", {
    //         //     status: "started",
    //         //     id: tcc[i].objectrepository.id,
    //         //     testcase_id: testcase_id,
    //         //     action: tcc[i].objectrepository.action
    //         // });

    //         if (tcc[i].objectrepository.action === "tap") {
    //           this.tap(element_props);
    //           console.log('Remote Click completed..');
    //         } else if (tcc[i].objectrepository.action === "sendkey") {
    //             await this.du.sendKeys(this.driver, element_props, tcc[i].objectrepository.element_value);
    //             console.log("Sendkey is completed..");

    //         } else if (["up", "left", "select", "right", "down", "back", "home"].includes(tcc[i].objectrepository.action)) {
    //             await ipcRenderer.send("REMOTE", tcc[i].objectrepository.action);
    //         }

    //         // after execute step
    //         // await socket.emit("ui_execution", {
    //         //     status: "completed",
    //         //     testcase_id: testcase_id,
    //         //     id: tcc[i].objectrepository.id,
    //         //     action: tcc[i].objectrepository.action
    //         // });

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

// this.setState({ steps_data: [] }, async () => {
//     const query = `{testcases(where:{id:"${testcase_id}"}){name,application{id}
//     testcasecomponents{type,related_object_id,sequence_number,
//     objectrepository{id,action,element_xpaths,height,width,element_label,element_type,placeholder,x_cord,y_cord,pixel_ratio,element_value,text}}}}`;
//     try {
//       const testcase_req = await fetch(constants.graphql, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           query
//         })
//       });
//       const testcase_json = await testcase_req.json();
//       let tcc = testcase_json.data.testcases[0].testcasecomponents;
//       tcc = tcc.sort(function(a, b) {
//         var x = parseInt(a["sequence_number"], 10);
//         var y = parseInt(b["sequence_number"], 10);

//         return x < y ? -1 : x > y ? 1 : 0;
//       });

//       const steps_data = [];
//       for (const data of tcc) {
//         steps_data.push({
//           id: data.objectrepository.id,
//           title: data.objectrepository.element_type,
//           desc: data.objectrepository.element_label,
//           button: data.objectrepository.action.toUpperCase()
//         });
//       }
//       this.setState({ steps_data });

//       for (const i in tcc) {
//         (function() {
//           setTimeout(async function() {
//             if (tcc[i].type === "mobile") {
//               console.log(`STEP ${tcc[i].sequence_number} & ACTION IS ${tcc[i].objectrepository.action.toUpperCase()}`);

//               // before execute step
//               await socket.emit("ui_execution", {
//                 status: "started",
//                 id: tcc[i].objectrepository.id,
//                 testcase_id: testcase_id,
//                 action: tcc[i].objectrepository.action
//               });

//               if (tcc[i].objectrepository.action === "tap") {
//                 if (tcc[i].objectrepository.element_xpaths[0]) {
//                   await ipcRenderer.send("TAP", { element: tcc[i].objectrepository.element_xpaths[0], name: tcc[i].objectrepository.text });
//                 } else {
//                   console.log("ELEMENT XPATH NOT FOUND");
//                 }
//               } else if (tcc[i].objectrepository.action === "sendkey") {
//                 if (tcc[i].objectrepository.element_xpaths[0] && tcc[i].objectrepository.element_value) {
//                   await ipcRenderer.send("SENDKEYS", { element: tcc[i].objectrepository.element_xpaths[0], text: tcc[i].objectrepository.element_value });
//                 } else {
//                   console.log("ELEMENT XPATH AND ELEMENT VALUE NOT FOUND");
//                 }
//               } else if (["up", "left", "select", "right", "down", "back", "home"].includes(tcc[i].objectrepository.action)) {
//                 await ipcRenderer.send("REMOTE", tcc[i].objectrepository.action);
//               }

//               // after execute step
//               await socket.emit("ui_execution", {
//                 status: "completed",
//                 testcase_id: testcase_id,
//                 id: tcc[i].objectrepository.id,
//                 action: tcc[i].objectrepository.action
//               });

//               // Add execution successfull class in cell
//               document.getElementById(`step-${tcc[i].objectrepository.id}`).classList.add("layout-execution-successfull");
//             }
//           }, i * 5000);
//         })(i);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   });
