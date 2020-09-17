// const host = "https://admin.dataphion.com/";
// const host = "http://localhost:1337/";
// const constant = {
//   host: host,
//   login: host + "auth/local",
//   testcases: host + "testcases",
//   objectrepositories: host + "objectrepositories",
//   testcasecomponents: host + "testcasecomponents",
//   devicetype: host + "devicetypes/device_validate",
//   upload: host + "upload",
//   graphql: host + "graphql",
// };

const host = process.env.HOST || "http://localhost:4200";
const constant = {
  host: host,
  login: host + "/api/auth/local",
  testcases: host + "/api/testcases",
  objectrepositories: host + "/api/objectrepositories",
  testcasecomponents: host + "/api/testcasecomponents",
  devicetype: host + "/api/devicetypes/device_validate",
  upload: host + "/api/upload",
  graphql: host + "/api/graphql",
};

export default constant;
