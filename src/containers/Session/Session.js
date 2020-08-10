import React, { Component } from "react";
import Header from "../../components/Header";
import SavedSessions from "./SavedSessions";
import constants from "../../constant";
import { Context } from "../../Context";
import { Tabs, Select, Modal, Input, Button } from "antd";
import { Alert } from "rsuite";
import Loader from "../../components/Loader";
const { ipcRenderer, remote } = require("electron");
import axios from "axios";
const TabPane = Tabs.TabPane;

export default class Capability extends Component {
  static contextType = Context;
  state = {
    loader: false,
    field: [],
    capabilities: {},
    existing_capabilities: "",
    name: "",
    type: "text",
    value: "",
    validate_name: false,
    validate_value: false,
    addUsingjson: "",
    editJSON: false,
    save_capability_name: "",
    save_capability_date: "",
    saveVisible: false,
  };

  componentWillMount() {
    if (!window.localStorage.getItem("capabilities")) {
      window.localStorage.setItem("capabilities", JSON.stringify([]));
    }
    ipcRenderer.on("start_server-REPLY", () => {
      this.context.setCapabilities(this.state.capabilities);
      this.props.history.push("/recording");
    });
    // if (window.localStorage.getItem("user_id")) {
    //   const capabilities = JSON.parse(window.localStorage.getItem("capabilities"));
    //   console.log(capabilities);

    //   fetch(constants.graphql, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       Accept: "application/json"
    //     },
    //     body: JSON.stringify({
    //       query: `{capabilities(where:{user:"${window.localStorage.getItem("user_id")}"}){id,name,properties}}`
    //     })
    //   })
    //     .then(resp => resp.json())
    //     .then(resp => {
    //       console.log(resp.data.capabilities);
    //       for (const data of resp.data.capabilities) {
    //         capabilities.push({ id: capabilities.length + 1, name: data.name, properties: data.properties, data: data.date });
    //       }
    //       console.log(capabilities);

    //       window.localStorage.setItem("capabilities", JSON.stringify(capabilities));
    //       this.setState({ saveVisible: false });
    //     })
    //     .catch(error => {
    //       console.log(error);
    //     });
    // }
  }

  startSession = () => {
    if (
      window.localStorage.getItem("user_id") &&
      window.localStorage.getItem("selected_application") &&
      window.localStorage.getItem("selected_feature")
    ) {
      remote.getCurrentWindow().maximize();
      ipcRenderer.send("start_server", this.state.capabilities);
      this.setState({ loader: true });
    } else {
      this.props.history.push("/setting");
      return Alert.warning("Please configure information.", 5000);
    }
  };

  renderRow = () => {
    return this.state.field.map((data, index) => (
      <div className="desired-capa-row-item animated fadeIn" key={index}>
        <div className="textbox-container">
          <input type="text" placeholder="Name" value={data.name} onChange={() => Alert.warning("Edit from JSON Representation")} />
        </div>
        <div className="textbox-container">
          <input type="text" value={data.type} />
        </div>
        <div className="textbox-container">
          <input type="text" placeholder="Value" value={data.value} onChange={() => Alert.warning("Edit from JSON Representation")} />
        </div>
        <div className="desired-capa-row-plus-btn" onClick={() => this.deleteRow(index)}>
          -
        </div>
      </div>
    ));
  };

  addRow = () => {
    const field = this.state.field,
      capabilities = this.state.capabilities;
    if (!this.state.name && !this.state.value) {
      this.setState({ validate_name: true, validate_value: true });
      return Alert.warning("Please enter name & value.");
    } else if (!this.state.name) {
      this.setState({ validate_name: true });
      return Alert.warning("Please enter name.");
    } else if (!this.state.value) {
      this.setState({ validate_value: true });
      return Alert.warning("Please enter value.");
    } else {
      let Checker = true;
      this.state.field.map((data) => {
        if (data.name === this.state.name) {
          Checker = false;
        }
      });

      if (Checker) {
        field.push({ name: this.state.name, type: this.state.type, value: this.state.value });
        this.setState({ field, name: "", type: "text", value: "" }, () => {
          for (const data of field) {
            if (data.type === "number") {
              capabilities[data.name] = Number(data.value);
            } else {
              capabilities[data.name] = data.value;
            }
          }
          this.setState({ capabilities });
        });
      } else {
        return Alert.warning(`Dupalicate key "${this.state.name}"`);
      }
    }
  };

