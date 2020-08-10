import React, { Component } from "react";
import Screenshot from "./Screenshot";
import { Empty, Modal } from "antd";
const { ipcRenderer, remote } = require("electron");
import { Alert } from "rsuite";
import { Context } from "../Context";
import constants from "../constant";
import Loader from "../components/Loader";
import Remote from "../components/Remote";
import Sortable from "sortablejs";
import Droppable from "../components/Droppable";
import Draggable from "../components/Draggable";


let context_menus = {
    'MY TV' : {
      linear : ['Goto Ribbon', 'Goto Tile'],
      nested : {
        Menu : ['ON NOW','GUIDE','SPORTS','ON DEMAND']
      }
    },
    'ON NOW' : {
      linear : ['Goto Ribbon', 'Goto Tile'],
      nested : {
        Menu : ['MY TV','GUIDE','SPORTS','ON DEMAND']
      }
    },
    'GUIDE' : {
      linear : ['Goto Ribbon', 'Goto Tile'],
      nested : {
        Menu : ['ON NOW', 'MY TV','SPORTS','ON DEMAND']
      }
    },
    'SPORTS' : {
      linear : ['Goto Ribbon', 'Goto Tile'],
      nested : {
        Menu : ['ON NOW', 'MY TV','GUIDE','ON DEMAND']
      }
    },
    'ON DEMAND' : {
      linear : ['Goto Ribbon', 'Goto Tile'],
      nested : {
        Menu : ['ON NOW', 'MY TV', 'SPORTS', 'GUIDE']
      }
    },
    'SEARCH' : {
      linear : ['Enter Text'],
    },
    'SETTINGS' : {
      linear : ['Sign Out','Manage'],
      nested : {
          Menu : ['ON NOW', 'MY TV', 'SPORTS', 'GUIDE', 'ON DEMAND'],
          Options : ['Account', 'Parental Controls', 'DVR', 'Support', 'Close Captions', 'Device']
      }
    },
    'PREVIEW' : {
      linear : ['Record', 'Add to Favorites', 'Play']
    }
}


