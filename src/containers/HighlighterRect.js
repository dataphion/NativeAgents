import React, { Component } from "react";

let selectedPath = null;
export default class HighlighterRect extends Component {
  constructor(props) {
    super(props);
  }

  findElementByPath(path) {
    let source = this.props.source;
    console.log("SOME UNKNOWN SOURCE");
    console.log(source);
    let selectedElement = source;
    for (let index of path.split(".")) {
      selectedElement = selectedElement.children[index];
    }
    console.log(selectedElement);
    return { ...selectedElement };
  }

  parseCoordinates(element) {
    
    let { bounds, x, y, width, height } = element.attributes || {};
    let points = {}
    if (bounds) {
      let boundsArray = bounds.split(/\[|\]|,/).filter(str => str !== "");
      points = { x1: boundsArray[0], y1: boundsArray[1], x2: boundsArray[2], y2: boundsArray[3] };
    } 
    if (x != undefined && x != null) {
      x = parseInt(x, 10);
      y = parseInt(y, 10);
      width = parseInt(width, 10);
      height = parseInt(height, 10);
      points = { x1: x, y1: y, x2: x + width, y2: y + height };
    } 
    return points
  }

  selectHoveredElement() {
    selectedPath = true;
    let selectedElement = this.findElementByPath(this.props.element.path);
    console.log("Selected Hovered Element");
    console.log(selectedElement);
    this.props.onElementSelected(selectedElement);
  }

  unSelectHoveredElement() {
    selectedPath = false;
  }

  render() {
    let { element, zIndex, scaleRatio, key, xOffset } = this.props;
    const { x1, y1, x2, y2 } = this.parseCoordinates(this.props.element);
    let left = x1 * scaleRatio;
    let top = y1 * scaleRatio;
    let width = (x2 - x1) * scaleRatio;
    let height = (y2 - y1) * scaleRatio;

    let points = { left: left, top: top, width: width, height: height,scaleRatio:scaleRatio };
    if (left >= 0 && top >=0) {
      return (
        <div
          className="element-block"
          // onMouseOver={() => selectHoveredElement(key)}
          // onMouseOut={() => unSelectHoveredElement()}
          onClick={() => this.selectHoveredElement(element.path)}
          key={key}
          style={{ zIndex, left: left, top: top, width: width, height: height }}
        >
          <div></div>
        </div>
      );
    }else{

      return (
        <div
          className="element-block"
          // onMouseOver={() => selectHoveredElement(key)}
          // onMouseOut={() => unSelectHoveredElement()}
          onClick={() => this.selectHoveredElement(element.path)}
          key={key}
          style={{ zIndex:-1, left: left, top: top, width: width, height: height }}
        >
          <div></div>
        </div>
      );
    }
  }
}
