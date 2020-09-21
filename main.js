// Below code uncomment while create windows installer file

// ==================== Start windows installer ====================
// const setupEvents = require("./installers/setupEvents");
// if (setupEvents.handleSquirrelEvent()) {
//   // squirrel event handled and app will exit in 1000ms, so don't do anything else
//   return;
// }

// ==================== End windows installer ====================

import { app, Notification, Menu } from "electron";
import io from "socket.io-client";
import axios from "axios";
import constants from "./constant";
import TVOSExecutor from "./TVOSExecutor";
import AndroidExecutor from "./AndroidExecutor";
import RokuTVExecutor from "./RokuTVExecutor";
const wdio = require("webdriverio");
const socket = io.connect(constants.host);
const options = {
  title: "EaselQA is Online",
  body: "You can record the mobile testcase from the website.",
};
let DRIVER;
let EXECUTOR = null;
let deviceOS;
let deviceIp;
let opts = {
  hostname: "127.0.0.1",
  port: 4723,
  path: "/wd/hub",
  capabilities: {
    platformName: "Android",
    platformVersion: "10.0",
    deviceName: "Android Emulator",
    appPackage: "com.dib",
    appActivity: "com.dib.MainActivity",
    automationName: "UiAutomator2",
    newCommandTimeout: 100000,
  },
};

const mainMenuTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: "Quite",
        accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
        click() {
          app.quit();
        },
      },
    ],
  },
];

const createWindow = async () => {
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // For get system IP and OS
  try {
    const getIP = await axios.get("https://api.ipify.org/?format=json");
    deviceIp = getIP.data.ip;
    deviceOS = process.platform;
    if (deviceOS == "darwin") {
      deviceOS = "MacOS";
    } else if (deviceOS == "win32" || deviceOS == "win64") {
      deviceOS = "Windows";
    } else if (deviceOS == "linux") {
      deviceOS = "Linux";
    }
    setInterval(() => {
      socket.emit("connected_desktop_agent", { os: deviceOS, ip: deviceIp, status: "Online" });
    }, 2000);
    launchApp();
  } catch (error) {
    console.log(error);
  }
};

const launchApp = async () => {
  const customNotification = new Notification(options);
  customNotification.show();
  socket.on(`create_recording_session_${deviceIp}`, async (data) => {
    await startSession(data);
  });

  // For refresh
  socket.on(`REFRESH_${deviceIp}`, (data) => refresh(data.capabilities));
  socket.on(`TAP_${deviceIp}`, (data) => tap(data));
  socket.on(`FOCUS_${deviceIp}`, (data) => focus(data));
  socket.on(`SENDKEYS_${deviceIp}`, (data) => sendkeys(data));
  socket.on(`PLAYBACK_${deviceIp}`, (data) => playback(data));
};

const startSession = async (data) => {
  opts["capabilities"] = data.capabilities;
  DRIVER = await wdio.remote(opts);
  setExecutor(opts["capabilities"]);
  await refresh(opts["capabilities"]);
  return "done";
};

function setExecutor(caps, event = null) {
  if (["tvOS", "IOS"].includes(caps.platformName)) {
    console.log("Setting platform as TVOS and initializing the executor..");
    EXECUTOR = new TVOSExecutor(DRIVER);
  } else if (caps.platformName == "Android") {
    EXECUTOR = new AndroidExecutor(DRIVER);
  } else {
    EXECUTOR = new RokuTVExecutor(DRIVER, event);
  }
}

const refresh = async (caps) => {
  let source, screenshot, window_size;
  try {
    source = await DRIVER.getPageSource();
  } catch (error) {
    console.log("Refreshed driver session");
    DRIVER = await wdio.remote(opts);
    setExecutor(opts["capabilities"]);
    source = await DRIVER.getPageSource();
  }

  screenshot = await DRIVER.takeScreenshot();
  window_size = await DRIVER.getWindowSize();
  let activity = !["tvOS", "IOS"].includes(caps.platformName) ? await DRIVER.getCurrentActivity() : "";
  console.log("Activity is --> " + activity);
  console.log("replying back to the server");
  await socket.emit("send_created_session_data", {
    ip: deviceIp,
    source,
    screenshot: "data:image/png;base64," + screenshot,
    window_size,
    activity,
  });
  return "done";
};

const tap = async (arg) => {
  const element_props = arg.element_props;
  await EXECUTOR.tap(element_props);
  await refresh();
};

const focus = async (arg) => {
  const element_props = arg.element_props;
  console.log(element_props);
  await EXECUTOR.focus(element_props);
  await refresh();
};

const sendkeys = async (arg) => {
  console.log("Inside Send Key to Element");
  const element_props = arg.element_props;
  await EXECUTOR.sendKeys(element_props, arg.text);
  await refresh();
};

const playback = async (data) => {
  await startSession(data);
  console.log("Will Run tests belonging to ID: " + data.testcase_id);
  await DRIVER.pause(6000);
  await EXECUTOR.startTest(data.testcase_id);
};

app.on("ready", createWindow);

app.on("quit", async () => {
  app.quit();
});

// Execut command
function execShellCommand(cmd) {
  const exec = require("child_process").exec;
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

// const getAllConnectedDevices = async () => {
//   const devices = await execShellCommand("adb devices"),
//     lines = devices.split("\n"),
//     filterDevices = [],
//     finalDevices = [];
//   lines.shift();
//   for (const d of lines) {
//     if (d) filterDevices.push(d.split("\t")[0]);
//   }

//   for (const id of filterDevices) {
//     const name = await execShellCommand(`adb -s ${id} shell getprop ro.product.model`);
//     finalDevices.push({ id, name: name.split("\n")[0] });
//   }
//   return finalDevices;
// };

// const getAllApps = async (d) => {
//   let allApps = await execShellCommand(`adb -s ${d} shell "pm list packages -f" | cut -f 2 -d "="`);
//   console.log(allApps.split("\n"));
// };