export default class Recording extends Component {
  static contextType = Context;
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
      selected_switch: "tap",
      screenshot: null,
      sendKeyContainer: false,
      sendKeyContent: "",
      selected_element: null,
      search_text: "",
      warning_show: true,
      steps_data: [],
      playback_steps_data: [],
      loader: false,
      remoteVisible: false,
      selected_active_step: "",
      ribbon_tile_value: "",
      tile_value: "",
      ribbon_tile: 0,
      current_view : 'MY TV',
      focused_on : '',
      UImode: false,
      recordedItems: [],
      data: [
        {
          id: 1,
          title: "block 1",
          desc: "this is block 1",
          button: "button 1",
          expand: true,
          nested: [{ id: 1.1, title: "block 1.1", desc: "this is block 1.1", button: "button 1.1" }],
        },
        {
          id: 2,
          title: "block 2",
          desc: "this is block 2",
          button: "button 2",
          expand: true,
          nested: [{ id: 2.1, title: "block 2.1", desc: "this is block 2.1", button: "button 2.1" }],
        },
        {
          id: 3,
          title: "block 3",
          desc: "this is block 3",
          button: "button 3",
          expand: true,
          nested: [{ id: 3.1, title: "block 3.1", desc: "this is block 3.1", button: "button 3.1" }],
        },
      ],
    };
  }
  


  handleMouseHover = () => {
    this.setState(this.toggleHoverState);
    if(this.state.isHovering)
      console.log('Hovered In');
    else
      console.log('Hovered Out');
  }

  toggleHoverState = (state) => {
    return {
      isHovering: !state.isHovering,
    };
  }


  async componentDidMount() {
    ipcRenderer.on("TAP-reply", (event, arg) => {
      let ele = arg.element;
      if ("ELEMENT" in ele) {
        let selected_element = this.state.selected_element;
        selected_element.access_identifier = ele.ELEMENT;
        this.setState({ selected_element: selected_element });
      }
    });
    ipcRenderer.on("SENDKEYS-reply", (event, arg) => {
      let ele = arg.element;
      if ("ELEMENT" in ele) {
        let selected_element = this.state.selected_element;
        selected_element.access_identifier = ele.ELEMENT;
        this.setState({ selected_element: selected_element });
      }
    });
    ipcRenderer.on("RELOADED-reply", (event, arg) => {
      console.log('Response from reloaded reply');
      console.log(arg);
    })

    if (window.localStorage.getItem("testcase_id")) {
      const query = `{testcases(where:{id:"${window.localStorage.getItem("testcase_id")}"}){name,application{id}
                      testcasecomponents{type,related_object_id,sequence_number,
                      objectrepository{id,action,element_xpaths,height,width,element_attributes,element_label,element_type,placeholder,x_cord,y_cord,pixel_ratio,element_value,text}}}}`;
      try {
        const testcase_req = await fetch(constants.graphql, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
          }),
        });
        const testcase_json = await testcase_req.json();
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
        this.setState({ steps_data });
      } catch (error) {
        console.log(error);
      }
    }
  }


  updateContext = () => {
    console.log('Updating the Context Menu Now..');
    console.log(this.state.selected_element);
    console.log(this.state.selected_element.properties['resource-id']);
    
    if(this.state.selected_element.properties['resource-id'] == 'com.sling:id/my_tv'){
      this.setState({
        current_view : 'MY TV'
      })
    }else if(this.state.selected_element.properties['resource-id'] == 'com.sling:id/on_now'){
      alert('Clicked on ')
      this.setState({
        current_view : 'ON NOW'
      })
    }else if(this.state.selected_element.properties['resource-id'] == 'com.sling:id/guide'){
      this.setState({
        current_view : 'GUIDE'
      })
    }else if(this.state.selected_element.properties['resource-id'] == 'com.sling:id/sports'){
      this.setState({
        current_view : 'SPORTS'
      })
    }else if(this.state.selected_element.xpath == '//android.widget.ImageView[@content-desc="SEARCH"]'){
      this.setState({
        current_view : 'SEARCH'
      })
    }else if(this.state.selected_element.xpath == '//android.widget.ImageView[@content-desc="SETTINGS"]'){
      this.setState({
        current_view : 'SETTINGS'
      })
    }else if(this.state.focused_on == 'TILE'){
      this.setState({
        current_view : 'PREVIEW',
        focused_on : ''
      })
    }
  }

  createTestcase = async function() {
    if (this.state.testcaseContent) {
      this.setState({ loader: true });
      const createTestcase = await fetch(constants.testcases, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: this.state.testcaseContent,
          type: "mobile",
          feature: window.localStorage.getItem("selected_feature"),
          application: window.localStorage.getItem("selected_application"),
        }),
      });
      const testcaseResp = await createTestcase.json();
      window.localStorage.setItem("testcase_id", testcaseResp.id);
    }
    this.setState({
      testcaseContainer: false,
      testcaseContent: "",
      loader: false,
    });
  };

  sendSteps = async function (action) {
    const sequence = this.state.steps_data.length;
    const selected_step = this.context.selected_step;
    const selected_step_screenshot = this.context.selected_step_screenshot;
    const selected_step_sendkey = this.context.selected_step_sendkey;

    // upload and link the latest image
    let fileupload_id;
    const createFileObjReq = await fetch(selected_step_screenshot.base64);
    const createFileObjRes = await createFileObjReq.blob();
    const createFileObj = new File([createFileObjRes], "file");

    let payloadData = new FormData();
    payloadData.append("files", createFileObj);
    const reqFileUpload = await fetch(constants.upload, {
      method: "POST",
      body: payloadData,
    });
    const resFileUpload = await reqFileUpload.json();
    fileupload_id = resFileUpload[0].id;

    // Create Object repository entry
    const createOR = await fetch(constants.objectrepositories, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action,
        element_xpaths: [selected_step.XPath],
        height: selected_step.height,
        width: selected_step.width,
        element_label: selected_step.label,
        element_type: selected_step.type || selected_step.title,
        text: selected_step.text,
        placeholder: selected_step.value,
        element_css: selected_step.class,
        x_cord: selected_step.x,
        y_cord: selected_step.y,
        base_image: fileupload_id,
        element_attributes: selected_step,
        element_value: selected_step_sendkey,
        pixel_ratio: "3.00",
      }),
    });
    const orResp = await createOR.json();

    // get device type
    const getDeviceType = await fetch(constants.devicetype, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: this.context.capabilities.platformName,
      }),
    });
    const deviceTypeResp = await getDeviceType.json();

    await fetch(constants.testcasecomponents, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "mobile",
        sequence_number: sequence,
        objectrepository: orResp.id,
        testcase: window.localStorage.getItem("testcase_id"),
        devicetype: deviceTypeResp,
      }),
    });
    this.context.setStepSendkey(null);
  };


  toggleExpand = (index) => {
    const data = this.state.data;
    data[index]["expand"] = !data[index]["expand"];
    this.setState({ data });
  };

  getHovered = (item) => {
    if(this.state.isHovering){
      return (
        <div className="context-sub-menu">
              <div className="menu-option" onClick={()=> this.recordItem('click', item)}> Click </div>
              <div className="menu-option" onClick={()=> this.recordItem('assert', item)}> Assert </div>
        </div>
      )
    }else{
      return(
        <div className="context-sub-menu">
          </div>
      )
    }
  }

  recordItem = (action, item, subitem) => {
    let it = this.state.recordedItems;
    it.push({action: action, value: item, subvalue : subitem});
    this.setState(
      {
        recordedItems : it
      }
    )
  }

  getRecordedSteps = () => {
    if(this.state.recordedItems.length == 0){
      return(
        <div> No steps recorded </div>
      )
    }
    let s = []
    for(var step of this.state.recordedItems){
      let r = "";
      if(step.action == 'click'){
        r += 'Click on : '+step.value
      } else if(step.action == 'Goto Ribbon')
      {
        r += 'Goto Ribbon : '+step.value
      }else if(step.action == 'Goto Tile'){
        r += 'Goto Tile : '+step.value
      }
      else{
        r += 'Assert item : '+step.value
      }
      s.push(r)
    }
    return(
      s.map((val, index)=>{
        return(
          <div className="recorded-item">{val}</div>
        )
      })
    )
  }

  getLinearOption = (item) => {
    // return(
    //   <div> Linear Menu Item </div>
    // )
    if(item == 'Goto Ribbon'){
      return(
        <div className="context-menu" onClick={()=> {this.setState(item)}}
          onClick={() => {
            this.setState({ ribbon_tile: 1 });
          }}
          style={{cursor: 'pointer'}}
        >
            <div className="context-menu-text"> {item} </div>
        </div>
        
      )
    }else if(item == 'Goto Tile'){
      return(
        <div className="context-menu" onClick={()=> {this.setState(item)}}
          onClick={() => this.setState({ ribbon_tile: 2 })}
          style={{cursor: 'pointer'}}
        >
            <div className="context-menu-text"> {item} </div> 
        </div>
      )
    }
    return(
      <div className="context-menu" onClick={()=> {this.setState(item)}}
            onMouseEnter={this.handleMouseHover}
            onMouseLeave={this.handleMouseHover}
          >
            <div className="context-menu-text"> {item} </div>
            {this.getHovered(item)}    
      </div>
    )
  }

  getNestedOption = (item) => {
    console.log('Fetching nested structure for item ->'+item);
    console.log(context_menus[item].nested);
    console.log(Object.keys(context_menus[item].nested));

    if(context_menus[item].nested){
      let items = Object.keys(context_menus[item].nested);
      console.log('Items are ->');
      console.log(items);
      
      return (
        items.map((it, index) => {
          console.log('Iterating -> '+it);
          console.log("-----------");
          console.log(context_menus[item].nested[it]);

          return(
            <div style={{background: 'white'}}>
              <div className="parent-context-menu">
                <div className="context-menu-text"> {it} </div>
              </div>
              {context_menus[item].nested[it].map((k, idx) => {
                return(
                  <div className="child-context-menu">
                    <div className="context-menu-text"> {k} </div>
                    <div>
                      <button onClick={()=>this.recordItem('click', k)} className="button"> Click </button>
                      <button onClick={()=>this.recordItem('assert', k)} className="button"> Assert </button>
                    </div>
                  </div>
                )
              })}
            </div>
            
          )
        })
      )
    }
    
  }

  getCurrentOptions = () => {
    let options = context_menus[this.state.current_view];
    let vals= []
    for(var opt of options.linear){
      vals.push(opt);
    }
    return(
      <div>
          {vals.map((val, index) =>{
            return(this.getLinearOption(val));
          })}
          {this.getNestedOption(this.state.current_view)}
      </div>
    )
  }

  getElementProperties() {
    if (this.state.UImode) {
      let v = this.getCurrentOptions();
      return(v);
    } else {
      if (this.state.selected_element) {
        return (
          <React.Fragment>
            <div className="metadata-top-container">
              <div className="metadata-title">{this.state.selected_element.title}</div>
              <div className="metadata-search-container">
                <div className="search-logo" />
                <input
                  type="text"
                  placeholder="Search"
                  onChange={(e) => this.setState({ search_text: e.target.value })}
                  value={this.state.search_text}
                />
              </div>
            </div>
            <div className="metadata-bottom-container">
              <div className="metadata-column-title">
                <div className="column-title-text">Property</div>
                <div className="column-title-text">Value</div>
              </div>
              <div className="metadata-data-container">
                {Object.keys(this.state.selected_element.properties).map((key, index) => {
                  if (key.toLowerCase().includes(this.state.search_text.toLowerCase())) {
                    return (
                      <div className="metadata-data-row" key={index}>
                        <div className="data-row-text">{key}</div>
                        <div className="data-row-text">{this.state.selected_element.properties[key]}</div>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </React.Fragment>
        );
      } else {
        return <Empty />;
      }
    }
  }

  onElementSelected = (element) => {
    console.log("This is a message from Recording...");
    console.log(element);
    let selectedElement = {
      title: element.tagName,
      xpath: element.xpath,
      properties: {
        title: element.tagName,
        XPath: element.xpath,
      },
    };

    for (const i of Object.keys(element.attributes)) {
      selectedElement.properties[i] = element.attributes[i];
    }

    this.setState({ selected_element: selectedElement });
    this.context.setStepData(selectedElement.properties);
  };

  refreshDevice = () => {
    ipcRenderer.send("reload", "ping");
  };

  getHighlighted = () => {
    ipcRenderer.send("HIGHLIGHTED", {});

  }
  
  recordTapFocus = (type) => {
    this.updateContext();
    if (this.state.selected_element) {
      ipcRenderer.send(type, {
        element: this.state.selected_element.xpath,
        element_props: this.state.selected_element.properties,
      });
      let val = this.state.steps_data;
      val.push({
        id: val.length + 1,
        title: this.state.selected_element.title,
        desc: this.state.selected_element.properties.label || this.state.selected_element.properties.value,
        button: type,
        element_attributes: this.state.selected_element.properties,
      });
      this.setState({ steps_data: val }, () => this.sendSteps(type.toLowerCase()));
    } else {
      return Alert.warning("Please select element.");
    }
  };
  recordRibbonTile = () => {
    let type = this.state.ribbon_tile == 1 ? "RIBBON" : "TILE";
    console.log('Recording -> '+type);
    let selected_element = this.state.selected_element
    if(type == 'RIBBON'){
      this.recordItem('Goto Ribbon', this.state.ribbon_tile_value)
    }else{
      this.recordItem('Goto Tile', this.state.ribbon_tile_value, this.state.tile_value);
    }
    
    if(selected_element){
      selected_element.properties["ribbon_name"] = this.state.ribbon_tile_value
      selected_element.properties["tile_name"] = this.state.tile_value
      console.log(selected_element);
    }
    
    console.log('Sending messgae over IPC');
    ipcRenderer.send(type, {
      tile_name: this.state.tile_value,
      ribbon_name: this.state.ribbon_tile_value,
      element: this.state.selected_element.xpath,
      element_props: this.state.selected_element.properties,
    });
    console.log("Updating context..");
    
    this.setState({
      focused_on : 'TILE'
    }, () => {
      this.updateContext()
    })
    console.log("IPC Message Sent");
    
    let val = this.state.steps_data;
    val.push({
      id: val.length + 1,
      title: this.state.selected_element.title,
      desc: this.state.selected_element.properties.label || this.state.selected_element.properties.value,
      button: "GO TO " + type,
      element_attributes: this.state.selected_element.properties,
    });
    this.setState({ steps_data: val, ribbon_tile_value: "", ribbon_tile: 0, loader: false, selected_element }, () => {
      this.sendSteps("go to " + type.toLowerCase());
    });
  };

  quitSession = () => {
    const screen = remote.getCurrentWindow();
    screen.setSize(1024, 728);
    screen.center();
    window.localStorage.removeItem("testcase_id");
    this.context.setCapabilities({});
    this.props.history.push("/session");
  };

  resetFavorite = () => {
    ipcRenderer.send('RESET_FAVORITE', {});
  }

  componentWillUnmount() {
    window.localStorage.removeItem("testcase_id");
    this.context.setCapabilities({});
  }

  render() {
    console.log(this.state.UImode);

    return (
      <Context.Consumer>
        {(context) => (
          <div className="recording-container animated fadeIn">
            <div className="recording-header-container">
              <div className="left-part" id="left-part-recording">
                {window.localStorage.getItem("testcase_id") ? (
                  <div className="toggle-switch-container animated fadeIn">
                    <div onClick={() => {
                      this.recordTapFocus("TAP")
                    }} className={"switch-btn"}>
                      <div className="tap-switch-logo" />
                      Tap
                    </div>
                    <div onClick={() => this.recordTapFocus("FOCUS")} className={"switch-btn"}>
                      <div className="swipe-switch-logo" />
                      Focus
                    </div>
                    <div onClick={() => this.setState({ sendKeyContainer: true })} className={"switch-btn"}>
                      <div className="coordinates-switch-logo" />
                      SendKeys
                    </div>
                    <div className={"switch-btn"} onClick={() => this.setState({ ribbon_tile: 1 })}>
                      <div className="tap-switch-logo" />
                      Go to Ribbon
                    </div>
                    <div className={"switch-btn"} onClick={() => this.setState({ ribbon_tile: 2 })}>
                      <div className="tap-switch-logo" />
                      Go to Tile
                    </div>
                    <div
                      className={"switch-btn"}
                      onClick={() => this.resetFavorite()}
                    >
                      <div className="tap-switch-logo" />
                      Reset Favorites
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex" }}>
                    <div className="header-start-button" onClick={() => this.setState({ testcaseContainer: true })}>
                      <div className="header-start-button-logo" />
                      START RECORDING
                    </div>
                    <div className="header-start-button" onClick={() => this.getHighlighted()}>
                      <div className="header-start-button-logo" />
                      GET HIGHLIGHTED
                    </div>
                  </div>
                )}
              </div>
              <div className="center-part">
                <div className="header-button-container" onClick={() => this.refreshDevice()}>
                  <div className="refresh-header-button-logo" />
                  REFRESH
                </div>
                {window.localStorage.getItem("testcase_id") ? (
                  <div className="header-button-container animated fadeIn" onClick={() => this.setState({ remoteVisible: true })}>
                    <div className="fa fa-mobile" style={{ marginRight: "10px", color: "#cbccd1" }} />
                    REMOTE
                  </div>
                ) : null}
              </div>
              <div className="right-part">
                <div
                  className="header-button-container"
                  style={this.state.UImode ? { background: "#fff", color: "#34374d" } : {}}
                  onClick={() =>
                    this.setState({ UImode: !this.state.UImode })// () => {
                    //   if (this.state.UImode) {
                    //     Sortable.create(document.getElementById("dr2"));
                    //     Sortable.create(document.getElementById("dr1"));
                    //   }
                    // })
                  }
                >
                  UI Mode
                </div>
                <div onClick={this.quitSession} className="header-quit-button">
                  <div className="header-quit-button-logo" />
                  QUIT SESSION
                </div>
              </div>
            </div>
            <div className="recording-body-container">
              <div className="left-part" id="left-part-recording-preview">
                <div className="recording-preview-container">
                  <Screenshot onElementSelected={this.onElementSelected} />
                </div>
              </div>
              <div className="center-part">
                <div className="center-button-container">
                  <div className="button">METADATA INFORMATION</div>
                </div>
                <div className="center-body-container">{this.getElementProperties()}</div>
              </div>
              <div className="right-part">
                <div className="recorded-step-top-part">
                  <div className="title">RECORDED STEPS</div>
                  <div className="counter">{this.state.steps_data.length}</div>
                </div>
                {this.state.UImode ? (
                  // <Droppable id="dr2" className="steps-lists-container"></Droppable>
                  this.getRecordedSteps()
                ) : (
                  <React.Fragment>
                    {this.state.steps_data.length > 0 ? (
                      <div className="recorded-warning-container" style={!this.state.warning_show ? { display: "none" } : {}}>
                        <div className="recorded-left-part">
                          <div className="recorded-warning-logo" />
                          <div className="recorded-warning-desc">Click on any element to inspect it’s metadata information.</div>
                        </div>
                        <div className="recorded-warning-close" onClick={() => this.setState({ warning_show: false })}>
                          <div className="recorded-warning-close-logo" />
                        </div>
                      </div>
                    ) : null}
                    <div className="steps-lists-container">
                      {this.state.steps_data.map((data, index) => (
                        <div
                          className="steps-lists-row"
                          id={`step-${data.id}`}
                          key={index}
                          onClick={() =>
                            this.setState({
                              selected_element: {
                                ...this.state.selected_element,
                                properties: data.element_attributes,
                              },
                              selected_active_step: index,
                            })
                          }
                          style={this.state.selected_active_step === index ? { border: "1px solid #565b72" } : {}}
                        >
                          <div className="steps-drag-logo" />
                          <div className="steps-row-title">{data.title}</div>
                          <div className="steps-right-arrow" />
                          <div className="steps-row-desc">{data.desc}</div>
                          <div className="steps-row-button">{data.button}</div>
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                )}
              </div>
              <Remote
                onHide={() => this.setState({ remoteVisible: false })}
                remoteVisible={this.state.remoteVisible}
                remoteClick={(type) => {
                  if (this.state.selected_element) {
                    ipcRenderer.send("REMOTE", type);
                    let val = this.state.steps_data;
                    val.push({
                      id: val.length + 1,
                      title: this.state.selected_element.title,
                      desc: this.state.selected_element.properties.label || this.state.selected_element.properties.value,
                      button: type.toUpperCase(),
                      element_attributes: this.state.selected_element.properties,
                    });
                    this.setState({ steps_data: val }, () => this.sendSteps(type));
                  } else {
                    return Alert.warning("Please select element.");
                  }
                }}
              />
            </div>
            <Modal
              title="Enter your text"
              visible={this.state.sendKeyContainer}
              onCancel={() => {
                this.setState({ sendKeyContainer: false, sendKeyContent: "" });
              }}
              onOk={() => {
                if (this.state.sendKeyContent) {
                  console.log("Sending data");
                  console.log({
                    element: this.state.selected_element.xpath,
                    text: this.state.sendKeyContent,
                  });
                  context.setStepSendkey(this.state.sendKeyContent);
                  ipcRenderer.send("SENDKEYS", {
                    element: this.state.selected_element.xpath,
                    element_props: this.state.selected_element.properties,
                    text: this.state.sendKeyContent,
                  });
                  let val = this.state.steps_data;
                  val.push({
                    id: val.length + 1,
                    title: this.state.selected_element.title,
                    desc: this.state.selected_element.properties.label || this.state.selected_element.properties.value,
                    button: "SENDTEXT",
                    element_attributes: this.state.selected_element.properties,
                  });
                  this.setState({ steps_data: val }, () => this.sendSteps("sendkey"));
                }
                this.setState({ sendKeyContainer: false, sendKeyContent: "" });
              }}
            >
              <div className="textbox-container">
                <input
                  autoFocus
                  type="text"
                  value={this.state.sendKeyContent}
                  onChange={(e) => this.setState({ sendKeyContent: e.target.value })}
                  className="text-input"
                />
              </div>
            </Modal>
            <Modal
              title="Testcase name"
              visible={this.state.testcaseContainer}
              onCancel={() => this.setState({ testcaseContainer: false, testcaseContent: "" })}
              onOk={() => this.createTestcase()}
            >
              <div className="textbox-container">
                <input
                  autoFocus
                  type="text"
                  value={this.state.testcaseContent}
                  onChange={(e) => this.setState({ testcaseContent: e.target.value })}
                  className="text-input"
                />
              </div>
            </Modal>
            <Modal
              title="Ribbon/Tile name"
              visible={this.state.ribbon_tile != 0}
              onCancel={() =>
                this.setState({
                  ribbon_tile: 0,
                  ribbon_tile_value: "",
                  tile_value: "",
                })
              }
              onOk={() => this.recordRibbonTile()}
            >
              <div className="textbox-container">
                <div>Ribbon name</div>
                <input
                  autoFocus
                  type="text"
                  value={this.state.ribbon_tile_value}
                  onChange={(e) => this.setState({ ribbon_tile_value: e.target.value })}
                  className="text-input"
                />
              </div>
              {this.state.ribbon_tile == 2 ? (
                <div className="textbox-container">
                  <div>Tile name</div>
                  <input
                    autoFocus
                    type="text"
                    value={this.state.tile_value}
                    onChange={(e) => this.setState({ tile_value: e.target.value })}
                    className="text-input"
                  />
                </div>
              ) : (
                ""
              )}
            </Modal>
            <Loader status={this.state.loader} />
          </div>
        )}
      </Context.Consumer>
    );
  }
}
