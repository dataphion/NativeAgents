const express = require('express')
const puppeteer = require('puppeteer');
const axios = require('axios');

const app = express()
const port = 5000
let page = null;

let headers = null;
let auth_headers = null;
let ribbon_data = {};

// -----ON NOW-------
on_now_headers = null;
on_now_ribbon = {};
on_now_url = null;

// -----Sports-------
sports_headers = null;
sports_ribbon = {};
sports_url = null;

// -----On Demand-------
on_demand_headers = null;
on_demand_ribbon = {};
on_demand_url = null;

// -----All Channels----
channels = {};

let browser = null;

let mytv_url = null;

let watches_url = 'https://p-cmwnext.movetv.com/watchlists/v4/watches?product=sling&platform=browser';
// let watches_delete_url = 'https://p-cmwnext.movetv.com/watchlists/v4/watches?product=sling&platform=browser&external_id=be5a3bce259a4c13947f4b4fbae5e005&type=channel'

app.get('/', (req, res) => {
  res.send('Hello World!')

});

app.get('/getRibbonData/:tab', (req, res) => {
  let tab = req.params.tab;
  if(tab == "my_tv"){
    res.send(ribbon_data);
  }else if(tab == "on_now"){
    res.send(on_now_ribbon);
  }else if(tab == "sports"){
    res.send(sports_ribbon);
  }else if(tab == "on_demand"){
    res.send(on_demand_ribbon);
  }else{
    res.send({"status": 'Invalid..'})
  }
  
});

app.get('/getRibbons', (req, res) => {
  res.send({ribbons : Object.keys(ribbon_data)});
});

app.get('/channels', (req, res) => {
  res.send(channels);
});

app.get('/getRibbons/:ribbon', (req, res) => {
  let ribbon = req.params.ribbon;
  ribbon = ribbon.replace(/_/g, ' ');
  res.send({ribbons : ribbon_data[ribbon]});
});
app.get('/setFavorites/:channelname', async(req, res) => {
  let channel_name = req.params.channelname;
  const channel_id = channels[channel_name]
  console.log('Channel ID :'+ channel_id);
  let h1 = headers;
  h1['authorization'] = decodeURIComponent(h1['authorization']);
  const inp = {
    method : 'post',
    url : 'https://p-cmwnext.movetv.com/watchlists/v4/watches',
    headers : h1,
    data : {
      external_id: channel_id,
      type: "channel",
      product: "sling",
      platform: "browser",
    }
  }
  console.log(inp);
  let d = await axios(inp);
  console.log(d);
  res.send({'status': 'Success'});
})
app.get('/resetFavorites', async (req, res) => {
  let my_channels = ribbon_data['My Channels'].tiles;
  for(var i=0; i<my_channels.length; i++){
    let t = my_channels[i];
    if(t.actions.CHANNEL_GUIDE_VIEW){
      let rm_url = `${watches_url}&external_id=${t.actions.CHANNEL_GUIDE_VIEW.id}`;
      console.log('Sending Delete request : '+rm_url);
      
      console.log({
        method: 'delete',
        url: rm_url,
        headers : auth_headers
      });
      try {
        await axios({
          method: 'delete',
          url: rm_url,
          headers : auth_headers
        });  
      } catch (error) {
        console.log(error);
        
      }
      
    }
  }
  await page.reload({ waitUntil: ["domcontentloaded"] });
  res.send({'status': 'success'});
})


