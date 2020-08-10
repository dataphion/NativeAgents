import React, { Component, createContext } from "react";
export const Context = createContext();

export class Provider extends Component {
  state = {
    selected_step: {},
    selected_step_screenshot: {},
    selected_step_sendkey: "",
    capabilities: {},
    activeTabForSession: "1"
  };

  setStepData = selected_step => {
    this.setState({ selected_step });
  };

  setStepScreenshot = selected_step_screenshot => {
    this.setState({ selected_step_screenshot });
  };

  setStepSendkey = selected_step_sendkey => {
    this.setState({ selected_step_sendkey });
  };

  setCapabilities = capabilities => {
    this.setState({ capabilities });
  };

  setActiveTabForSession = tab => {
    this.setState({ activeTabForSession: tab });
  };

  render() {
    return (
      <Context.Provider
        value={{
          selected_step: this.state.selected_step,
          selected_step_screenshot: this.state.selected_step_screenshot,
          setStepData: this.setStepData,
          setStepScreenshot: this.setStepScreenshot,
          selected_step_sendkey: this.state.selected_step_sendkey,
          setStepSendkey: this.setStepSendkey,
          capabilities: this.state.capabilities,
          setCapabilities: this.setCapabilities,
          setActiveTabForSession: this.setActiveTabForSession,
          activeTabForSession: this.state.activeTabForSession
        }}
      >
        {this.props.children}
      </Context.Provider>
    );
  }
}
