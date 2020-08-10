import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Draggable extends Component {
  drag = (e) => {
    e.dataTransfer.setData("transfer", e.target.id);
  };

  noAllowDrop = (e) => {
    e.stopPropagation();
  };

  render() {
    return (
      <div
        id={this.props.id}
        draggable="true"
        onDragStart={this.drag}
        onDragOver={this.noAllowDrop}
        className={this.props.className}
        style={this.props.style}
      >
        {this.props.children}
      </div>
    );
  }
}

Draggable.PropTypes = {
  id: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node,
};
