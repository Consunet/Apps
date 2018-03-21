/**
 * @file specific testing for EveryPass application
 */

const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const chai = require('../../common/node_modules/chai');
const expect = chai.expect;
const assert = chai.assert;
const chaiFiles = require('../../common/node_modules/chai-files');
const file = chaiFiles.file;
const dir = chaiFiles.dir;
const until = webdriver.until;
const fs = require('fs')
const support = require('./mocha_test_support.js');
const comsupport = require('../../common/test/mocha_common_support.js');

chai.use(chaiFiles);


describe('EveryPass Specific Testing', function () {

    var driver;

    before(async function () {

        this.timeout(30000);

        console.log("------------ opening headless browser -------------");

        var fxoptions = new firefox.Options()
        fxoptions.setProfile(comsupport.commonFullPath() + "/firefox_profile")
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

    it('Can verify basic app details.', async function () {
        this.timeout(10000);

        await driver.get(testVars.TEST_UNENCRYPTED_URL);

        var title = await driver.getTitle();
        assert.equal(title, 'EveryPass Password Manager v1.5', 'Password manager homepage title is NOT the one expected');
        var help = await driver.findElement(webdriver.By.id('help-screen'));
        var helpText = await help.getAttribute("innerHTML");
        assert.include(helpText, "is a Password Manager", 'Description exists')
    });

    describe('UI function tests', function () {

        it('Can create a URL based password then show, hide, and delete it.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //getTestData();
            var data = support.getTestData("www.consunet.com.au");

            await support.addPassword(driver, true, data);

            var id = 'p0';

            //assertPasswordBodyHidden()
            await support.assertPasswordBodyHidden(driver, id);

            //togglePwd()
            await support.togglePwd(driver, id)

            //assertPasswordBodyShown()
            await support.assertPasswordBodyShown(driver, id);

            //verifyDataMatches()
            await support.verifyDataMatches(driver, id, data);

            var goDisplayed = await driver.findElement(webdriver.By.id(id + '-go')).isDisplayed();
            expect(goDisplayed, "Go Button is hidden for " + id).to.equal(true);

            //togglePwd()
            await support.togglePwd(driver, id)
            //assertPasswordBodyHidden()
            await support.assertPasswordBodyHidden(driver, id);
            //openOptions true = skip delete confirmation
            await comsupport.openOptions(driver, true);
            //delPwd()
            await support.delPwd(driver, id);
            //assertPasswordNotExists()
            await support.assertPasswordNotExists(driver, id);
        });

        it('Can create multiple passwords and search for them case-insensitively.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver

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

            //single character 'a' not to trigger search
            await support.search(driver, "a");
            //expect all shown
            await support.assertPasswordShown(driver, 'p0');
            await support.assertPasswordShown(driver, 'p1');
            await support.assertPasswordShown(driver, 'p2');
            await support.assertPasswordShown(driver, 'p3');
            await support.assertPasswordShown(driver, 'p4');
            //

            //2 chars to trigger search using 'ab' 
            await support.search(driver, "b");
            //expect 2 shown
            await support.assertPasswordShown(driver, 'p0');
            await support.assertPasswordHidden(driver, 'p1');
            await support.assertPasswordHidden(driver, 'p2');
            await support.assertPasswordHidden(driver, 'p3');
            await support.assertPasswordShown(driver, 'p4');

            //trigger search using 'abc' 
            await support.search(driver, "c");
            //expect same 2 shown
            await support.assertPasswordShown(driver, 'p0');
            await support.assertPasswordShown(driver, 'p4');

            //trigger search using 'abcd' 
            await support.search(driver, "d");
            //expect later of previous 2 shown
            await support.assertPasswordHidden(driver, 'p0');
            await support.assertPasswordShown(driver, 'p4');
            await support.verifyDataMatches(driver, 'p4', p4);

            //reset search and single character 'a' not to trigger new search
            await support.search(driver, "a", true);
            //expect all shown
            await support.assertPasswordShown(driver, 'p0');
            await support.assertPasswordShown(driver, 'p1');
            await support.assertPasswordShown(driver, 'p2');
            await support.assertPasswordShown(driver, 'p3');
            await support.assertPasswordShown(driver, 'p4');
        });

        it('Can clear search by pressing ESC.', async function () {
            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            var search = await driver.findElement(webdriver.By.id('search'));
            search.sendKeys("www.");
            search.sendKeys(webdriver.Key.ESCAPE);

            expect(search.getAttribute("value")).to.be.empty;
        });

        it('Generate Button creates randomised passwords.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //ensure new-password (the field to add new password) is empty
            var id = 'new';
            var passwordEmpty = await driver.findElement(webdriver.By.id(id + '-password')).getAttribute("value");
            expect(passwordEmpty, "Password not empty!").to.be.empty;

            //click generate
            await driver.findElement(webdriver.By.id('generate-pwd')).click();
            var passwordOne = await driver.findElement(webdriver.By.id(id + '-password')).getAttribute("value");
            expect(passwordOne, "Password empty!").to.not.be.empty;

            //click generate again and compare
            await driver.findElement(webdriver.By.id('generate-pwd')).click();
            var passwordTwo = await driver.findElement(webdriver.By.id(id + '-password')).getAttribute("value");
            expect(passwordTwo, "Password empty!").to.not.be.empty;

            expect(passwordOne, "Password data not randomised." + id).to.not.equal(passwordTwo);
        });

        it('Deleting password will display an alert and then delete after confirmation (if skip option not set).', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);
            var data = support.getTestData("0");
            await support.addPassword(driver, true, data);

            await driver.findElement(webdriver.By.id('p0-delete')).click();

            var alertShown;

            try
            {
                await driver.wait(webdriver.until.alertIsPresent(), 1000)
                alertShown = true;
                await driver.switchTo().alert().accept();
            } catch (e)
            {
                alertShown = false;
            }

            expect(alertShown, "confirmation alert not shown").to.equal(true);

            await support.assertPasswordNotExists(driver, 'p0');
        });

        it('Can click Go button to visit password URL.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //create URL based password
            var data = support.getTestData("www.consunet.com.au");
            await support.addPassword(driver, true, data);

            await driver.findElement(webdriver.By.id('p0-toggle')).click();
            await driver.findElement(webdriver.By.id('p0-go')).click();

            await sleep(3000);

            var handles = await driver.getAllWindowHandles();
            var secondWindowHandle = handles[1];
            var firstWindowHandle = handles[0];

            await driver.switchTo().window(secondWindowHandle);

            assert.equal(await driver.getCurrentUrl(), 'https://www.consunet.com.au/');

            //close secondary window only
            await driver.close();

            await driver.switchTo().window(firstWindowHandle);
        });

    });

    describe('File encrypt and decrypt tests', function () {

        it('Can create a password, enter more details to form without adding, then encrypt it.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await comsupport.setCommonOptions(driver, "test_encrypted", 2);

            var id = 'p0';

            //submit immediately
            await support.addPassword(driver, true, support.getTestData());
            //dont submit yet
            await support.addPassword(driver, false, support.getTestData('abc'));

            //trigger encrypt and download
            await comsupport.encryptWith(driver, testVars.TEST_PASSWORD, testVars.TEST_HINT);

            //allow encrypt and download time
            await sleep(1000);

            //ensure passwords removed after encrypt
            await support.assertPasswordNotExists(driver, id);

            //make sure file is created
            expect(file('test/test_downloads/test_encrypted.html')).to.exist;

            //copy to web server path to access via URL
            fs.copyFileSync('test/test_downloads/test_encrypted.html', 'public_html/test_encrypted.html');
        });

        it('Can do decrypt of encrypted file via import.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //import file created above
            await driver.findElement(webdriver.By.id('import')).sendKeys(__dirname + "/test_downloads/test_encrypted.html");

            //allow for import
            await sleep(100);

            //check is diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, true);

            //check for hint
            var hintVal = await driver.findElement(webdriver.By.id('dec-hint')).getAttribute("innerHTML");
            expect(hintVal, "Hint doesn't exist").to.be.equal(testVars.TEST_HINT);

            await comsupport.decryptWith(driver, "password");

            //check is not diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, false);

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


        it('Can do decrypt of encrypted file via URL', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_ENCRYPTED_URL);

            //allow for import
            await sleep(100);

            //check for hint
            var hintVal = await driver.findElement(webdriver.By.id('dec-hint')).getAttribute("innerHTML");
            expect(hintVal, "Hint doesn't exist").to.be.equal(testVars.TEST_HINT);

            //check is diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, true);

            await comsupport.decryptWith(driver, "password");

            //check is not diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, false);

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

        it('Can do decrypt of legacy (1.3) encrypted file via import.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //import file created above
            await driver.findElement(webdriver.By.id('import')).sendKeys(__dirname + "/legacy_decrypt_import.html");

            //allow for import
            await sleep(100);

            //check for hint
            var hintVal = await driver.findElement(webdriver.By.id('dec-hint')).getAttribute("innerHTML");
            expect(hintVal, "Hint doesn't exist").to.be.equal(testVars.TEST_HINT);

            //check is diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, true);

            await comsupport.decryptWith(driver, "password");

            //check is not diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, false);

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

    describe('Additional import tests (without file)', function () {

        it('Does not import bad EveryPass data.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver      
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await driver.executeScript(async function () {
                var badText = '<meta name="sca-app-type" content="EveryPass">' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":100,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","iv":"3/fid049KhK4Yw/tGhRUGw==","salt":"yQVb651u3aY=","adata":"YSBh","ct":"SPTYJPHQEeE7kcsbTAUgugd+CZ6IaNIc7YXI1WvmcidiOz2dJ9/tn6DkvFBqlBFwPFvFhD5ganzdVeWA6H8Rytu94YbTCGBXzawVV+FFnRjGok53EQ6+I9uRCin95b3Lu4MSd2z+5Y1zAx3+xt5nVe0="};</script>';
                SCA.processImportedFileText(badText);
            });

            var alertShown;

            try
            {
                //error expected
                await driver.wait(webdriver.until.alertIsPresent(), 1000)
                alertShown = true;
                await driver.switchTo().alert().accept();
            } catch (e)
            {
                alertShown = false;
            }

            expect(alertShown, "Alert not shown").to.equal(true);

            //does not show form awaiting password for bad import. 
            await comsupport.assertFormIsLocked(driver, false);
        });

        it('Does import from version 1.2', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //import v1.2 file
            await driver.executeScript(function () {
                var versionText = '<meta name="sca-app-type" content="EveryPass" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"f8nP34DePaU=","iv":"goOn2gu/A2HY5AFTLXqUMg==","adata":"dGVzdA==","ct":"3cxzwtCreO303q1Gu8yiSAqEWr71MeuvQRAvctWMX5pQCxL2rmiLso/42ICmwEHWMlJW7S75eZybjaIiRADjxu+ucAitNz0+0Cb04OexZO+bpqaZqptqRjjVTJR9rM/cY6y/oNTz3NCMbnk98B1wtxs3+lW+slDPi8NYLG/EoZllqxA9qRBqtmsccbn8MqBKWRZPF4CAROzAX6qXMeH/0nlQXSARUQaleIIVAMkh6QAWfCRdzWe3CA=="};</script>';
                SCA.processImportedFileText(versionText);
            });

            //check is diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, true);

            var decHint = await driver.findElement(webdriver.By.id('dec-hint')).getAttribute("innerHTML");
            expect(decHint, "dec-hint does not match expected.").to.be.equal("test");

            await comsupport.decryptWith(driver, "test");

            //check is not diplaying form for unlock password
            await comsupport.assertFormIsLocked(driver, false);
        });
    });


    describe('Timeout test (*** intentional 65s pause ***)', function () {

        it('Page will reset when timeout hits 0 from 1 minute.', async function () {

            //sets test timeout to 80s
            this.timeout(80000);

            //refresh the driver
            await driver.get(testVars.TEST_ENCRYPTED_URL);
            await comsupport.assertFormIsLocked(driver, true);
            await comsupport.decryptWith(driver, "password");

            await comsupport.setCommonOptions(driver, "", "1"); //setting timeout to 1m
            var timeoutVal = await driver.findElement(webdriver.By.id('opt-timeout')).getAttribute("value");
            expect(timeoutVal).to.be.equal('1');

            //should exist from import prior to timeout
            await support.assertPasswordExists(driver, 'p0');

            await sleep(65000); //sleep(65s)

            //timeout should remove this password
            await support.assertPasswordNotExists(driver, 'p0');
        });
    });

});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