  deleteRow = (index) => {
    const field = this.state.field;
    const capabilities = this.state.capabilities;
    delete capabilities[field[index].name];
    field.splice(index, 1);
    this.setState({ field, capabilities });
  };

  setCapabilities = (all, capa) => {
    const field = [];
    for (const key of Object.keys(capa)) {
      const temp = {};
      temp["name"] = key;
      temp["value"] = capa[key];
      temp["type"] = typeof capa[key] == "number" ? "number" : "text";
      field.push(temp);
    }
    this.setState({ capabilities: capa, field, existing_capabilities: all, editJSON: false });
  };

  setJSONCapabilities = () => {
    let validateJSON;
    try {
      validateJSON = JSON.parse(this.state.addUsingjson);
    } catch (error) {
      return Alert.warning("Please enter valid JSON.");
    }
    const field = [];
    for (const key of Object.keys(validateJSON)) {
      const temp = {};
      temp["name"] = key;
      temp["value"] = validateJSON[key];
      temp["type"] = typeof validateJSON[key] == "number" ? "number" : "text";
      field.push(temp);
    }
    this.setState({ capabilities: validateJSON, field, editJSON: false, addUsingjson: "" });
  };

  saveCapability = () => {
    if (this.state.save_capability_name) {
      const capabilities = JSON.parse(window.localStorage.getItem("capabilities"));
      capabilities.push({
        id: capabilities.length,
        date: new Date().toLocaleString(),
        name: this.state.save_capability_name,
        capability: this.state.capabilities,
      });
      window.localStorage.setItem("capabilities", JSON.stringify(capabilities));
      Alert.success("Capability saved successfully.");
      // if (window.localStorage.getItem("user_id")) {
      //   const body = {
      //     name: this.state.save_capability_name,
      //     date: this.state.save_capability_date,
      //     properties: this.state.capabilities,
      //     user: window.localStorage.getItem("user_id")
      //   };
      //   axios.post(constants.capability, body).catch(err => {
      //     console.log(err);
      //   });
      // }
    }
    this.setState({ saveVisible: false, save_capability_name: "", save_capability_date: "", capabilities: {}, field: [] });
    this.context.setActiveTabForSession("2");
  };

  updateCapability = () => {
    if (this.state.existing_capabilities.id == 0 || this.state.existing_capabilities.id) {
      const capabilities = JSON.parse(window.localStorage.getItem("capabilities"));
      for (const i in capabilities) {
        if (capabilities[i].id == this.state.existing_capabilities.id) {
          capabilities[i]["capability"] = this.state.capabilities;
        }
      }
      window.localStorage.setItem("capabilities", JSON.stringify(capabilities));
      Alert.success("Capability updated successfully.");
      this.setState({ existing_capabilities: "", capabilities: {}, field: [] });
      this.context.setActiveTabForSession("2");
    } else {
      this.setState({ saveVisible: true });
    }
  };

