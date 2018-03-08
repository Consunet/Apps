const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const expect = require("../../common/node_modules/chai").expect;
const assert = require("../../common/node_modules/chai").assert;
const until = require("../../common/node_modules/selenium-webdriver").until;
const support = require('./mocha_test_support.js');
const comsupport = require('../../common/test/mocha_common_support.js');


describe('WhisperNote Testing', function () {

    var driver;

    before(async function () {

        this.timeout(30000);
        console.log("------------ opening headless browser -------------");

        var fxoptions = new firefox.Options()
        fxoptions.setProfile(comsupport.commonFullPath()+"/Firefox_profile")
        fxoptions.setPreference("browser.download.dir", __dirname+"/test_downloads"); 
        fxoptions.setPreference("browser.download.folderList",2);
        fxoptions.headless();
              
        driver = await new webdriver.Builder()
                .forBrowser('firefox')
                .setFirefoxOptions(fxoptions)
                .build();
    });

    after(async function () {

        if (getCoverage) {
            await comsupport.refreshCoverage(driver)
        }
        

        console.log("------------ closing headless browser -------------");
        await driver.quit();
    });

    afterEach(async function () {
        if (getCoverage) {
            await comsupport.refreshCoverage(driver)
        }        
    });

    it('Can verify basic app details.', async function () {

        this.timeout(10000);

        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        var title = await driver.getTitle();
        assert.equal(title, 'WhisperNote Encrypted Note v1.4', 'WhisperNote homepage title is NOT the one expected');
        var help = await driver.findElement(webdriver.By.id('help-screen'));
        var helpText = await help.getAttribute("innerHTML");
        assert.include(helpText, "is a portable encrypted message container.", 'Description exists')
    });

    it('Can create a note without an attachment, then encrypt it.', async function () {

        //sets test timeout to 10s
        this.timeout(10000);

        await comsupport.setCommonOptions(driver, "test_encrypted", 2);

        await support.addNote(driver, testVars.TEST_MESSAGE);

        // Do encrypt
        await comsupport.encryptWith(driver, testVars.TEST_PASSWORD, testVars.TEST_HINT);
        
        await sleep(1000);
        
        // Note should be deleted on encryption
        await support.assertNoteText(driver, '');
        
        require('fs').copyFileSync('test/test_downloads/test_encrypted.html', 'public_html/test_encrypted.html');
    });

    //The test 'Can verify basic encrypted data details.' is done in common test already. Was not brought over from casper.

    it('Does not import bad WhisperNote data.', async function () {

        //sets test timeout to 10s
        this.timeout(10000);

            
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        await driver.executeScript(async function () {
            var badText = '<meta name="sca-app-type" content="WhisperNote">' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":100,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","iv":"3/fid049KhK4Yw/tGhRUGw==","salt":"yQVb651u3aY=","adata":"YSBh","ct":"SPTYJPHQEeE7kcsbTAUgugd+CZ6IaNIc7YXI1WvmcidiOz2dJ9/tn6DkvFBqlBFwPFvFhD5ganzdVeWA6H8Rytu94YbTCGBXzawVV+FFnRjGok53EQ6+I9uRCin95b3Lu4MSd2z+5Y1zAx3+xt5nVe0="};</script>';
            SCA.processImportedFileText(badText);
        });

        await driver.wait(webdriver.until.alertIsPresent())
        await driver.switchTo().alert().accept();
        await comsupport.assertFormIsLocked(driver, false);
    });

    it('Does import good WhisperNote data.', async function () {

        //sets test timeout to 10s
        this.timeout(10000);

        //refresh the driver
     
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        await driver.executeScript(function () {
            var goodText = '<meta name="sca-app-type" content="WhisperNote" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"9crMqEZL+3I=","iv":"xPZr3cdl6FzORmsbajidRA==","adata":"YQ==","ct":"szz3oOygcA5dq885EWFZSJaCAP8YbJckeDRGlCgn1F5i529fnqFSJvxGaMfVy9nisZ967zgvr52rBA=="};</script>';
            SCA.processImportedFileText(goodText);
        });

        await comsupport.assertFormIsLocked(driver, true);
    });

    it('Can do decrypt of encrypted file.', async function () {

        this.timeout(10000);

        //use fresh TEST_ENCRYPTED_URL
          
        await driver.get(testVars.TEST_ENCRYPTED_URL);

        await comsupport.decryptWith(driver, "password")

        await comsupport.assertBrowserUnsupportedMessageIsShown(driver, false);

        // Reveal the decrypted message
        await support.assertNoteText(driver, testVars.TEST_MESSAGE);
    });

    it('Does import from version 1.2', async function(){
        
        //sets test timeout to 10s
        this.timeout(10000);
        
        //refresh the driver
         
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        //import v1.2 file
        await driver.executeScript(function() {
            var versionText = '<meta name="sca-app-type" content="WhisperNote"><script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"mLLRPxzIR1k=","iv":"l6AwrZDrQtsow2U2BeyNxw==","adata":"dGVzdA==","ct":"AumEPkqVM2EcOQGdxbLokkJB6wzAxqwLj5RdjA==","cattname":"DOQEfyFgo4Uzlo3D8drnMw3Skqc2eIRjeg==","catt":["GU6KGhuWtK/4/v48z8/cvHuyQCmCFjclL12u/p5H2Md4ofww4HvhrWF3IiEf8yc5KDq90tBp1522juCLR5+5RrylAkriM79t/jSs0FJS95ZobGU2Ha9LRlQdse3aOBiSPV1l3rjZEXWJiUoUE0tfkb3CpJC4Z1J0zSX6/miGAbbnR3dyOGwmKQiC92KZrkg7UqrYg9NcuKNjj9PoNRfRyR+cf2HxV5kZfPX60DCiNnPtX+nWYvRQesiYw4EAKb0voALo0IpQCDigJiQ7tfkRmuf3O3Tti4/jBTV3Pabwf1t8gt8uK0/X8jg8Xk4g4oNPEjI2h6SlESi3HSfubgy2GDtjzFT+1Z/jyBKBk6GOjjVrH2KsR5XfTqZm0HD+pkKureqsDVYWIw8y+Tys2L5j2LIOHGWU1k3bSxN0JWz8lG5bAEEZJzlIUsuZhMyZk6Syji7MGvWEzPJZpS0NPmJSwYPtlZe4NxP6OnG9OeEF/AAg5IP/xZ3KNjbelSNPK9Ti+3+Wnne2ipgEH9j63ShPj1Vj67mEKQd9pXuJRuYegeJwtyKXxg6hs0A6alcbubd2Ty6AZbE8+jo2cfot3ePv28t875AH+qNMCY2iaik2dPmDFFwMwBNVvttFr77ojQ=="]};</script>';
            SCA.processImportedFileText(versionText);
        });

        await comsupport.assertFormIsLocked(driver, true);

        var decHint = await driver.findElement(webdriver.By.id('dec-hint')).getAttribute("innerHTML");
        expect(decHint,"dec-hint does not match expected.").to.be.equal("test");

        await driver.findElement(webdriver.By.id('dec-password')).sendKeys("test");
        await driver.findElement(webdriver.By.id('do-decrypt')).click();   

        await comsupport.assertFormIsLocked(driver, false);
    });
    
    it('Can import more than once.', async function(){
        
        //sets test timeout to 10s
        this.timeout(10000);
        
        //refresh the driver
       
        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        //uses the import from import good test above but twice
        await driver.executeScript(function() {
            var goodText = '<meta name="sca-app-type" content="WhisperNote" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"9crMqEZL+3I=","iv":"xPZr3cdl6FzORmsbajidRA==","adata":"YQ==","ct":"szz3oOygcA5dq885EWFZSJaCAP8YbJckeDRGlCgn1F5i529fnqFSJvxGaMfVy9nisZ967zgvr52rBA=="};</script>';
            SCA.processImportedFileText(goodText);
        });

        await comsupport.assertFormIsLocked(driver, true);

        await driver.executeScript(function() {
            var goodText = '<meta name="sca-app-type" content="WhisperNote" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"9crMqEZL+3I=","iv":"xPZr3cdl6FzORmsbajidRA==","adata":"YQ==","ct":"szz3oOygcA5dq885EWFZSJaCAP8YbJckeDRGlCgn1F5i529fnqFSJvxGaMfVy9nisZ967zgvr52rBA=="};</script>';
            SCA.processImportedFileText(goodText);
        });
        
        await comsupport.assertFormIsLocked(driver, true);
    });

});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}