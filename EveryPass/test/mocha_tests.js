const webdriver = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const logging = require('selenium-webdriver/lib/logging');
const expect  = require("chai").expect;
const assert  = require("chai").assert;
const testSupport = require("./mocha_test_support");


describe('Test Unencryptped Page', function() {
            
    var driver;
    
    before(async function() {   
                     
       this.timeout(30000);
    
       console.log("--- launching headless browser and opening page ---");
              
       driver = await new webdriver.Builder().forBrowser('firefox').build();
       //.setFirefoxOptions(new firefox.Options().headless()
    
       await driver.get(testSupport.TEST_UNENCRYPTED_URL);                                            
    });
    
   after(async function() {
       console.log("------------ closing headless browser -------------");
       await driver.quit();
   });
    
    it('Can verify basic app details.', async function(){                     
                                  
          var title = await driver.getTitle();          
          assert.equal(title, 'EveryPass Password Manager v1.4', 'Password manager homepage title is NOT the one expected');          
    });
    
//    it('Can create a URL based password with, then hide, show and delete it.', async function(){  
//                       
//            await testSupport.addPassword(driver, 'www.consunet.com.au');            
//    });
    
    it('Can create a password, add more details to form without adding, then encrypt it.', async function(){  
        
        this.timeout(30000);
       
        //submit immediately
        await testSupport.addPassword(driver, true);  
        //dont submit yet
        await testSupport.addPassword(driver, false, 'abc');  
                      
        await testSupport.encryptThenSaveToFile(driver, testSupport.TEST_PASSWORD, testSupport.TEST_HINT, "public_html/test_encrypted.html");
                    
    });
    
    it('Can do decrypt of encrypted file.', async function(){  
        
        this.timeout(30000);      
        
        await driver.get(testSupport.TEST_ENCRYPTED_URL); 
        
        var encForm = await driver.findElement(webdriver.By.id('decrypt'));
        await encForm.findElement(webdriver.By.id('dec-password')).sendKeys(testSupport.TEST_PASSWORD);        
        await encForm.findElement(webdriver.By.id('do-decrypt')).click();        
    });
});

