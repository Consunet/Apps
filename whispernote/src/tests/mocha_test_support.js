/**
 * @file browser interface functions to support specific testing for WhisperNote application
 */

const webdriver = require('../../../common/node_modules/selenium-webdriver');
const firefox = require('../../../common/node_modules/selenium-webdriver/firefox');
const expect = require("../../../common/node_modules/chai").expect;
const assert = require("../../../common/node_modules/chai").assert;
const comsupport = require('../../../common/test/mocha_common_support.js');


exports.addNote = async function (driver, message) {
    await driver.findElement(webdriver.By.id('payload')).sendKeys(message);
}

exports.assertNoteText = async function (driver, expectedText) {
    var msg = await driver.executeScript(function () {
        return document.getElementById("payload").value;
    });

    expect(msg, "Couldn't find expected test message: " + expectedText).to.be.equal(expectedText);
}