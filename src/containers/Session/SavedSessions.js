import React, { Component } from "react";
import { remote } from "electron";
import { Button, Table } from "antd";
import { Context } from "../../Context";

const HEIGHT_OF_SERVICE_CONFIG_AREA = 400;

export default class SavedSessions extends Component {
  static contextType = Context;
  state = {
    refresh: false
  };

  editSessionItem = id => {
    let capabilities = JSON.parse(window.localStorage.getItem("capabilities"));
    const filter = capabilities.filter(e => {
      return e.id == id;
    })[0];
    this.props.setCapabilities(filter, filter.capability);
    this.context.setActiveTabForSession("1");
  };

  deleteSessionItem = id => {
    let capabilities = JSON.parse(window.localStorage.getItem("capabilities"));
    capabilities.filter(e => {
      if (e.id == id) {
        capabilities.splice(capabilities.indexOf(e), 1);
      }
    });
    window.localStorage.setItem("capabilities", JSON.stringify(capabilities));
    this.setState({ refresh: !this.state.refresh });
  };

  render() {
    const columns = [
      {
        title: "Capabilities",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "Created By",
        dataIndex: "date",
        key: "date"
      },
      {
        title: "Actions",
        key: "x",
        render: (text, record) => {
          return (
            <React.Fragment>
              <Button icon="edit" className={["edit-session"]} onClick={() => this.editSessionItem(record.id)} />
              <Button icon="delete" onClick={() => this.deleteSessionItem(record.id)} />
            </React.Fragment>
          );
        }
      }
    ];
    const capabilities = JSON.parse(window.localStorage.getItem("capabilities"));
    const windowSizeHeight = remote.getCurrentWindow().getSize()[1] - HEIGHT_OF_SERVICE_CONFIG_AREA;
    return <Table rowKey="id" scroll={{ y: windowSizeHeight }} pagination={false} dataSource={capabilities} columns={columns} onRowClick={this.onRowClick} rowClassName={this.getRowClassName} />;
  }
}
