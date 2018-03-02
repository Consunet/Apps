const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const expect  = require("../../common/node_modules/chai").expect;
const assert  = require("../../common/node_modules/chai").assert;
const until = require("../../common/node_modules/selenium-webdriver").until;
const support = require('./mocha_test_support.js');
const comsupport = require('../../common/test/mocha_common_support.js');


describe('WhisperNote Testing', function() {
            
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
       
       await comsupport.refreshCoverage(driver);
       
       console.log("------------ closing headless browser -------------");
       await driver.quit();
   });
    
    it('Can verify basic app details.', async function(){                     
        
        this.timeout(10000);
        
        await driver.get(testVars.TEST_UNENCRYPTED_URL); 
        
        var title = await driver.getTitle();          
        assert.equal(title, 'WhisperNote Encrypted Note v1.4', 'WhisperNote homepage title is NOT the one expected');
        var help = await driver.findElement(webdriver.By.id('help-screen'));
        var helpText = await help.getAttribute("innerHTML");
        assert.include(helpText,"is a portable encrypted message container.",'Description exists')   
    });
    
    it('Can create a note without an attachment, then encrypt it.', async function(){ 

      //sets test timeout to 10s
      this.timeout(10000);
      
      await support.addNote(driver, testVars.TEST_MESSAGE);
      
        // Do encrypt
      await comsupport.encryptWith(driver, testVars.TEST_PASSWORD, testVars.TEST_HINT, "public_html/test_encrypted.html");
      // Note should be deleted on encryption
      await support.assertNoteText(driver, '');
    });

    //The test 'Can verify basic encrypted data details.' is done in common test already. Was not brought over from casper.

    it('Does not import bad WhisperNote data.', async function(){
      
      //sets test timeout to 10s
      this.timeout(10000);
      
      //refresh the driver
      await comsupport.refreshCoverage(driver);
      await driver.get(testVars.TEST_UNENCRYPTED_URL);
      
      await driver.executeScript(async function() {
          var badText = '<meta name="sca-app-type" content="WhisperNote">' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":100,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","iv":"3/fid049KhK4Yw/tGhRUGw==","salt":"yQVb651u3aY=","adata":"YSBh","ct":"SPTYJPHQEeE7kcsbTAUgugd+CZ6IaNIc7YXI1WvmcidiOz2dJ9/tn6DkvFBqlBFwPFvFhD5ganzdVeWA6H8Rytu94YbTCGBXzawVV+FFnRjGok53EQ6+I9uRCin95b3Lu4MSd2z+5Y1zAx3+xt5nVe0="};</script>';
          SCA.processImportedFileText(badText); 
      });
      
      await driver.wait(webdriver.until.alertIsPresent())
      await driver.switchTo().alert().accept();
      await comsupport.assertFormIsLocked(driver, false);
    });

    it('Does import good WhisperNote data.', async function(){
      
      //sets test timeout to 10s
      this.timeout(10000);
        
      //refresh the driver
      await comsupport.refreshCoverage(driver);
      await driver.get(testVars.TEST_UNENCRYPTED_URL);
        
      await driver.executeScript(function() {
          var goodText = '<meta name="sca-app-type" content="WhisperNote" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"9crMqEZL+3I=","iv":"xPZr3cdl6FzORmsbajidRA==","adata":"YQ==","ct":"szz3oOygcA5dq885EWFZSJaCAP8YbJckeDRGlCgn1F5i529fnqFSJvxGaMfVy9nisZ967zgvr52rBA=="};</script>';
          SCA.processImportedFileText(goodText);
      });
      
      await comsupport.assertFormIsLocked(driver, true);
    });

it('Can do decrypt of encrypted file.', async function(){
    
        this.timeout(10000);
    
        //use fresh TEST_ENCRYPTED_URL
        await comsupport.refreshCoverage(driver);
        await driver.get(testVars.TEST_ENCRYPTED_URL);
        
        await comsupport.decryptWith(driver, "password")
      
        await comsupport.assertBrowserUnsupportedMessageIsShown(driver, false);

        // Reveal the decrypted message
        await support.assertNoteText(driver, testVars.TEST_MESSAGE);      
    });

});