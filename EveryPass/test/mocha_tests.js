const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const expect  = require("chai").expect;
const assert  = require("chai").assert;


/**
 * EveryPass global parameters
 */
var BASE_URL = "http://localhost:8000/public_html/";
var TEST_UNENCRYPTED_URL = BASE_URL + "en/index.html";
var TEST_ENCRYPTED_URL = BASE_URL + "test_encrypted.html";
var TEST_IMPORTED_URL = BASE_URL + "test_imported.html";
var TEST_PASSWORD = "password";
var TEST_HINT = "hint value";

//var supportStuff = require("./mocha_test_support").CPASS_TEST;


describe('Test Unencryptped Page', function() {
            
    var driver;
    
    before(async function() {   
           
       this.timeout(30000);
    
       console.log("--- launching headless browser and opening page ---");
              
       driver = await new webdriver.Builder().forBrowser('firefox').build();
       //.setFirefoxOptions(new firefox.Options().headless()
    
       await driver.get(TEST_UNENCRYPTED_URL);                                            
    });
    
   after(async function() {
       console.log("------------ closing headless browser -------------");
       await driver.quit();
   });
    
    it('Can verify basic app details.', async function(){                     
        
          //CPASS_TEST.testSupportFunction();
        
          var title = await driver.getTitle();          
          assert.equal(title, 'EveryPass Password Manager v1.4', 'Password manager homepage title is NOT the one expected');          
    });
    
    it('Can fill new entry', async function(){  
                   
          var searchForm = await driver.findElement(webdriver.By.id('new-entry'));
          await searchForm.findElement(webdriver.By.id('new-service')).sendKeys('www.consunet.com.au');
          await searchForm.findElement(webdriver.By.id('generate-pwd')).click();    
    });
});

