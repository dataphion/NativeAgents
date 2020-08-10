const AppDriver = require('./appdriver');

let device_type = "android";

let main = async() => {
    let device = new AppDriver();
    await device.init(device_type);
    console.log("Resetting Favorites..");
    await device.resetFavorites();
    console.log("Reset Favorites Completed..");
    await device.gotoRibbon('Favorites');
}


main().then(function(data){
    console.log("Testcase 1 completed...");
})