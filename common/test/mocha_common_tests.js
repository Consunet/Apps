/**
 * @file holds tests common to both apps
 */

const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const expect = require("chai").expect;
const assert = require("chai").assert;
const comsupport = require('./mocha_common_support.js');

describe('Common Testing', function () {

    var driver;

    before(async function () {

        this.timeout(30000);
        console.log("------------ opening headless browser -------------");

        var fxoptions = new firefox.Options()
        fxoptions.setProfile(__dirname + "/firefox_profile")
        fxoptions.setPreference("browser.download.dir", __dirname + "/test_downloads");
        fxoptions.setPreference("browser.download.folderList", 2);
        fxoptions.headless();

        driver = await new webdriver.Builder()
                .forBrowser('firefox')
                .setFirefoxOptions(fxoptions)
                .build();
    });

    after(async function () {

        console.log("------------ closing headless browser -------------");
        await driver.quit();
    });

    afterEach(async function () {
        if (getCoverage) {
            await comsupport.refreshCoverage(driver)
        }
    });

    describe('Common UI function tests', function () {

        it('When bad options are set an error shows.', async function () {

            this.timeout(15000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await comsupport.setCommonOptions(driver, "", "");
            await comsupport.sendKeysOptionSaveFilename(driver, "#$*&Y");
            //test.assertTextExists("Invalid filename", "Bad save filename error exists");
            var textField = await driver.findElement(webdriver.By.id('opt-save-filename-help')).getAttribute("innerHTML");
            expect(textField, "Bad save filename error doesn't exist").to.include("Invalid filename, using default");
        });

        it('Can set timeout to 99 and then 0.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await comsupport.setCommonOptions(driver, "", "99");
            var timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
            expect(timeoutVal).to.be.equal('99');

            await comsupport.setCommonOptions(driver, "", "0");
            timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
            expect(timeoutVal).to.be.equal('0');
        });

        it('Cannot put bad data into timeout option.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await comsupport.setCommonOptions(driver, "", "0");
            var timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
            expect(timeoutVal).to.be.equal('0');
            await new Promise(resolve => setTimeout(resolve, 1000)); //sleep for 1s to ensure decrement runs at 0

            await comsupport.setCommonOptions(driver, "", "99");
            timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
            expect(timeoutVal).to.be.equal('99');

            await comsupport.setCommonOptions(driver, "", "!.>/Abc111");
            timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
            expect(timeoutVal).to.be.equal('111');
        });

        it('Help can be closed and re-opened.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //open by default expected
            await comsupport.assertHelpIsShown(driver, true);

            //close help
            var helpBox = await driver.findElement(webdriver.By.id('help-screen')) //since multiple close class, we define inside help
            await helpBox.findElement(webdriver.By.className('close')).click(); //closes help box

            await comsupport.assertHelpIsShown(driver, false);

            //open help
            await driver.findElement(webdriver.By.id('menu-button')).click();
            await driver.findElement(webdriver.By.id('menu-about')).click();

            await comsupport.assertHelpIsShown(driver, true);
        });

        it('If help closed, it will reset after encrypt.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await comsupport.assertHelpIsShown(driver, true);

            var helpBox = await driver.findElement(webdriver.By.id('help-screen')) //since multiple close class, we define inside help
            await helpBox.findElement(webdriver.By.className('close')).click(); //closes help box

            await comsupport.assertHelpIsShown(driver, false);

            await comsupport.encryptWith(driver, testVars.TEST_PASSWORD, testVars.TEST_HINT);

            var helpText = await helpBox.getAttribute("innerHTML");
            assert.include(helpText, " is free to use, open source, free from app stores and compatible with most modern devices (computers, tablets, phones).", 'Description exists');

            await driver.executeScript(async function () { 
                SCA.toggleHelpDetail();
            });

            await comsupport.assertHelpIsShown(driver, true);
        });

        it('Can see various password strengths', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await comsupport.setEncryptPass(driver, "asd");
            //test.assertTextExists("Password: Weak", "Weak password detected");
            var textField = await driver.findElement(webdriver.By.id("enc-password-fb")).getAttribute("innerHTML");
            expect(textField, "Weak password not detected").to.be.equal("Password: Weak");

            await comsupport.setEncryptPass(driver, "asdasdasd1234");
            //test.assertTextExists("Password: OK", "OK password detected");
            textField = await driver.findElement(webdriver.By.id("enc-password-fb")).getAttribute("innerHTML");
            expect(textField, "OK password not detected").to.be.equal("Password: OK");

            await comsupport.setEncryptPass(driver, "ASDASDASD1234");
            //test.assertTextExists("Password: OK", "OK password detected");
            textField = await driver.findElement(webdriver.By.id("enc-password-fb")).getAttribute("innerHTML");
            expect(textField, "OK password not detected").to.be.equal("Password: OK");

            await comsupport.setEncryptPass(driver, "asdAsdAsd1234546789123!*");
            //test.assertTextExists("Password: Strong", "Strong password detected");
            textField = await driver.findElement(webdriver.By.id("enc-password-fb")).getAttribute("innerHTML");
            expect(textField, "Strong password not detected").to.be.equal("Password: Strong");
        });
    });


    describe('Common encryption and decryption tests', function () {

        //uses encrypted
        it('Can verify basic encrypted data details.', async function () {

            this.timeout(10000);

            //use fresh TEST_ENCRYPTED_URL
            await driver.get(testVars.TEST_ENCRYPTED_URL);
            
            await comsupport.assertFormIsLocked(driver, true);
            var doctype = await driver.executeScript(function () {
                return document.doctype.name;
            });

            expect(doctype, "Doctype is not present").to.be.equal("html");
        });


        it('Error returned when wrong decrypt password entered.', async function () {

            this.timeout(10000);

            //use fresh TEST_ENCRYPTED_URL
            await driver.get(testVars.TEST_ENCRYPTED_URL);
            await comsupport.decryptWith(driver, "wrongpassword");

            var textField = await driver.findElement(webdriver.By.id('dec-hint')).getAttribute("innerHTML");
            expect(textField, "Hint doesn't exist").to.be.equal(testVars.TEST_HINT);

            var textField = await driver.findElement(webdriver.By.id('dec-password-help')).getAttribute("innerHTML");
            expect(textField, "Bad password error doesn't exist").to.be.equal("Incorrect password, or data has been corrupted");
        });
    });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}