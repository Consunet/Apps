
const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const expect  = require("../../common/node_modules/chai").expect;
const assert  = require("../../common/node_modules/chai").assert;
const support = require('./mocha_test_support.js');
const comsupport = require('../../common/test/mocha_common_support.js');


describe('EveryPass Specific Testing', function() {
            
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
        assert.equal(title, 'EveryPass Password Manager v1.4', 'Password manager homepage title is NOT the one expected');
        var help = await driver.findElement(webdriver.By.id('help-screen'));
        var helpText = await help.getAttribute("innerHTML");
        assert.include(helpText,"is a Password Manager",'Description exists') 
   });
    
  
   it('Can create a URL based password with, then hide, show and delete it.', async function(){  
        
        //sets test timeout to 10s
        this.timeout(10000);
       
        //refresh the driver
        await comsupport.refreshCoverage(driver);
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        //getTestData();
        var data = support.getTestData("www.consunet.com.au");

	await support.addPassword(driver, true, data);
        var id = 'p0';
        var p0 = await driver.findElement(webdriver.By.id(id + '-form'));
        //assertPasswordBodyHidden()
        await support.assertPasswordBodyHidden(driver,id);

        //togglePwd()
        await support.togglePwd(driver,id)

        //assertPasswordBodyShown()
        await support.assertPasswordBodyShown(driver,id);
          
        //verifyDataMatches()
        await support.verifyDataMatches(driver,id,data);
        //togglePwd()
	await support.togglePwd(driver,id)
        //assertPasswordBodyHidden()
        await support.assertPasswordBodyHidden(driver,id);
        //openOptions true = click confirm delete
        await comsupport.openOptions(driver,true);
        //delPwd()
        await support.delPwd(driver,id);
        //assertPasswordNotExists()
        await support.assertPasswordNotExists(driver,id);
    });
    
    it('Can create multiple passwords and search for them case-insensitively.', async function(){
    	
         //sets test timeout to 10s
        this.timeout(10000);
        
        //refresh the driver
        await comsupport.refreshCoverage(driver);
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

    	var p0 = support.getTestData("ABc");
    	var p1 = support.getTestData("def");
    	var p2 = support.getTestData("ghi");
    	var p3 = support.getTestData("jkl");
    	var p4 = support.getTestData("abcd");

    	await support.addPassword(driver, true, p0);
    	await support.addPassword(driver, true, p1);
    	await support.addPassword(driver, true, p2);
    	await support.addPassword(driver, true, p3);
    	await support.addPassword(driver, true, p4);

    	await support.search(driver,"a");
    	//decrease all numbers by 1 if reset per test
    	await support.assertPasswordBodyHidden(driver,'p0');
    	await support.assertPasswordBodyHidden(driver,'p1');
    	await support.assertPasswordBodyHidden(driver,'p2');
    	await support.assertPasswordBodyHidden(driver,'p3');
    	await support.assertPasswordBodyHidden(driver,'p4');

    	await support.search(driver,"b");
    	//decrease all numbers by 1 if reset per test
    	await support.assertPasswordBodyHidden(driver,'p0');
    	await support.assertPasswordHidden(driver,'p1');
    	await support.assertPasswordHidden(driver,'p2');
    	await support.assertPasswordHidden(driver,'p3');
    	await support.assertPasswordBodyHidden(driver,'p4');

    	await support.search(driver,"c");
    	//decrease all numbers by 1 if reset per test
    	await support.assertPasswordBodyHidden(driver,'p0');
    	await support.assertPasswordBodyHidden(driver,'p4');

    	await support.search(driver,"d");
    	//decrease all numbers by 1 if reset per test
    	await support.assertPasswordBodyShown(driver,'p4');
    	await support.verifyDataMatches(driver,'p4',p4);

    	await support.search(driver,"a", true);
    	//decrease all numbers by 1 if reset per test
    	await support.assertPasswordBodyHidden(driver,'p0');
    	await support.assertPasswordBodyHidden(driver,'p1');
    	await support.assertPasswordBodyHidden(driver,'p2');
    	await support.assertPasswordBodyHidden(driver,'p3');
    	await support.assertPasswordBodyHidden(driver,'p4');
    });
  
     
   it('Can create a password, add more details to form without adding, then encrypt it.', async function(){  
        
        this.timeout(10000);
       
        await comsupport.refreshCoverage(driver);
        await driver.get(testVars.TEST_UNENCRYPTED_URL);
       
        var id = 'p0';
       
        //submit immediately
        await support.addPassword(driver, true, support.getTestData());  
        //dont submit yet
        await support.addPassword(driver, false, support.getTestData('abc'));  
                      
        await comsupport.encryptWith(driver, testVars.TEST_PASSWORD, testVars.TEST_HINT, "public_html/en/test_encrypted.html");
       
        await support.assertPasswordNotExists(driver, id);
       
    });
    
    
    it('Does not import bad EveryPass data.', async function(){
    	
        //sets test timeout to 10s
        this.timeout(10000);
        
        //refresh the driver
        await comsupport.refreshCoverage(driver);
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        await driver.executeScript(async function() {
            var badText = '<meta name="sca-app-type" content="EveryPass">' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":100,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","iv":"3/fid049KhK4Yw/tGhRUGw==","salt":"yQVb651u3aY=","adata":"YSBh","ct":"SPTYJPHQEeE7kcsbTAUgugd+CZ6IaNIc7YXI1WvmcidiOz2dJ9/tn6DkvFBqlBFwPFvFhD5ganzdVeWA6H8Rytu94YbTCGBXzawVV+FFnRjGok53EQ6+I9uRCin95b3Lu4MSd2z+5Y1zAx3+xt5nVe0="};</script>';
            SCA.processImportedFileText(badText); 
        });
        
        await driver.wait(webdriver.until.alertIsPresent())
        await driver.switchTo().alert().accept();
        
        await comsupport.assertFormIsLocked(driver, false);
    });
    
    
    it('Does import good EveryPass data.', async function(){
    	
        //sets test timeout to 10s
        this.timeout(10000);
        
        //refresh the driver
        await comsupport.refreshCoverage(driver);
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

    	await driver.executeScript(function() {
            var goodText = '<meta name="sca-app-type" content="EveryPass" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"9crMqEZL+3I=","iv":"xPZr3cdl6FzORmsbajidRA==","adata":"YQ==","ct":"szz3oOygcA5dq885EWFZSJaCAP8YbJckeDRGlCgn1F5i529fnqFSJvxGaMfVy9nisZ967zgvr52rBA=="};</script>';
            SCA.processImportedFileText(goodText);
        });

        await comsupport.assertFormIsLocked(driver, true);
    });
    
    
    it('Can do decrypt of encrypted file.', async function(){  
        
        this.timeout(10000);      
        
        await comsupport.refreshCoverage(driver);
        await driver.get(testVars.TEST_ENCRYPTED_URL); 
        
        //check for hint
        var hintVal = await driver.findElements(webdriver.By.xpath("//*[text()[contains(.,'"+testVars.TEST_HINT+"')]]"));
        expect(hintVal,"Hint doesn't exist").to.not.be.empty;
        
        //perform decrypt
        var encForm = await driver.findElement(webdriver.By.id('decrypt'));
        await encForm.findElement(webdriver.By.id('dec-password')).sendKeys(testVars.TEST_PASSWORD);        
        await encForm.findElement(webdriver.By.id('do-decrypt')).click();   
                        
        await comsupport.assertBrowserUnsupportedMessageIsShown(driver, false);
        
        var id = 'p0';
        await support.assertPasswordBodyHidden(driver, id);
        
        await support.togglePwd(driver, id);
        await support.assertPasswordBodyShown(driver, id);
        await support.verifyDataMatches(driver, id, support.getTestData());
        
        id = 'p1';
        await support.assertPasswordBodyHidden(driver, id);
        await support.togglePwd(driver, id);
        await support.assertPasswordBodyShown(driver, id);
        await support.verifyDataMatches(driver, id, support.getTestData("abc"));               
    });
});

