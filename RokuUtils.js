import promiseIpc from "electron-promise-ipc";
const { webContents } = require("electron");
import utils from "util";
import axios from "axios";
var _ = require('lodash');
const fs = require('fs');
const { ipcMain } = require("electron");
export default class RokuUtils {
  constructor() {
    // super(props);
    console.log("Creating utils object..");
  }

  async findElement(driver, element_props) {
    let element;
    if (element_props.id) {
      element = await this.getElement(driver, "id", element_props.id);
    }
    if (element_props.xpath) {
      element = await this.getElement(driver, "xpath", element_props.xpath);
    }
    return element;
  }
  async findActiveElement(driver, element_props) {
    // let element = await driver.findElement("xpath","//*[@highlighted='true']")
    let element = await driver.getActiveElement();
    let attr = await driver.getElementAttribute(element.ELEMENT, "id");
    return element;
  }
  async getElement(driver, key, selector) {
    if (key == "id") {
      let element = await driver.findElement(key, selector);
      return element;
    } else if (key == "xpath") {
      let element = await driver.findElement(key, selector);
      return element;
    }
  }
  async parsehighlightedelement(source,event) {
    let xmlDoc;
    let highlighted = {};
    let highlighted_elements = [];

    let recursive = (xmlNode, points, parentPath, index) => {
      let attrObject = {};
      let flag = false;
      let highlighted_children = [];
      for (let attribute_key of Object.keys(xmlNode.attributes) || []) {
        let attribute = xmlNode.attributes[attribute_key];
        if (["x", "y"].includes(attribute_key)) {
          attrObject[attribute_key] = points[attribute_key] + Number(attribute);
        } else {
          attrObject[attribute_key] = attribute;
        }
        if (attribute_key == "highlighted") {
          flag = true;
        } else if (attribute_key == "metainfo" && attribute) {
          let metainfos = JSON.parse(attribute);
          for (const metainfo of metainfos.metainfo) {
            if (metainfo.highlighted == "true") {
              highlighted_children.push(metainfo);
              flag = true;
              break;
            }
          }
        }
      }
      let highlighted_element = {
        parent: null,
        children: null,
        id: xmlNode.path
      };
      highlighted_children.length > 0
        ? (highlighted_element.children = highlighted_children)
        : null;
      if (flag) {
        highlighted_element.parent = xmlNode;
        highlighted_elements.push(highlighted_element);
      }
      let result = {
        children: [...xmlNode.children].map((childNode, childIndex) =>
          recursive(childNode, attrObject, xmlNode.path, childIndex)
        ),
        tagName: xmlNode.tagName,
        attributes: attrObject,
        xpath: xmlNode.xpath || "",
        path: xmlNode.path
      };
      if (
        highlighted_elements.length > 0 &&
        highlighted_elements[0].id == xmlNode.path
      ) {
        highlighted[xmlNode.path] = highlighted_elements;
        highlighted_elements = [];
      }
      return result;
    };

    try {
      xmlDoc = await this.parsexmltojson(event,source);

      for (const sourceXML of xmlDoc.children) {
        recursive(sourceXML, { x: 0, y: 0 });
        // console.log(highlighted_elements);
      }
      return highlighted;
    } catch (error) {
      console.log("-----------error----------");
      console.error(error);
      return error;
    }
  }
  waitandreturndata = async ()=> {
    return new Promise((resolve,reject)=>{
      ipcMain.once('parse_screenshot-reply', (event, sum) => {
        resolve(sum)
      })
    })
  }
  parsexmltojson = async (event,source) => {
    event.reply('parse_screenshot', { source });
    console.log('started' + new Date());
    let data = await this.waitandreturndata();
    console.log('completed' + new Date());
    return data
  }
  isInPosition(exp_val, cur_val) {
    console.log(exp_val, cur_val);

    if (cur_val <= exp_val + 25 && cur_val >= exp_val - 25) {
      console.log("IN POS..");
      return true;
    } else {
      console.log("OUT OF POS..");
      return false;
    }
  }
  _request = async (method, request_url, data = {}) => {
    return axios({
      method: method,
      url: request_url,
      data: JSON.stringify(data)
    }).then(function (response) {
      return response;
    });
  }
  _build_request_url = async endpoint => {
    return `http://10.0.25.141:8060/${endpoint}`;
  }
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  getHighlightedelement = async (driver,event, source = null,options={}) => {
    if (!source) {
      source = await driver.getPageSource();
    }
    let ts;
    const highlighted_elements = await this.parsehighlightedelement(source,event);
    console.log("----------highlighted_elements------------");
    console.log(highlighted_elements);
    console.log("----------highlighted_elements------------");
    if (options.returnall) {
      return highlighted_elements
    }
    if ("3.1.0" in highlighted_elements) {
      console.log("Focused element is at Menu");
      ts = highlighted_elements["3.1.0"].pop().parent.attributes;
    } else {
      console.log("Focused element is not at Menu");
      let to_be_ensembled = _.pickBy(highlighted_elements, function(value, key) {
        return _.includes(key, "3.2"); // if one of the strings is included in the key return true
      });
      console.log("to_be_ensembled",to_be_ensembled);
      if (to_be_ensembled) {
        // console.log("Focused element is at Ribbon");
        if (options.lookback) {
          ts = to_be_ensembled[Object.keys(to_be_ensembled)[Object.keys(to_be_ensembled).length-1]].pop()
        }else{
          ts = to_be_ensembled[Object.keys(to_be_ensembled)[Object.keys(to_be_ensembled).length-1]].pop().parent.attributes;
        }

      } else {
        ts = true;
      }
    }
    // console.log(utils.inspect(highlighted_elements,false,null));
    return ts;
  }
  checklookbackchannel = async (driver,event) =>{
    //checking if it is at channel
    let highlightedelement = await this.getHighlightedelement(driver,event,null,{lookback:true})
    if (highlightedelement.children.length>0 && highlightedelement.children[0].channel) {
      let request_url = await this._build_request_url(`keypress/down`);
      await this._request("post", request_url);
      highlightedelement = await this.getHighlightedelement(driver,event,null,{lookback:true})
      const metainfos = JSON.parse(highlightedelement.parent.attributes.metainfo)
      if(metainfos.metainfo[0].id >=0){
        request_url = await this._build_request_url(`keypress/up`);
        await this._request("post", request_url);
        request_url = await this._build_request_url(`keypress/right`);
        await this._request("post", request_url);
        await this.sleep(500)
        await this.checklookbackchannel(driver)
      }else{
        return
      }
    }else{
      return
    }
  }
  checkrecordbtnwithchannel = async (driver,event) =>{
    //checking if it is at channel
    let highlightedelement = await this.getHighlightedelement(driver,event,null,{lookback:true})
    if (highlightedelement.children.length>0 && highlightedelement.children[0].channel) {
      let request_url = await this._build_request_url(`keypress/down`);
      await this._request("post", request_url);
      highlightedelement = await this.getHighlightedelement(driver,event,null,{lookback:true})
      const metainfos = JSON.parse(highlightedelement.parent.attributes.metainfo)
      request_url = await this._build_request_url(`keypress/select`);
      await this._request("post", request_url);
      await this.sleep(500)
      let ts = await this.checkrecordbutton(driver)
      if(!ts){
        request_url = await this._build_request_url(`keypress/back`);
        await this._request("post", request_url);
        request_url = await this._build_request_url(`keypress/up`);
        await this._request("post", request_url);
        request_url = await this._build_request_url(`keypress/right`);
        await this._request("post", request_url);
        await this.sleep(500)
        await this.checkrecordbtnwithchannel(driver)
      }else{
        return
      }
    }else{
      return
    }    
  }
  checkrecordbutton = async (driver,event) =>{
    let source = await driver.getPageSource();
    let js_source = await this.parsexmltojson(event,source);
    let gotrecord = false
    let recursive = xmlNode => {
      for (let attribute_key of Object.keys(xmlNode.attributes) || []) {
        let attribute = xmlNode.attributes[attribute_key];
        if (attribute_key == "objectName" && attribute == "details_button_record") {
          gotrecord = true
        }
      }
      let result = {
        children: [...xmlNode.children].map((childNode, childIndex) =>
          recursive(childNode)
        ),
        tagName: xmlNode.tagName,
        attributes: xmlNode.attributes,
        xpath: xmlNode.xpath || "",
        path: xmlNode.path
      };
      return result;
    };
    for (const sourceXML of js_source.children) {
      recursive(sourceXML);
    }
    return gotrecord
  }
  movetoposition = async (driver, event,location, cur_location, getribbon = null) => {
    if (
      this.isInPosition(location.x, cur_location.x) &&
      this.isInPosition(location.y, cur_location.y)
    ) {
      console.log("We're focused on required element..");
      return;
      // await driver.execute('mobile: pressButton', {name: 'Select'});
    } else {
      console.log("We're not in expected position. Hence Moving..");
      console.log("Adjusting Y Coordinate..");
      // Adjust Y Position
      while (true) {
        console.log("Focused element location is");
        cur_location = await this.getHighlightedelement(driver,event);
        if (getribbon) {
          console.log("getting new location");
          let source = await driver.getPageSource();
          let js_source = await this.parsexmltojson(event,source);
          let { ribbon_list, tile_list } = await this.getgotoRibbonTileLocation(
            getribbon.text,
            js_source
          );
          if (ribbon_list.length == 1) {
            location = ribbon_list[0];
          } else if (ribbon_list.length > 1) {
            console.log("Got more than one ribbons");
            break;
          } else {
            console.log("Didnt Find any ribbon");
            break;
          }
        }
        console.log("-----cur_location---y---------");
        console.log(cur_location.y, cur_location.x);
        console.log(location.y, location.x);
        console.log("-----cur_location---------");
        if (this.isInPosition(location.y, cur_location.y)) {
          console.log("Y is in position now..");
          break;
        }
        if (cur_location.y < location.y) {
          // Move Right.
          let request_url = await this._build_request_url(`keypress/down`);
          await this._request("post", request_url);
        } else {
          // Move Left.
          let request_url = await this._build_request_url(`keypress/up`);
          await this._request("post", request_url);
        }
        await this.sleep(500);
      }
      console.log("Adjusting X Coordinate..");
      // Adjust x position..
      while (true) {
        console.log("Focused element location is");
        cur_location = await this.getHighlightedelement(driver,event);
        if (getribbon) {
          let source = await driver.getPageSource();
          let js_source = await this.parsexmltojson(event,source);
          let { ribbon_list, tile_list } = await this.getgotoRibbonTileLocation(
            getribbon.text,
            js_source
          );
          if (ribbon_list.length == 1) {
            location = ribbon_list[0];
          } else if (ribbon_list.length > 1) {
            console.log("Got more than one ribbons");
            break;
          } else {
            console.log("Didnt Find any ribbon");
            break;
          }
        }
        if (this.isInPosition(location.x, cur_location.x)) {
          console.log("X is in position now..");
          break;
        }
        console.log("-----cur_location---x---------");
        console.log(cur_location.y, cur_location.x);
        console.log(location.y, location.x);
        console.log("-----cur_location---------");
        if (cur_location.x < location.x) {
          // Move Right.
          console.log("came to right");
          let request_url = await this._build_request_url(`keypress/right`);
          await this._request("post", request_url);
        } else {
          // Move Left.
          console.log("came to left");
          let request_url = await this._build_request_url(`keypress/left`);
          await this._request("post", request_url);
        }
        await this.sleep(500);
      }
    }
  }
  async navigateToElement(driver,event, element) {
    console.log("Starting the Navigation Now...");
    let location = element;
    location.x = Number(location.x);
    location.y = Number(location.y);
    console.log("Elements location is ");
    console.log(location);

    console.log("Focused element location is");
    let cur_location = await this.getHighlightedelement(driver,event);
    cur_location.x = Number(cur_location.x);
    cur_location.y = Number(cur_location.y);
    console.log(cur_location);

    await this.movetoposition(driver,event, location, cur_location);
  }
  async savetolocal(data){
    fs.writeFile("/home/daksh/Projects/testj.json", data, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log("The file was saved!");
    });
  }
  async goingtoribbon(driver,event, element_props, ribbon_name,tile_name=null) {
    let source = await driver.getPageSource();
    console.log("source");
    console.log(source);  
    let js_source = await this.parsexmltojson(event,source);
    // return js_source
    // await this.savetolocal(js_source)
    let focused_element = await this.getHighlightedelement(driver,event, source);
    
    console.log("going to ribbon");
    let { ribbon_list, tile_list } = await this.getgotoRibbonTileLocation(
      ribbon_name,
      js_source,
      tile_name
    );
    console.log(ribbon_list);
    
    try {
      if (ribbon_list.length == 1) {
        await this.movetoposition(driver,event, ribbon_list[0], focused_element, {
          text: ribbon_name
        });
      } else if (ribbon_list.length > 1) {
        console.log("Got more than one ribbons");
      } else {
        console.log("Didnt Find any ribbon");
      }
    } catch (error) {
      console.log("-----------error----------");
      console.error(error);
      return error;
    }
    return { ribbon_list, tile_list };
  }
  async getgotoRibbonTileLocation(text, js_source,tile=null) {
    // console.log("---------------");
    // console.log(text);
    // console.log(js_source);
    // console.log("--------------- ");
    
    let ribbon_list = [];
    let tile_list = [];
    let recursive = xmlNode => {
      for (let attribute_key of Object.keys(xmlNode.attributes) || []) {
        let attribute = xmlNode.attributes[attribute_key];
        if (attribute_key == "objectName" && attribute == text) {
          ribbon_list.push(xmlNode.attributes);
        }
        // if (tile && attribute_key == "metainfo" && attribute && attribute == text) {
        let lc_attribute = attribute.toLowerCase();
        let lc_text = text.toLowerCase();
        if (tile && attribute_key == "metainfo" && attribute && lc_attribute.includes(lc_text)) {
          ribbon_list.push(xmlNode.attributes);
          let metainfos = JSON.parse(attribute);
          tile_list.push(metainfos.metainfo);
        }
      }
      let result = {
        children: [...xmlNode.children].map((childNode, childIndex) =>
          recursive(childNode)
        ),
        tagName: xmlNode.tagName,
        attributes: xmlNode.attributes,
        xpath: xmlNode.xpath || "",
        path: xmlNode.path
      };
      return result;
    };
    for (const sourceXML of js_source.children) {
      recursive(sourceXML);
    }
    return { ribbon_list, tile_list };
  }
  async goingtotile(driver,event, element_props, ribbon_name,tile_name) {
    //// go to ribbon first
    let { ribbon_list, tile_list } = await this.goingtoribbon(
      driver,
      event,
      element_props,
      ribbon_name,
      tile_name
    );

    //// now go to tile
    try {
      if (ribbon_list.length == 1) {
        await this.movetopositionbytile(ribbon_list[0],tile_name);
      } else if (ribbon_list.length > 1) {
        console.log("Got more than one tiles");
      } else {
        console.log("Didnt Find any tile");
      }
    } catch (error) {
      console.log("-----------error----------");
      console.error(error);
      return error;
    }
    return { ribbon_list, tile_list };
  }
  movetopositionbytile = async (
    ribbon_list,
    text
  ) => {
    console.log("Adjusting X Coordinate..");
    // Adjust x position..
    const metainfos = JSON.parse(ribbon_list.metainfo)
    let index = 0
    console.log(metainfos);
    for (const metainfo of metainfos.metainfo) {
      if(index == 0){
        console.log("It's at 0, ignoring");
        index+=1;
        continue
      }
      if (index!=0) {
        if (!metainfo.label || metainfo.label != text) {
          // Move Right.
          console.log("came to right");
          let request_url = await this._build_request_url(`keypress/right`);
          await this._request("post", request_url);
          await this.sleep(500)
          index+=1;
        }else{
          break
        }
      }
    }
    // for (const metainfo of metainfos.metainfo) {
    //    if(metainfo.) 
    // }
  }
}
