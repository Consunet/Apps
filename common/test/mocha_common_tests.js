/**
 * Holds tests common to both apps
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

        driver = await new webdriver.Builder()
                .forBrowser('firefox')
                .setFirefoxOptions(new firefox.Options().headless())
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

    it('Can see various password strengths', async function () {

        this.timeout(10000);

        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        await comsupport.setEncryptPass(driver, "asd");
        //test.assertTextExists("Password: Weak", "Weak password detected");
        textField = await driver.findElement(webdriver.By.id("enc-password-fb")).getAttribute("innerHTML");
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

    it('When bad options are set an error shows.', async function () {

        this.timeout(10000);

        //refresh the driver
           
        await driver.get(testVars.TEST_UNENCRYPTED_URL);
        await comsupport.setCommonOptions(driver, "", "");
        await comsupport.sendKeysOptionSaveFilename(driver, "#$*&Y");
        //test.assertTextExists("Invalid filename", "Bad save filename error exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'" + "Invalid filename" + "')]]"));
        expect(textField, "Bad save filename error doesn't exist").to.not.be.empty;
    });

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
        //test.assertTextExists(TEST_HINT, "Hint exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'" + testVars.TEST_HINT + "')]]"));
        expect(textField, "Hint doesn't exist").to.not.be.empty;
        //test.assertTextExists("Incorrect password, or data has been corrupted", "Bad password error exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'" + "Incorrect password, or data has been corrupted" + "')]]"));
        expect(textField, "Bad password error doesn't exists").to.not.be.empty;
    });
    
    it('If help closed, it will reset after encrypt.', async function () {

        //sets test timeout to 10s
        this.timeout(10000);

        //refresh the driver
        await driver.get(testVars.TEST_UNENCRYPTED_URL);
        var helpBox = await driver.findElement(webdriver.By.id('help-screen')) //since multiple close class, we define inside help
        await helpBox.findElement(webdriver.By.className('close')).click(); //closes help box
        await comsupport.encryptWith(driver, testVars.TEST_PASSWORD, testVars.TEST_HINT, "public_html/test_clean.html");
        var helpText = await helpBox.getAttribute("innerHTML");
        assert.include(helpText, " is free to use, open source, free from app stores and compatible with most modern devices (computers, tablets, phones).", 'Description exists');

        await driver.executeScript(async function () { //await driver.findElement(webdriver.By.id('help-toggle')).click(); wasnt working.
            SCA.toggleHelpDetail();
        });
        var helpMoreText = await helpBox.getAttribute("innerHTML");
        assert.include(helpMoreText, "uses your browser as the execution environment, you probably use your browser for your banking too", 'More Description exists');

    });

    it('Cannot put bad data into timeout option.', async function () {

        //sets test timeout to 10s
        this.timeout(10000);

        //refresh the driver
        await driver.get(testVars.TEST_ENCRYPTED_URL);
        await comsupport.decryptWith(driver, "password");

        await comsupport.setCommonOptions(driver, "", "0");
        timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
        expect(timeoutVal).to.be.equal('0');

        await comsupport.setCommonOptions(driver, "", "!.>/AsYeYwofLijsMAdOp111");
        timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
        expect(timeoutVal).to.be.equal('111');
    });
    
    it('Help can be closed and re-opened.', async function(){ 

      //sets test timeout to 10s
      this.timeout(10000);

      //refresh the driver
      await driver.get(testVars.TEST_UNENCRYPTED_URL);

      //close help
      var helpBox = await driver.findElement(webdriver.By.id('help-screen')) //since multiple close class, we define inside help
      await helpBox.findElement(webdriver.By.className('close')).click(); //closes help box

      //open help
      await driver.findElement(webdriver.By.id('menu-button')).click();
      await driver.findElement(webdriver.By.id('menu-about')).click();
    });
    
});