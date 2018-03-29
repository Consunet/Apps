/**
 * @file browser interface functions to support specific testing for EveryPass application
 */

const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const expect = require("../../common/node_modules/chai").expect;
const assert = require("../../common/node_modules/chai").assert;
const comsupport = require('../../common/test/mocha_common_support.js');

exports.getTestData = function (service, username, password, question, answer) {
    service = service || 'test service';
    username = username || 'test username';
    password = password || 'test password';
    question = question || 'test question';
    answer = answer || 'test answer';
    data = {
        service,
        username,
        password,
        question,
        answer
    };

    return data;
}

exports.addPassword = async function (driver, doClickAdd, data) {
    data = data || this.getTestData();
    var searchForm = await driver.findElement(webdriver.By.id('new-entry'));

    await searchForm.findElement(webdriver.By.id('new-service')).sendKeys(data.service);
    await searchForm.findElement(webdriver.By.id('new-username')).sendKeys(data.username);
    await searchForm.findElement(webdriver.By.id('new-password')).sendKeys(data.password);
    await searchForm.findElement(webdriver.By.id('new-question')).sendKeys(data.question);
    await searchForm.findElement(webdriver.By.id('new-answer')).sendKeys(data.answer);

    if (doClickAdd)
    {
        await searchForm.findElement(webdriver.By.id('add-new-pwd')).click();
    }
}

exports.addGroup = async function (driver, name) {

    var searchForm = await driver.findElement(webdriver.By.id('new-group'));

    await searchForm.findElement(webdriver.By.id('new-group-name')).sendKeys(name);

    await searchForm.findElement(webdriver.By.id('add-new-group')).click();
}

exports.toggleShowBody = async function (driver, id) {
    await driver.findElement(webdriver.By.id(id + '-toggle')).click();
}

exports.toggleDefaultGrp = async function (driver, id) {    
    await driver.findElement(webdriver.By.id(id + '-setdefault')).click();
}

exports.assertPasswordHidden = async function (driver, id) {
    var passwordDisplayed = await driver.findElement(webdriver.By.id(id + '-service')).isDisplayed();
    expect(passwordDisplayed, "Password is shown for " + id).to.equal(false);
}

exports.assertPasswordShown = async function (driver, id) {
    var passwordDisplayed = await driver.findElement(webdriver.By.id(id + '-service')).isDisplayed();
    expect(passwordDisplayed, "Password is hidden for " + id).to.equal(true);
}

exports.assertPasswordBodyHidden = async function (driver, id, grp) {
    await this.assertPasswordExists(driver, id, grp);
    //assertVisable(service)
    var serviceDisplayed = await driver.findElement(webdriver.By.id(id + '-service')).isDisplayed();
    expect(serviceDisplayed, "Service is hidden for " + id).to.equal(true);
    //assertNotVisable()
    var usernameDisplayed = await driver.findElement(webdriver.By.id(id + '-username')).isDisplayed();
    expect(usernameDisplayed, "Username is shown for " + id).to.equal(false);

    var passwordDisplayed = await driver.findElement(webdriver.By.id(id + '-password')).isDisplayed();
    expect(passwordDisplayed, "Password is shown for " + id).to.equal(false);

    var questionDisplayed = await driver.findElement(webdriver.By.id(id + '-question')).isDisplayed();
    expect(questionDisplayed, "Question is shown for " + id).to.equal(false);

    var answerDisplayed = await driver.findElement(webdriver.By.id(id + '-answer')).isDisplayed();
    expect(answerDisplayed, "Answer is shown for " + id).to.equal(false);
}

exports.assertPasswordBodyShown = async function (driver, id, grp) {
    await this.assertPasswordExists(driver, id, grp);
    //assertVisable(service)
    var serviceDisplayed = await driver.findElement(webdriver.By.id(id + '-service')).isDisplayed();
    expect(serviceDisplayed, "Service is hidden for " + id).to.equal(true);

    var usernameDisplayed = await driver.findElement(webdriver.By.id(id + '-username')).isDisplayed();
    expect(usernameDisplayed, "Username is hidden for " + id).to.equal(true);

    var passwordDisplayed = await driver.findElement(webdriver.By.id(id + '-password')).isDisplayed();
    expect(passwordDisplayed, "Password is hidden for " + id).to.equal(true);

    var questionDisplayed = await driver.findElement(webdriver.By.id(id + '-question')).isDisplayed();
    expect(questionDisplayed, "Question is hidden for " + id).to.equal(true);

    var answerDisplayed = await driver.findElement(webdriver.By.id(id + '-answer')).isDisplayed();
    expect(answerDisplayed, "Answer is hidden for " + id).to.equal(true);
}

