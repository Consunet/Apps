/**
 * Holds tests common to both apps
 */
const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const expect  = require("chai").expect;
const assert  = require("chai").assert;
const comsupport = require('./mocha_common_support.js');

describe('Common Testing', function() {
            
    var driver;
    
    before(async function() {   
           
       this.timeout(30000);
       console.log("--- launching headless browser and opening page ---");
              
        driver = await new webdriver.Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(new firefox.Options().headless())
        .build();                                           
    });

   after(async function() {
       console.log("------------ closing headless browser -------------");
       await driver.quit();
   });

    it('Can see various password strengths', async function(){                     
        
        this.timeout(10000);
        
        await driver.get(testVars.TEST_UNENCRYPTED_URL);   
        
        await comsupport.setEncryptPass(driver, "asd");
        //test.assertTextExists("Password: Weak", "Weak password detected");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Password: Weak"+"')]]"));
        expect(textField,"Weak password not detected").to.not.be.empty;
    
        await comsupport.setEncryptPass(driver, "asdasdasd1234");
        //test.assertTextExists("Password: OK", "OK password detected");
        textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Password: OK"+"')]]"));
        expect(textField,"OK password not detected").to.not.be.empty;

        await comsupport.setEncryptPass(driver, "asdasdasd1234546789123");
        //test.assertTextExists("Password: OK", "OK password detected");
        textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Password: Strong"+"')]]"));
        expect(textField,"Strong password not detected").to.not.be.empty;
    });
    
    it('When bad options are set an error shows.', async function(){
        
        this.timeout(10000);
        
        //refresh the driver
        await driver.get(testVars.TEST_UNENCRYPTED_URL);                     
        await comsupport.setCommonOptions(driver, "", "");
        await comsupport.sendKeysOptionSaveFilename(driver, "#$*&Y");
        //test.assertTextExists("Invalid filename", "Bad save filename error exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Invalid filename"+"')]]"));
        expect(textField,"Bad save filename error doesn't exist").to.not.be.empty;
    });
    
    //uses encrypted
    it('Can verify basic encrypted data details.', async function(){                     
        
        this.timeout(10000);
        
        //use fresh TEST_ENCRYPTED_URL
        await driver.get(testVars.TEST_ENCRYPTED_URL);
        await comsupport.assertFormIsLocked(driver,true);
        var doctype = await driver.executeScript(function() {
            return document.doctype.name;
        });
        
        expect(doctype,"Doctype is not present").to.be.equal("html");
    });
    
    it('Error returned when wrong decrypt password entered.', async function(){                     
        
        this.timeout(10000);
        
        //use fresh TEST_ENCRYPTED_URL
        await driver.get(testVars.TEST_ENCRYPTED_URL);
        await comsupport.decryptWith(driver, "wrongpassword");
        //test.assertTextExists(TEST_HINT, "Hint exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+testVars.TEST_HINT+"')]]"));
        expect(textField,"Hint doesn't exist").to.not.be.empty;
        //test.assertTextExists("Incorrect password, or data has been corrupted", "Bad password error exists");
        var textField = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+"Incorrect password, or data has been corrupted"+"')]]"));
        expect(textField,"Bad password error doesn't exists").to.not.be.empty;
    });
});