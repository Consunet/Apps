/**
 * Holds tests common to both apps
 */
const webdriver = require('../../EveryPass/node_modules/selenium-webdriver');
const firefox = require('../../EveryPass/node_modules/selenium-webdriver/firefox');
const expect  = require("../../EveryPass/node_modules/chai").expect;
const assert  = require("../../EveryPass/node_modules/chai").assert;
const until = require("../../EveryPass/node_modules/selenium-webdriver").until;
//const SCA = require("../src/common.js")
const comsupport = require('./mocha_common_support.js');

var BASE_URL = "http://localhost:8000/public_html/";
var TEST_UNENCRYPTED_URL = BASE_URL + "en/index.html";
var TEST_ENCRYPTED_URL = BASE_URL + "test_encrypted.html";
var TEST_IMPORTED_URL = BASE_URL + "test_imported.html";
var TEST_PASSWORD = "password";
var TEST_HINT = "hint value";

describe('Common Testing', function() {
            
    var driver;
    
    before(async function() {   
           
       this.timeout(30000);
       console.log("--- launching headless browser and opening page ---");
              
        driver = await new webdriver.Builder()
        .forBrowser('firefox')
        //.setFirefoxOptions(new firefox.Options().headless())
        .build();

        await driver.get(TEST_UNENCRYPTED_URL);                                        
    });

   after(async function() {
       console.log("------------ closing headless browser -------------");
       await driver.quit();
   });

    it('Can see various password strengths', async function(){                     
        await comsupport.setEncryptPass(driver, "asd");
        //test.assertTextExists("Password: Weak", "Weak password detected");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Password: Weak"+"')]]"));
        await expect(textField,"Weak password not detected").to.not.be.empty;
    
        await comsupport.setEncryptPass(driver, "asdasdasd1234");
        //test.assertTextExists("Password: OK", "OK password detected");
        textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Password: OK"+"')]]"));
        await expect(textField,"OK password not detected").to.not.be.empty;

        await comsupport.setEncryptPass(driver, "asdasdasd1234546789123");
        //test.assertTextExists("Password: OK", "OK password detected");
        textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Password: Strong"+"')]]"));
        await expect(textField,"Strong password not detected").to.not.be.empty;
    });
    it('When bad options are set an error shows.', async function(){
        //refresh the driver
        await driver.get(TEST_UNENCRYPTED_URL);                     
        await comsupport.setCommonOptions(driver, "", "");
        await comsupport.sendKeysOptionSaveFilename(driver, "#$*&Y");
        //test.assertTextExists("Invalid filename", "Bad save filename error exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Invalid filename"+"')]]"));
        await expect(textField,"Bad save filename error doesn't exist").to.not.be.empty;
    });
    //uses encrypted
    it('Can verify basic encrypted data details.', async function(){                     
        //use fresh TEST_ENCRYPTED_URL
        await driver.get(TEST_ENCRYPTED_URL);
        await comsupport.assertFormIsLocked(driver,true);
        var doctype = await driver.executeScript(function() {
            return document.doctype.name;
        });
        
        expect(doctype,"Doctype is not present").to.be.equal("html");
    });
    it('Error returned when wrong decrypt password entered.', async function(){                     
        //use fresh TEST_ENCRYPTED_URL
        await driver.get(TEST_ENCRYPTED_URL);
        comsupport.decryptWith(driver, "wrongpassword");
        //test.assertTextExists(TEST_HINT, "Hint exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+TEST_HINT+"')]]"));
        await expect(textField,"Hint doesn't exist").to.not.be.empty;
        //test.assertTextExists("Incorrect password, or data has been corrupted", "Bad password error exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Incorrect password, or data has been corrupted"+"')]]"));
        await expect(textField,"Bad password error doesn't exists").to.not.be.empty;
    });
});