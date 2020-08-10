const axios = require("axios");
import AndroidExecutor from './AndroidExecutor';
const RokuTVExecutor = require("./RokuTVExecutor");
const wdio = require("webdriverio");
const options = require('./testconstants');

class AppDriver {
    constructor() {
    }
    init = async (device) => {
        if(device == 'android'){
            this.options = options.android;
            console.log(this.options);
            this.driver = await wdio.remote(this.options);
            this.executor = new AndroidExecutor(this.driver);
        }else{
            this.options = options.roku;
            this.driver = await wdio.remote(opts);
            this.executor = new RokuTVExecutor(this.driver);
        }
    }

    resetFavorites = async () => {
        await axios.get("http://localhost:5000/resetFavorites");
    }

    addFavorites = async (fav_channels) => {
        for(var channel of fav_channels){
            console.log("http://localhost:5000/setFavorites/"+channel);
            await axios.get("http://localhost:5000/setFavorites/"+channel)
        }
    }

    gotoRibbon = async (ribbon) => {
        await this.executor.goto("RIBBON", ribbon);
    }

    gotoTile = async (ribbon, tile) => {
        await this.executor.goto("TILE", {}, ribbon, tile);
    }

}

module.exports = AppDriver;