const puppeteer = require('puppeteer');
var DOMParser = require('xmldom').DOMParser;



    let recursive = (xmlNode, points, parentPath, index) => {
      // Translate attributes array to an object
      // console.log("points",points);

      let attrObject = {};
      //for (let attribute of xmlNode.attributes || []) {
      if(xmlNode.attributes){
for(let [key, attribute] of Object.entries(xmlNode.attributes)){
        if (["x", "y"].includes(attribute.name)) {
          attrObject[attribute.name] =
            points[attribute.name] + Number(attribute.value);
        } else {
          attrObject[attribute.name] = attribute.value;
        }
        if (attribute.name == "metainfo") {
          // console.log(attribute.value);
        }
      }

      // Dot Separated path of indices
      let path =
        index !== undefined && `${!parentPath ? "" : parentPath + "."}${index}`;
        console.log("-----------------")
        console.log(xmlNode.childNodes);
        console.log("-----------------")
        let nodes = Object.values(xmlNode.childNodes);
        console.log(nodes);
      return {
        children: [...nodes].map((childNode, childIndex) =>
          recursive(childNode, attrObject, path, childIndex)
        ),
        tagName: xmlNode.tagName,
        attributes: attrObject,
        xpath: getOptimalXPath(xmlDoc, xmlNode, uniqueAttributes),
        path
      };

      }
          };

    // var myRegEx = /[\w]+\:\:(?:[\w]*\:\:)*/g;
    // var matches = this.getMatches(source, myRegEx, 1);
    // console.log("-------matches------");
    // console.log(matches);
    
const main = async () => {
    let doc = new DOMParser().parseFromString(
    '<xml xmlns="a" xmlns:c="./lite">\n'+
        '\t<child>test</child>\n'+
        '\t<child></child>\n'+
        '\t<child/>\n'+
    '</xml>'
    ,'text/xml');
    console.log(doc);
     console.log(doc);
    doc.children = doc.childNodes;
    console.log("XML DOC VALUE --> ");
    //console.log(doc);
    let sourceXML = doc.children[0];
    console.log("Source XML --> ");
    console.log(sourceXML);

    return recursive(sourceXML, { x: 0, y: 0 });

}
   


main().then(function(d){
    console.log("Done");
})


