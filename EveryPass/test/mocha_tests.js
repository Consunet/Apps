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

describe('Test Unencryptped Page', function() {
    
    var driver;
    
    before(function(done) {
        
        this.timeout(30000);
    
       console.log("--- launching headless browser and opening page ---");
              
       driver = new webdriver.Builder()
       .forBrowser('firefox')
       //.setFirefoxOptions(new firefox.Options().headless())
       .build();
    
        driver.get(TEST_UNENCRYPTED_URL).then(function() {                                     
            done();
        });    
    });
    
   after(function() {
       console.log("------------ closing headless browser -------------");
       driver.quit();
   });
    
    it('Can verify basic app details.', function(done){                      
      
        driver.getTitle().then(function(title) {
            try
            {
                assert.equal(title, 'EveryPass Password Manager v1.4', 'Password manager homepage title is NOT the one expected'); 
                                                             
                done();
            }
            catch(e)
            {
                done(e);
            }
        });                       
    });
    
    it('Can fill new entry', function(done){  
        var searchForm = driver.findElement(webdriver.By.id('new-entry'));
        var siteInputBox = searchForm.findElement(webdriver.By.id('new-service'));
        siteInputBox.sendKeys('www.consunet.com.au')   
        .then(function() {       
            siteInputBox.getAttribute('value').then(function(val) {                                
                var generatePwdButton = searchForm.findElement(webdriver.By.id('generate-pwd'));              
                generatePwdButton.click()
                .then(function() {
                    done();
                });                
            });
        });    
    });
});
