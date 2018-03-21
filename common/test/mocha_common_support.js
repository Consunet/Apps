/**
 * @file browser interface functions to support common testing
 */

const webdriver = require('selenium-webdriver');
const expect = require("chai").expect;
const assert = require("chai").assert;
const fs = require('fs');
var http = require("http");

module.exports.commonFullPath = function ()
{
    return __dirname;
}

module.exports.refreshCoverage = async function (driver)
{
    // post coverage info  
    await driver.executeScript("return window.__coverage__;").then(function (obj) {

        try
        {
            var str = JSON.stringify(obj);

            var options = {
                port: 8888,
                host: "localhost",
                path: "/coverage/client",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            };
            var req = http.request(options, function (res) {
                //done();
            });
            req.write(str);
            req.end();
        } catch (e)
        {
            console.log("Error in coverage post:" + e);
        }
    });


}

module.exports.openOptions = async function openOptions(driver, skipConfirmDel) {
    await driver.findElement(webdriver.By.id('menu-button')).click();
    await driver.findElement(webdriver.By.id('menu-options')).click();
 
    if (skipConfirmDel && await driver.findElement(webdriver.By.id('opt-confirm-del')).isSelected()) {     
        //deselect
        await driver.findElement(webdriver.By.id('opt-confirm-del')).click();      
    }
}

exports.encryptWith = async function (driver, password, hint) {

    await driver.findElement(webdriver.By.id('enc-password')).sendKeys(password);
    await driver.findElement(webdriver.By.id('enc-hint')).sendKeys(hint);

    await driver.findElement(webdriver.By.id('do-encrypt')).click();

    await driver.wait(webdriver.until.alertIsPresent())
    await driver.switchTo().alert().accept();
}


module.exports.assertFormIsLocked = async function assertFormIsLocked(driver, isLocked) {
    var lockedStyle = await driver.findElement(webdriver.By.id('locked')).getAttribute("style");
    //console.log(lockedStyle);
    var unlockedStyle = await driver.findElement(webdriver.By.id('unlocked')).getAttribute("style");

    if (isLocked) {
        expect(lockedStyle, "Locked div is hidden").to.be.equal("display: inline;");
        expect(unlockedStyle, "Unlocked div is shown").to.be.equal("display: none;");
    } else {
        expect(lockedStyle, "Locked div is shown").to.be.equal("display: none;");
        expect(unlockedStyle, "Unlocked div is hidden").to.be.equal("display: inline;");
    }
}

module.exports.assertBrowserUnsupportedMessageIsShown = async function assertBrowserUnsupportedMessageIsShown(driver, isShown) {
    var unsupportedStyle = await driver.findElement(webdriver.By.id('unsupported')).getAttribute("style");

    if (isShown) {
        expect(unsupportedStyle, "Browser unsupported div is hidden").to.be.equal("display: inline;");
    } else {
        expect(unsupportedStyle, "Browser unsupported div is hidden").to.be.equal("display: none;");
    }
}

module.exports.assertHelpIsShown = async function assertHelpIsShown(driver, isShown) {
    
    var helpDisplayed = await driver.findElement(webdriver.By.id('help-screen')).isDisplayed();

    if (isShown) {
        expect(helpDisplayed, "Help is hidden").to.equal(true);
    } else {
        expect(helpDisplayed, "Help is shown").to.equal(false);
    }
}

module.exports.decryptWith = async function decryptWith(driver, password) {
    await driver.findElement(webdriver.By.id('dec-password')).sendKeys(password);
    await driver.findElement(webdriver.By.id('do-decrypt')).click();
}

module.exports.setEncryptPass = async function setEncryptPass(driver, password) {
    var encPass = await driver.findElement(webdriver.By.id('enc-password'))
    await encPass.clear();
    await encPass.sendKeys(password);
}

module.exports.setCommonOptions = async function setCommonOptions(driver, saveFilename, timeout) {
    await this.openOptions(driver);
    await driver.findElement(webdriver.By.id('opt-timeout')).clear();
    await driver.findElement(webdriver.By.id('opt-save-filename')).clear();
    await driver.findElement(webdriver.By.id('opt-timeout')).sendKeys(timeout);
    await driver.findElement(webdriver.By.id('opt-save-filename')).sendKeys(saveFilename);
    await driver.findElement(webdriver.By.id('opt-save-filename')).click(); //updates the timeout
}

module.exports.sendKeysOptionSaveFilename = async function sendKeysOptionSaveFilename(driver, saveFilename) {
    await this.openOptions(driver);
    await driver.findElement(webdriver.By.id('opt-save-filename')).sendKeys(saveFilename);
}

