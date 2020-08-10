import React from "react";
// import Header from "../Components/Header";
import { Form, Input, Select } from "antd";
import constants from "../constant";
import axios from "axios";
import _ from "lodash";
import { Alert } from "rsuite";
import Loader from "../components/Loader";

const Setting = Form.create()(
  class extends React.Component {
    state = {
      loader: false,
      applications: [],
      app_features: []
    };

    componentDidMount() {
      if (window.localStorage.getItem("user_id")) {
        this.tcProperties();
      }
    }

    handleLogin = () => {
      const form = this.props.form;
      let error = false;
      form.validateFields(err => {
        if (err) {
          error = true;
        }
      });
      if (error) {
        return;
      }

      this.setState({ loader: true });
      axios
        .post(constants.login, { identifier: form.getFieldValue("username"), password: form.getFieldValue("password") })
        .then(resp => {
          window.localStorage.setItem("user_id", resp.data.user.id);
          window.localStorage.setItem("user_name", resp.data.user.username);
          Alert.success(`Logged in successfully, ${resp.data.user.username}`);
          this.tcProperties();
        })
        .catch(error => {
          this.setState({ loader: false });
          console.log(error);
          Alert.error("Something went wrong.");
        });
    };

    tcProperties = () => {
      fetch(constants.graphql, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          query: `{applications(where:{user:{id:"${window.localStorage.getItem("user_id")}"}}){id,name,features{id,name}}}`
        })
      })
        .then(response => response.json())
        .then(response => {
          let app_features = [];
          if (window.localStorage.getItem("selected_application")) {
            app_features = response.data.applications.filter(e => {
              return e.id == window.localStorage.getItem("selected_application");
            })[0].features;
          }
          this.setState({ applications: response.data.applications, app_features });
        })
        .catch(error => {
          console.log(error);
        });
    };

    renderTCProperties = () => {
      return (
        <React.Fragment>
          <Form.Item label="Select Application">
            <Select
              autoFocus
              onChange={id => {
                window.localStorage.setItem("selected_application", id);
                const app_features = this.state.applications.filter(e => {
                  return e.id == id;
                })[0].features;
                this.setState({ app_features });
                window.localStorage.removeItem("selected_feature");
              }}
              defaultValue={window.localStorage.getItem("selected_application")}
            >
              {this.state.applications.map((data, index) => (
                <Select.Option key={index} value={data.id}>
                  {data.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Select Feature">
            <Select onChange={e => window.localStorage.setItem("selected_feature", e)} defaultValue={window.localStorage.getItem("selected_feature")}>
              {this.state.app_features.map((data, index) => (
                <Select.Option key={index} value={data.id}>
                  {data.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </React.Fragment>
      );
    };

    logout = () => {
      window.localStorage.removeItem("user_id");
      window.localStorage.removeItem("user_name");
      window.localStorage.removeItem("selected_application");
      window.localStorage.removeItem("selected_feature");
      this.setState({ applications: [], app_features: [] });
      Alert.success("Logout successfully.");
    };

    render() {
      const { getFieldDecorator } = this.props.form;
      return (
        <React.Fragment>
          {/* <Header /> */}
          <Form layout="vertical">
            <div className="profile-body-container animated fadeIn">
              {window.localStorage.getItem("user_id") ? (
                <div className="profile-row-container">
                  <div className="profile-title-container">Application Configuration</div>
                  <div className="profile-sub-title-container">Testcase will create under selected application and feature</div>
                  <div className="profile-border-container" />
                  <div className="profile-form-container">
                    <div className="form-row-flex">{this.renderTCProperties()}</div>
                    <div className="profile-border-container" />
                    <div className="button-container">
                      <div onClick={() => this.props.history.push("/")} className="secondary-button-container">
                        <div className="logo" style={{ transform: "rotate(180deg)", marginRight: "10px" }} />
                        HOME
                      </div>
                      <div onClick={this.logout} className="start-button-container">
                        LOGOUT
                        <div className="logo" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="profile-row-container">
                  <div className="profile-title-container">Login</div>
                  <div className="profile-sub-title-container">Basic profile settings</div>
                  <div className="profile-border-container" />
                  <div className="profile-form-container">
                    <div className="form-row-flex">
                      <Form.Item label="Username">
                        {getFieldDecorator("username", {
                          rules: [
                            {
                              required: true
                            }
                          ],
                          initialValue: ""
                        })(<Input autoFocus onPressEnter={this.handleLogin} />)}
                      </Form.Item>
                      <Form.Item label="Password">
                        {getFieldDecorator("password", {
                          rules: [
                            {
                              required: true
                            }
                          ],
                          initialValue: ""
                        })(<Input type="password" onPressEnter={this.handleLogin} />)}
                      </Form.Item>
                    </div>
                    <div className="profile-border-container" />
                    <div className="button-container">
                      <div onClick={() => this.props.history.push("/")} className="secondary-button-container">
                        <div className="logo" style={{ transform: "rotate(180deg)" }} />
                        HOME
                      </div>
                      <div onClick={this.handleLogin} className="start-button-container">
                        LOGIN
                        <div className="logo" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="profile-row-container">
                <div className="profile-title-container">Plan Details</div>
                <div className="profile-sub-title-container">Choose the suitable plan according to your need</div>
                <div className="profile-border-container" />
                <div className="profile-form-container">
                  <div className="profile-plan-info-container">
                    Your current plan is
                    <div className="profile-active-plan">FREE PLAN</div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
          <Loader status={this.state.loader} />
        </React.Fragment>
      );
    }
  }
);

export default Setting;
