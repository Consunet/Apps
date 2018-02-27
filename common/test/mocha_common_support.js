/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
 const webdriver = require('../../EveryPass/node_modules/selenium-webdriver');
 const firefox = require('../../EveryPass/node_modules/selenium-webdriver/firefox');
 const expect  = require("../../EveryPass/node_modules/chai").expect;
 const assert  = require("../../EveryPass/node_modules/chai").assert;
 const until = require("../../EveryPass/node_modules/selenium-webdriver").until;

module.exports.openOptions = async function openOptions(driver,confirmDel){
    await driver.findElement(webdriver.By.id('menu-button')).click();
    await driver.findElement(webdriver.By.id('menu-options')).click();
    //var optionsForm = await driver.findElement(webdriver.By.id('options'));
    if(confirmDel==true){
        await driver.findElement(webdriver.By.id('opt-confirm-del')).click();
    }
}

module.exports.encryptWith = async function encryptWith(driver, password, hint, writeToTarget){
    await driver.findElement(webdriver.By.id('enc-password')).sendKeys(password);
    await driver.findElement(webdriver.By.id('enc-hint')).sendKeys(hint);

    //heres where casper simulates encryption and writes to file due to hanging
    await driver.findElement(webdriver.By.id('do-encrypt')).click();
}

module.exports.assertFormIsLocked = async function assertFormIsLocked(driver, isLocked) {
        var lockedStyle = await driver.findElement(webdriver.By.id('locked')).getAttribute("style");
        //console.log(lockedStyle);
        var unlockedStyle = await driver.findElement(webdriver.By.id('unlocked')).getAttribute("style");

        if (isLocked) {
            expect(lockedStyle,"Locked div is hidden").to.be.equal("display: inline;");
            expect(unlockedStyle,"Unlocked div is shown").to.be.equal("display: none;");
        } else {
            expect(lockedStyle,"Locked div is shown").to.be.equal("display: none;");
            expect(unlockedStyle,"Unlocked div is hidden").to.be.equal("display: inline;");
        }
}

module.exports.assertBrowserUnsupportedMessageIsShown = async function assertBrowserUnsupportedMessageIsShown(test, isShown) {
        var unsupportedStyle = await driver.findElement(webdriver.By.id('unsupported')).getAttribute("style");
        
         if (isShown) {
            expect(unsupportedStyle,"Browser unsupported div is hidden").to.be.equal("display: inline;");
        } else {
            expect(unsupportedStyle,"Browser unsupported div is hidden").to.be.equal("display: none;");
        }
    },

module.exports.decryptWith = async function decryptWith(driver, password) {
        await driver.findElement(webdriver.By.id('dec-password')).sendKeys(password);
        await driver.findElement(webdriver.By.id('do-decrypt')).click();
    }

module.exports.setEncryptPass = async function setEncryptPass(driver, password) {
        var encPass = await driver.findElement(webdriver.By.id('enc-password'))
        encPass.clear();
        await encPass.sendKeys(password);
}

module.exports.setCommonOptions = async function setCommonOptions(driver, saveFilename, timeout) {
        await this.openOptions(driver);
        await driver.findElement(webdriver.By.id('opt-save-filename')).sendKeys(saveFilename);
        await driver.findElement(webdriver.By.id('opt-timeout')).sendKeys(timeout);
}
module.exports.sendKeysOptionSaveFilename = async function sendKeysOptionSaveFilename(driver, saveFilename) {
        await this.openOptions(driver);
        await driver.findElement(webdriver.By.id('opt-save-filename')).sendKeys(saveFilename);
}