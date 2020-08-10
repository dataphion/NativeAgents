
// const puppeteer = require("puppeteer")
const axios = require("axios")
export default class Web_Driver{
    

    // _get_screenshot = async () =>{
    //     const browser = await puppeteer.launch({
    //         headless: false
    //     });
    //     const page = await browser.newPage();
    //     await page.goto('http://rokudev:rokudev@10.0.25.141/plugin_inspect',{waitUntil:'networkidle0'});
    
    //     let element1 = await page.$x("//button[contains(text(), 'Screenshot')]");
    //     element1[0].click()
    
    //     await page.waitForNavigation();
    
    //     let img_src = await page.evaluate( () => Array.from( document.querySelectorAll( 'img' ), element => element.src) );
    //     while (!img_src.length>0) {
    //         img_src = await page.evaluate( () => Array.from( document.querySelectorAll( 'img' ), element => element.src) );
    //     }
    //     console.log(img_src);
        
    //     // other actions...
    //     await browser.close();
    // }
}