exports.assertGroupBodyHidden = async function (driver, id) {
    var passwordDisplayed = await driver.findElement(webdriver.By.id(id + '-pwds')).isDisplayed();
    expect(passwordDisplayed, "Password is shown for " + id).to.equal(false);
}

exports.assertGroupBodyShown = async function (driver, id) {
    var passwordDisplayed = await driver.findElement(webdriver.By.id(id + '-pwds')).isDisplayed();
    expect(passwordDisplayed, "Password is hidden for " + id).to.equal(true);
}

exports.assertPasswordNotExists = async function (driver, id, grp) {

    var searchDomain;

    if (grp)
    {
        searchDomain = await driver.findElement(webdriver.By.id(grp + '-pwds'));
    } else
    {
        searchDomain = await driver.findElement(webdriver.By.id('pwds'));
    }

    var password = await searchDomain.findElements(webdriver.By.id(id + '-password'));
    expect(password, "Password entry is found for " + id).to.be.empty;
}

exports.assertPasswordExists = async function (driver, id, grp) {

    var searchDomain;

    if (grp)
    {
        searchDomain = await driver.findElement(webdriver.By.id(grp + '-pwds'));
    } else
    {
        searchDomain = await driver.findElement(webdriver.By.id('pwds'));
    }

    var password = await searchDomain.findElements(webdriver.By.id(id + '-password'));
    expect(password, "Password entry is not found for " + id).to.not.be.empty;
}

exports.assertGroupNotExists = async function (driver, id) {

    var password = await driver.findElements(webdriver.By.id(id));
    expect(password, "Password entry is found for " + id).to.be.empty;
}

exports.assertGroupExists = async function (driver, id) {

    var password = await driver.findElements(webdriver.By.id(id));
    expect(password, "Password entry is not found for " + id).to.not.be.empty;
}

exports.verifyDataMatches = async function (driver, id, data) {
    serviceVal = await driver.findElement(webdriver.By.id(id + '-service')).getAttribute("value");
    expect(serviceVal, "Service data does not match expected." + id).to.equal(data.service);
    //username
    usernameVal = await driver.findElement(webdriver.By.id(id + '-username')).getAttribute("value");
    expect(usernameVal, "Username data does not match expected." + id).to.equal(data.username);
    //password
    passwordVal = await driver.findElement(webdriver.By.id(id + '-password')).getAttribute("value");
    expect(passwordVal, "Password data does not match expected." + id).to.equal(data.password);
    //question
    questionVal = await driver.findElement(webdriver.By.id(id + '-question')).getAttribute("value");
    expect(questionVal, "Question data does not match expected." + id).to.equal(data.question);
    //answer
    answerVal = await driver.findElement(webdriver.By.id(id + '-answer')).getAttribute("value");
    expect(answerVal, "Answer data does not match expected." + id).to.equal(data.answer);
}

exports.delItem = async function (driver, id) {
    await driver.findElement(webdriver.By.id(id + '-delete')).click();
}

exports.search = async function (driver, text, reset) {
    var searchBar = await driver.findElement(webdriver.By.id('search'))
    if (reset) {
        await searchBar.clear();
    }
    await searchBar.sendKeys(text);
}

exports.setExtendedOptions = async function (driver, isConfirmDelete, isKeepDeletedGrpPwds) {

    await comsupport.openOptions(driver);

    var currentOpt_isConfirmDelete = await driver.findElement(webdriver.By.id('opt-confirm-del')).isSelected();

    if (isConfirmDelete != currentOpt_isConfirmDelete) {
        //deselect
        await driver.findElement(webdriver.By.id('opt-confirm-del')).click();
    }

    var currentOpt_isKeepDeletedGrpPwds = await driver.findElement(webdriver.By.id('opt-keep-grp-pwds')).isSelected();

    if (isKeepDeletedGrpPwds != currentOpt_isKeepDeletedGrpPwds) {
        //deselect
        await driver.findElement(webdriver.By.id('opt-keep-grp-pwds')).click();
    }
}