const main = async () => {
  browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"]
  });

  page = await browser.newPage();
  await page.setDefaultNavigationTimeout(60000);
  await page.setRequestInterception(true);

  page.on('response', async(response) => {
    if (response.url().includes("1.json")){
      let resp = await response.json();
      let packs = resp.subscriptionpacks;
      channels = {};
      for(let pack of packs){
        if('channels' in pack){
          for(let ch of pack.channels){
            channels[ch.title] = ch.external_id;
          }
        }
        
      }
    }else if (response.url().includes("my_tv_tvod")){
      console.log("response code: ", response.status());
      let data = await response.json();
      console.log(response.url());
      let k = data.ribbons;
      console.log(Object.keys(data));
      ribbon_data = {};
      for(var i=0; i< k.length ; i++){
        if(k[i].tiles.length > 0){
          // console.log(k[i].title);
          ribbon_data[k[i].title] = k[i];
        }
      }
      console.log("My TV count ->"+ Object.keys(ribbon_data).length);
      
    }else if (response.url().includes("v1/on_now")){
      console.log("response code: ", response.status());
      let data = await response.json();
      console.log(response.url());
      let k = data.ribbons;
      console.log(Object.keys(data));
      on_now_ribbon = {}
      for(var i=0; i< k.length ; i++){
        if(k[i].tiles.length > 0){
          // console.log(k[i].title);
          on_now_ribbon[k[i].title] = k[i];
        }
      }
      console.log("On Now count ->"+ Object.keys(on_now_ribbon).length);
    }else if (response.url().includes("v1/sports")){
      console.log("response code: ", response.status());
      let data = await response.json();
      console.log(response.url());
      let k = data.ribbons;
      console.log(Object.keys(data));
      sports_ribbon = {}
      for(var i=0; i< k.length ; i++){
        if(k[i].tiles.length > 0){
          // console.log(k[i].title);
          sports_ribbon[k[i].title] = k[i];
        }
      }
      console.log("Sports count ->"+ Object.keys(sports_ribbon).length);
    }else if (response.url().includes("v1/shows")){
      // console.log("response code: ", response.status());
      console.log("Inside handler for sports");
      let data = await response.json();
      console.log(response.url());
      let k = data.ribbons;
      console.log(Object.keys(data));
      on_demand_ribbon = {}
      for(var i=0; i< k.length ; i++){
        if(k[i].tiles.length > 0){
          // console.log(k[i].title);
          on_demand_ribbon[k[i].title] = k[i];
        }
      }
      console.log("On Demand count ->"+ Object.keys(on_demand_ribbon).length);
    }
  });
  
  const interceptedRequest = (interceptedRequest) => {
    if (
      interceptedRequest.url().includes("watches")
    ) {
      headers = interceptedRequest.headers();
        //console.log("Intercepted requests");
      // console.log(headers);
    }
    if(interceptedRequest.url().includes("my_tv_tvod")){
      auth_headers = interceptedRequest.headers();
      mytv_url = interceptedRequest.url();
    }
    interceptedRequest.continue();
  };
  
  page.on("request", interceptedRequest);

    console.log("starting");
    try {
      //await page.goto("https://watch.sling.com/", { waitUntil: "networkidle0" });
      await page.goto("https://watch.sling.com/");
      //await page.waitForNavigation();
    } catch (error) {
      console.log("ok");
    }
    console.log("done");
    const selector = "//button[contains(text(),'Maybe Later')]";
    console.log(selector);
    try{
        await page.waitForXPath(selector, { timeout: 10000 })
        let s1 = await page.$x(selector);
        await s1[0].click();
    }catch(error){
        console.log("The element didn't appear.")
    }

    await page.waitForXPath('//*[@id="SIGN_IN"]');
    let s1 = await page.$x('//*[@id="SIGN_IN"]');
    await s1[0].click();
    await page.waitForXPath('//*[@id="sign-in-modal-email"]');
    let s2 = await page.$x('//*[@id="sign-in-modal-email"]');
    await s2[0].type("ravi.shankar@dataphion.com");
    let s3 = await page.$x('//*[@id="sign-in-modal-password"]');
    await s3[0].type("Ding@dong25");
    let s4 = await page.$x('//*[@id="e2e-submit-sign-in-button"]');
    await s4[0].click();
    console.log("Sign In");
    //await page.waitForNavigation({ waitUntil: 'networkidle0' })
    await page.waitFor(10000);
    console.log("Sign In compeleted");
    await page.waitForSelector(".on_now", {timeout : 120000});
    /*try {
      await page.waitForSelector(".favorite-channels__utility-tile", {
        timeout: 120000
      });
    } catch (error) {}
    await page.evaluate(() => {
      let elements = document.getElementsByClassName(
        "favorite-channels__utility-tile"
      );
      elements[0].click();
    });*/
    
    // page.removeListener("request", interceptedRequest);
    // await page.setRequestInterception(false);
    await page.waitFor(10000);
    console.log("Change URL to ON DEMAND..");
    await page.goto("https://watch.sling.com/browse/dynamic/shows")
    await page.waitForSelector(".on_now", {timeout : 120000});
    await page.waitFor(10000);
    console.log("Chage URL to Sports..");
    await page.goto("https://watch.sling.com/browse/dynamic/sports")
    await page.waitForSelector(".on_now", {timeout : 120000});
    await page.waitFor(10000);
    console.log("Change URL to ON NOW");
    await page.goto("https://watch.sling.com/browse/dynamic/on-now")
    await page.waitForSelector(".on_now", {timeout : 120000});
    
    
    // await browser.close()
}

main().then(function(data){
    console.log("Done");
    app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
})

