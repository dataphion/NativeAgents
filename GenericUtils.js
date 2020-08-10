let GenericUtils;
import axios from "axios";
import constants from "./constant";

export default GenericUtils = {
  getElementByTagName: async (tagName, platform) => {
    let query = `{
            devicetypes(where:{type: "${platform}"}){
                 testcasecomponents(where : {objectrepository:{tag: "${tagName}"}}){
                    objectrepository{
                        id
                        tag
                        element_attributes
                    }
                } 
            }
          }`;

    const data = JSON.stringify({
      query
    });
    const headers = {
      "Content-Type": "application/json"
    };

    const component = await axios.post(constants.graphql, data, { headers: headers });
    // console.log(testcase_req);
    const component_json = component.data.data;
    console.log(component_json.devicetypes[0].testcasecomponents[0].objectrepository);
    console.log("**********");

    return component_json.devicetypes[0].testcasecomponents[0].objectrepository;
  },

  getTestStepsByGroupName: async (groupName, platform) => {
    let query = `{
            testcasegroups(where:{name:"${groupName}"}){
              testcasecomponents(where:{devicetype:{type:"${platform}"}}){
                id
                objectrepository{
                  id
                  element_attributes
                  action
                  element_value
                }
              }
            }
          }`;
    const data = JSON.stringify({
      query
    });
    const headers = {
      "Content-Type": "application/json"
    };

    const component = await axios.post(constants.graphql, data, { headers: headers });
    // console.log(testcase_req);
    const component_json = component.data.data;
    console.log(component_json.testcasegroups[0].testcasecomponents);
    console.log("**********");

    return component_json.testcasegroups[0].testcasecomponents;
  }
};