  render() {
    const capabilitiesLength = JSON.parse(window.localStorage.getItem("capabilities")).length;
    return (
      <Context.Consumer>
        {(context) => (
          <React.Fragment>
            <Header />
            <div className="session-body-container animated fadeIn">
              <div className="session-body-top">
                <div className="session-containers">
                  <p className="runnning-server-title">
                    Currently running server is
                    <b>
                      {window.localStorage.getItem("hostname") && window.localStorage.getItem("port")
                        ? ` ${window.localStorage.getItem("hostname")} : ${window.localStorage.getItem("port")}`
                        : " not configured."}
                    </b>
                  </p>
                </div>
                <div className="session-containers">
                  <Tabs activeKey={context.activeTabForSession} onChange={(e) => context.setActiveTabForSession(e)}>
                    <TabPane tab="Desired Capabilities" key="1">
                      <div className="desired-capa-body-container">
                        <div className="desired-capa-row">
                          {this.renderRow()}
                          <div className="desired-capa-row-item">
                            <div className="textbox-container">
                              <Input
                                autoFocus
                                type="text"
                                placeholder="Name"
                                onChange={(e) => this.setState({ name: e.target.value, validate_name: false })}
                                value={this.state.name}
                                style={this.state.validate_name ? { borderColor: "red" } : {}}
                                onPressEnter={this.addRow}
                              />
                            </div>
                            <div className="textbox-container">
                              <Select
                                type="text"
                                defaultValue={this.state.type}
                                onChange={(e) => this.setState({ type: e })}
                                onPressEnter={this.addRow}
                              >
                                <Select.Option value="text">text</Select.Option>
                                <Select.Option value="number">number</Select.Option>
                              </Select>
                            </div>
                            <div className="textbox-container">
                              <Input
                                type={this.state.type == "text" ? "text" : "number"}
                                placeholder="Value"
                                onChange={(e) => this.setState({ value: e.target.value, validate_value: false })}
                                value={this.state.value}
                                style={this.state.validate_value ? { borderColor: "red" } : {}}
                                onPressEnter={this.addRow}
                              />
                            </div>
                            <div className="desired-capa-row-plus-btn" onClick={() => this.addRow()}>
                              +
                            </div>
                          </div>
                        </div>
                        <div className="json-body-render">
                          <div className="json-body-render-top">
                            <div className="json-body-render-title">JSON Representation</div>
                            <div className="json-body-render-edit">
                              <Button
                                className="edit-session"
                                onClick={() =>
                                  this.setState({ field: [], capabilities: {}, existing_capabilities: "", addUsingjson: "", editJSON: false })
                                }
                              >
                                Clear All
                              </Button>
                              {this.state.editJSON ? (
                                <React.Fragment>
                                  <Button icon="check" className="edit-session" onClick={this.setJSONCapabilities} />
                                  <Button icon="close" className="edit-session" onClick={() => this.setState({ editJSON: !this.state.editJSON })} />
                                </React.Fragment>
                              ) : (
                                <Button
                                  icon="edit"
                                  className={["edit-session"]}
                                  onClick={() => {
                                    this.setState({ editJSON: true });
                                    if (JSON.stringify(this.state.capabilities) != "{}")
                                      this.setState({ addUsingjson: JSON.stringify(this.state.capabilities) });
                                  }}
                                />
                              )}
                            </div>
                          </div>
                          {this.state.editJSON ? (
                            <Input.TextArea
                              autoFocus
                              placeholder="Write JSON here"
                              className="text-input"
                              value={this.state.addUsingjson}
                              onChange={(e) => this.setState({ addUsingjson: e.target.value })}
                              style={{ width: "100%", height: "100%" }}
                              autoSize={{ minRows: 8, maxRows: 15 }}
                              q
                            />
                          ) : (
                            <pre className="json-body-render-body">{JSON.stringify(this.state.capabilities, null, 4)}</pre>
                          )}
                        </div>
                      </div>
                    </TabPane>
                    <TabPane tab={`Saved Capability (${capabilitiesLength})`} key="2" disabled={capabilitiesLength === 0}>
                      <SavedSessions setCapabilities={this.setCapabilities} />
                    </TabPane>
                  </Tabs>
                </div>
              </div>
              <div className="session-body-footer">
                <div onClick={() => this.props.history.push("/")} className="secondary-button-container">
                  <div className="logo" style={{ transform: "rotate(180deg)" }} />
                  HOME
                </div>
                {JSON.stringify(this.state.capabilities) != "{}" ? (
                  <React.Fragment>
                    <div className="secondary-button-container animated fadeInRight" onClick={this.updateCapability}>
                      {this.state.existing_capabilities.id == 0 || this.state.existing_capabilities.id ? "UPDATE" : "SAVE"}
                    </div>
                    <div onClick={() => this.startSession()} className="start-button-container animated fadeInRight">
                      START SESSION
                      <div className="logo" />
                    </div>
                  </React.Fragment>
                ) : null}
              </div>
            </div>
            <Modal
              title="Save Capability"
              visible={this.state.saveVisible}
              onCancel={() => {
                this.setState({ saveVisible: false, save_capability_name: "", save_capability_date: "" });
              }}
              onOk={this.saveCapability}
            >
              <div className="textbox-container">
                <Input
                  autoFocus
                  type="text"
                  value={this.state.save_capability_name}
                  className="text-input"
                  onChange={(e) => this.setState({ save_capability_name: e.target.value })}
                />
              </div>
            </Modal>
            <Loader status={this.state.loader} />
          </React.Fragment>
        )}
      </Context.Consumer>
    );
  }
}
