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
