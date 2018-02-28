const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const expect  = require("../../common/node_modules/chai").expect;
const assert  = require("../../common/node_modules/chai").assert;


exports.addNote = async function addNote(driver, message) {
    await driver.findElement(webdriver.By.id('payload')).sendKeys(message);
}

exports.assertNoteText = async function assertNoteText(driver, expectedText) {
        var msg = await driver.executeScript(function() {
            return document.getElementById("payload").value;
        });
        
        //test.assertEqual(msg, expectedText, "Found expected test message: " + expectedText);
        expect(msg,"Couldn't find expected test message: " + expectedText).to.be.equal(expectedText);
}