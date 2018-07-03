/**
 * @file specific testing for EveryPass application
 */

const webdriver = require('../../common/node_modules/selenium-webdriver');
const firefox = require('../../common/node_modules/selenium-webdriver/firefox');
const dragAndDrop = require('../../common/node_modules/html-dnd').code;
const chai = require('../../common/node_modules/chai');
const expect = chai.expect;
const assert = chai.assert;
const path = require('path')
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
        fxoptions.setPreference("browser.download.dir", __dirname + path.sep + "test_downloads");
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
        assert.equal(title, 'EveryPass Password Manager v1.6', 'Password manager homepage title is NOT the one expected');
        var help = await driver.findElement(webdriver.By.id('help-screen'));
        var helpText = await help.getAttribute("innerHTML");
        assert.include(helpText, "is a Password Manager", 'Description exists');
    });

    describe('Core UI function tests', function () {

        it('Can create a URL based password then show, hide, and delete it.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);


            var data = support.getTestData("www.consunet.com.au");

            await support.addPassword(driver, true, data);

            var id = 'p0';

            await support.assertPasswordBodyHidden(driver, id);

            await support.toggleShowBody(driver, id)

            await support.assertPasswordBodyShown(driver, id);

            await support.verifyDataMatches(driver, id, data);

            var goDisplayed = await driver.findElement(webdriver.By.id(id + '-go')).isDisplayed();
            expect(goDisplayed, "Go Button is hidden for " + id).to.equal(true);

            await support.toggleShowBody(driver, id)

            await support.assertPasswordBodyHidden(driver, id);

            await support.setExtendedOptions(driver, false, true);

            await support.delItem(driver, id);

            await support.assertPasswordNotExists(driver, id);
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

            fs.copyFileSync('test/local_test_page.html', 'public_html/local_test_page.html');

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //create URL based password
            var data = support.getTestData(testVars.TEST_LOCAL_PAGE);
            await support.addPassword(driver, true, data);

            await driver.findElement(webdriver.By.id('p0-toggle')).click();
            await driver.findElement(webdriver.By.id('p0-go')).click();

            await sleep(1000);

            var handles = await driver.getAllWindowHandles();
            var secondWindowHandle = handles[1];
            var firstWindowHandle = handles[0];

            await driver.switchTo().window(secondWindowHandle);

            assert.equal(await driver.getCurrentUrl(), testVars.TEST_LOCAL_PAGE);

            //close secondary window only
            await driver.close();

            await driver.switchTo().window(firstWindowHandle);
            
            fs.unlinkSync('public_html/local_test_page.html');
        });


        it('Can create a group, add new password directly to it, hide the group, then show it again.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await support.addGroup(driver, 'Group 1');

            await support.assertGroupExists(driver, 'g0');

            await support.assertGroupBodyShown(driver, 'g0'); //visible grp  

            await support.toggleDefaultGrp(driver, 'g0');//pwds to be added to g0

            var p0 = support.getTestData("ABc");

            await support.addPassword(driver, true, p0);

            await support.assertPasswordExists(driver, 'p0', 'g0');//p0 in g0

            await support.assertPasswordShown(driver, 'p0');

            await support.verifyDataMatches(driver, 'p0', p0);

            await support.toggleShowBody(driver, 'g0');//hide g0

            await support.assertGroupBodyHidden(driver, 'g0');//hidden grp             
            await support.assertPasswordHidden(driver, 'p0');

            await support.toggleShowBody(driver, 'g0');//show g0

            await support.assertGroupBodyShown(driver, 'g0'); //visible grp 
            await support.assertPasswordShown(driver, 'p0');
        });

        it('Can create multiple passwords and search for them case-insensitively (no groups).', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);


            await support.addPassword(driver, true, support.getTestData("ABc"));//p0
            await support.addPassword(driver, true, support.getTestData("def"));//p1
            await support.addPassword(driver, true, support.getTestData("ghi"));//p2
            await support.addPassword(driver, true, support.getTestData("jkl"));//p3
            var p4 = support.getTestData("abcd")
            await support.addPassword(driver, true, p4);//p4

            await support.assertPasswordExists(driver, 'p0');
            await support.assertPasswordExists(driver, 'p1');
            await support.assertPasswordExists(driver, 'p2');
            await support.assertPasswordExists(driver, 'p3');
            await support.assertPasswordExists(driver, 'p4');


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

        it('Can create multiple passwords in separate groups and search for them case-insensitively.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await support.addGroup(driver, 'Group 0'); //g0
            await support.addGroup(driver, 'Group 1'); //g1

            await support.toggleDefaultGrp(driver, 'g0');//pwds to be added to g0            
            await support.addPassword(driver, true, support.getTestData("ABc"));//p0
            await support.addPassword(driver, true, support.getTestData("def"));//p1
            await support.addPassword(driver, true, support.getTestData("ghi"));//p2

            await support.assertPasswordExists(driver, 'p0', 'g0');
            await support.assertPasswordExists(driver, 'p1', 'g0');
            await support.assertPasswordExists(driver, 'p2', 'g0');

            await support.toggleDefaultGrp(driver, 'g1');//pwds to be added to g1            
            await support.addPassword(driver, true, support.getTestData("jkl"));//p3
            var p4 = support.getTestData("abcd")
            await support.addPassword(driver, true, p4);//p4

            await support.assertPasswordExists(driver, 'p3', 'g1');
            await support.assertPasswordExists(driver, 'p4', 'g1');



            //single character 'a' not to trigger search
            await support.search(driver, "a");
            //expect all shown
            await support.assertPasswordShown(driver, 'p0');
            await support.assertPasswordShown(driver, 'p1');
            await support.assertPasswordShown(driver, 'p2');
            await support.assertPasswordShown(driver, 'p3');
            await support.assertPasswordShown(driver, 'p4');
            //

            await support.toggleShowBody(driver, 'g1')//hide, should show again upon search match
            await support.assertGroupBodyHidden(driver, 'g1');

            //2 chars to trigger search using 'ab' 
            await support.search(driver, "b");
            //expect 2 shown
            await support.assertPasswordShown(driver, 'p0');
            await support.assertPasswordHidden(driver, 'p1');
            await support.assertPasswordHidden(driver, 'p2');

            await support.assertGroupBodyShown(driver, 'g1');
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

        it('Can change default group and set no default group for adding new passwords.', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await support.addGroup(driver, 'Group 0'); //g0
            await support.addGroup(driver, 'Group 1'); //g1

            await support.toggleDefaultGrp(driver, 'g0');//on             

            await support.addPassword(driver, true, support.getTestData("ABc"));//p0
            await support.assertPasswordExists(driver, 'p0', 'g0');

            await support.toggleDefaultGrp(driver, 'g1');//g1 on (previous g0 off)            

            await support.addPassword(driver, true, support.getTestData("def"));//p1
            await support.assertPasswordNotExists(driver, 'p1', 'g0');
            await support.assertPasswordExists(driver, 'p1', 'g1');

            await support.toggleDefaultGrp(driver, 'g1');//off (none on)

            await support.addPassword(driver, true, support.getTestData("ghi"));//p2
            await support.assertPasswordNotExists(driver, 'p2', 'g0');
            await support.assertPasswordNotExists(driver, 'p2', 'g1');
            await support.assertPasswordExists(driver, 'p2'); //in non grouped area
        });

        it('Can delete a group as well as its passwords (after confirmation).', async function () {
            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //no delete warning and remove passwords in group
            await support.setExtendedOptions(driver, true, false);

            await support.addGroup(driver, 'Group 0'); //g0     
            await support.toggleDefaultGrp(driver, 'g0');//on    
            await support.addPassword(driver, true, support.getTestData("ABc"));//p0 in g0     

            await support.assertPasswordExists(driver, 'p0', 'g0');

            await support.delItem(driver, 'g0');//del g0 triggering prompt

            var alertShown;

            try
            {
                //confirmation expected
                await driver.wait(webdriver.until.alertIsPresent(), 1000)
                alertShown = true;
                await driver.switchTo().alert().accept();
            } catch (e)
            {
                alertShown = false;
            }

            expect(alertShown, "Alert not shown").to.equal(true)

            await support.assertGroupNotExists(driver, 'g0'); //g0 now gone 

            await support.assertPasswordNotExists(driver, 'p0');//p0 not returned to non-grouped area                         
        });

        it('Can delete a group and retain its passwords.', async function () {
            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //no delete warning and remove passwords in group
            await support.setExtendedOptions(driver, false, true);

            await support.addGroup(driver, 'Group 0'); //g0     
            await support.toggleDefaultGrp(driver, 'g0');//on    
            await support.addPassword(driver, true, support.getTestData("ABc"));//p0 in g0     

            await support.assertPasswordExists(driver, 'p0', 'g0');

            await support.delItem(driver, 'g0');//del g0 (no prompt this time)

            await support.assertGroupNotExists(driver, 'g0'); //g0 deleted 

            await support.assertPasswordExists(driver, 'p0'); //p0 returned to non-grouped area                     
        });
    });

    describe('Advanced UI function tests', function () {

        it('Can drag and drop password onto password to move (downwards, no groups)', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await dragPwdToPwdChecks(driver, false);
        });

        it('Can drag and drop password onto password to move (upwards, no groups)', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await dragPwdToPwdChecks(driver, true);
        });

        it('Can drag and drop group onto group to move (downwards)', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await dragGrpToGrpChecks(driver, false);
        });

        it('Can drag and drop group onto group to move (upwards)', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await dragGrpToGrpChecks(driver, true);
        });

        it('Can drag and drop passwords into groups (via group title panel)', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await support.addGroup(driver, 'Group 0'); //g0           

            await support.addPassword(driver, true, support.getTestData("ABc")); //p0 not yet grouped

            await support.assertPasswordNotExists(driver, 'p0', 'g0');//not in group yet

            var draggable = await driver.findElement(webdriver.By.id('p0-drag'));
            var droppable = await driver.findElement(webdriver.By.id('g0-drag'));

            await driver.executeScript(dragAndDrop, draggable, droppable);

            await support.assertPasswordNotExists(driver, 'p0');//doesnt exist in non-grouped area any more
            await support.assertPasswordExists(driver, 'p0', 'g0');//now in group    
        });

        it('Can drag and drop non-grouped passwords onto passwords in groups to insert at target (upwards)', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await support.addGroup(driver, 'Group 0'); //g0

            await support.toggleDefaultGrp(driver, 'g0');//on   

            await support.addPassword(driver, true, support.getTestData("abc")); //p0 to g0

            await support.addPassword(driver, true, support.getTestData("def")); //p1 to g0

            await support.toggleDefaultGrp(driver, 'g0');//off            

            await support.addPassword(driver, true, support.getTestData("ghi")); //p2 to no group

            await support.assertPasswordNotExists(driver, 'p2', 'g0');//not in group yet

            var draggable = await driver.findElement(webdriver.By.id('p2-drag'));
            var droppable = await driver.findElement(webdriver.By.id('p1-drag'));

            await driver.executeScript(dragAndDrop, draggable, droppable);

            await support.assertPasswordExists(driver, 'p2', 'g0');//now in group

            var posAfter = await driver.executeScript(async function () {

                var grpContainer = SCA.e('g0-pwds');

                return SCA.getPwdPositions('p1', 'p2', grpContainer);
            });

            expect(posAfter).to.deep.equal([2, 1]);
        });

        it('Can drag and drop a password from one group to join another (via group title panel)', async function () {

            //sets test timeout to 10s
            this.timeout(10000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await support.addGroup(driver, 'Group 0'); //g0
            await support.addGroup(driver, 'Group 1'); //g1

            await support.toggleDefaultGrp(driver, 'g0');//on   

            await support.addPassword(driver, true, support.getTestData("abc")); //p0 to g0

            await support.toggleDefaultGrp(driver, 'g1');//g1 on, g0 off

            await support.addPassword(driver, true, support.getTestData("def")); //p1 to g1                                         

            var draggable = await driver.findElement(webdriver.By.id('p1-drag'));
            var droppable = await driver.findElement(webdriver.By.id('g0-drag'));

            await support.assertPasswordExists(driver, 'p1', 'g1');//starts in this group   
            await support.assertPasswordNotExists(driver, 'p1', 'g0');//not in this group yet  

            await driver.executeScript(dragAndDrop, draggable, droppable);

            await support.assertPasswordNotExists(driver, 'p1', 'g1');//no longer in this group   
            await support.assertPasswordExists(driver, 'p1', 'g0');//now in group           
        });

        it('Can drag and drop a password in one group onto a password in another group to insert at target (downwards)', async function () {

            //sets test timeout to 10s
            this.timeout(30000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await dragPwdToPwdInGrpChecks(driver, false);
        });

        it('Can drag and drop a password in one group onto a password in another group to insert at target (upwards)', async function () {

            //sets test timeout to 10s
            this.timeout(30000);

            //refresh the driver
            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await dragPwdToPwdInGrpChecks(driver, true);
        });

    });

    describe('File encrypt and decrypt tests', function () {

        it('Can create multiple groups, add passswords both inside and outside of groups, and then encrypt all.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            await comsupport.setCommonOptions(driver, "test_encrypted", 2);

            await support.addPassword(driver, true, support.getTestData("ABc"));//p0

            await support.addGroup(driver, 'Group 0'); //g0
            await support.addGroup(driver, 'Group 1'); //g1

            await support.toggleDefaultGrp(driver, 'g0');//on             

            await support.addPassword(driver, true, support.getTestData("def"));//p1
            await support.assertPasswordExists(driver, 'p1', 'g0');

            await support.toggleShowBody(driver, 'g0'); //hide g0, to be retained in decrypt;

            await support.toggleDefaultGrp(driver, 'g1');//g1 on (previous g0 off)            

            //not added until encrypt called (tested for existance in decrypt)
            await support.addPassword(driver, false, support.getTestData("ghi"));//p2

            //trigger encrypt and download
            await comsupport.encryptWith(driver, testVars.TEST_PASSWORD, testVars.TEST_HINT);

            //allow encrypt and download time
            await sleep(1000);

            //ensure passwords and groups removed after encrypt
            await support.assertPasswordNotExists(driver, 'p1');
            await support.assertGroupNotExists(driver, 'g0');
            await support.assertGroupNotExists(driver, 'g1');

            //make sure file is created
            expect(file('test/test_downloads/test_encrypted.html')).to.exist;

            //copy to web server path to access via URL
            fs.copyFileSync('test/test_downloads/test_encrypted.html', 'public_html/test_encrypted.html');
        });

        it('Can do decrypt of encrypted file via URL.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_ENCRYPTED_URL);

            await decryptTestChecks(driver);
        });

        it('Can do decrypt of encrypted file via import.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //import file created above
            await driver.findElement(webdriver.By.id('import')).sendKeys(__dirname + path.sep + "test_downloads" + path.sep + "test_encrypted.html");

            //allow for import
            await sleep(100);

            await decryptTestChecks(driver);
        });

        it('Can do decrypt of encrypted file from final EveryPass build without grouping functionality (via import).', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //import file created above
            await driver.findElement(webdriver.By.id('import')).sendKeys(__dirname + path.sep + "pre_groups_decrypt_import.html");

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

            await support.toggleShowBody(driver, id);
            await support.assertPasswordBodyShown(driver, id);
            await support.verifyDataMatches(driver, id, support.getTestData());

            id = 'p1';
            await support.assertPasswordBodyHidden(driver, id);
            await support.toggleShowBody(driver, id);
            await support.assertPasswordBodyShown(driver, id);
            await support.verifyDataMatches(driver, id, support.getTestData("abc"));
        });

        it('Can do decrypt of legacy (1.3) encrypted file via import.', async function () {

            this.timeout(10000);

            await driver.get(testVars.TEST_UNENCRYPTED_URL);

            //import file created above
            await driver.findElement(webdriver.By.id('import')).sendKeys(__dirname + path.sep + "legacy_decrypt_import.html");

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

            await support.toggleShowBody(driver, id);
            await support.assertPasswordBodyShown(driver, id);
            await support.verifyDataMatches(driver, id, support.getTestData());

            id = 'p1';
            await support.assertPasswordBodyHidden(driver, id);
            await support.toggleShowBody(driver, id);
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

/*
 * Repeated logic from import and URL based decrpytion tests
 */
async function decryptTestChecks(driver) {

    //check is diplaying form for unlock password
    await comsupport.assertFormIsLocked(driver, true);

    //check for hint
    var hintVal = await driver.findElement(webdriver.By.id('dec-hint')).getAttribute("innerHTML");
    expect(hintVal, "Hint doesn't exist").to.be.equal(testVars.TEST_HINT);

    await comsupport.decryptWith(driver, "password");

    //check is not diplaying form for unlock password
    await comsupport.assertFormIsLocked(driver, false);

    await comsupport.assertBrowserUnsupportedMessageIsShown(driver, false);

    await support.assertGroupExists(driver, 'g0');
    await support.assertGroupBodyHidden(driver, 'g0');//hidden grp as hidden before encrypt            
    await support.toggleShowBody(driver, 'g0');
    await support.assertGroupBodyShown(driver, 'g0');

    await support.assertGroupExists(driver, 'g1');
    await support.addPassword(driver, true, support.getTestData("ghi"));//p3 to be added to g1 
    await support.assertPasswordNotExists(driver, 'p3'); //should not be added to non-grouped area
    await support.assertPasswordExists(driver, 'p3', 'g1');//should be added to g1 which was set as default before encrypt

    var id = 'p0';
    await support.assertPasswordBodyHidden(driver, id);
    await support.toggleShowBody(driver, id);
    await support.assertPasswordBodyShown(driver, id);
    await support.verifyDataMatches(driver, id, support.getTestData("ABc"));

    id = 'p1';
    await support.assertPasswordBodyHidden(driver, id, 'g0');
    await support.toggleShowBody(driver, id);
    await support.assertPasswordBodyShown(driver, id, 'g0');
    await support.verifyDataMatches(driver, id, support.getTestData("def"));

    id = 'p2';
    await support.assertPasswordBodyHidden(driver, id, 'g1');
    await support.toggleShowBody(driver, id);
    await support.assertPasswordBodyShown(driver, id, 'g1');
    await support.verifyDataMatches(driver, id, support.getTestData("ghi"));
}

/*
 * Repeated logic for drag and drop tests (password onto password)
 */
async function dragPwdToPwdChecks(driver, isReverse) {

    await support.addPassword(driver, true, support.getTestData("ABc"));//p0     
    await support.addPassword(driver, true, support.getTestData("def"));//p1
    await support.addPassword(driver, true, support.getTestData("ghi"));//p2

    var posBefore = await driver.executeScript(async function () {
        var pos = SCA.getPwdPositions('p0', 'p2');
        return pos;
    });

    expect(posBefore).to.deep.equal([0, 2]);

    var p0 = await driver.findElement(webdriver.By.id('p0-drag'));
    var p2 = await driver.findElement(webdriver.By.id('p2-drag'));

    if (isReverse)
    {
        await driver.executeScript(dragAndDrop, p2, p0);

        var posAfter = await driver.executeScript(async function () {
            return SCA.getPwdPositions('p0', 'p2')
        });

        expect(posAfter).to.deep.equal([1, 0]);
    } else
    {
        await driver.executeScript(dragAndDrop, p0, p2);

        var posAfter = await driver.executeScript(async function () {
            return SCA.getPwdPositions('p0', 'p2')
        });

        expect(posAfter).to.deep.equal([2, 1]);
    }
}

/*
 * Repeated logic for drag and drop tests (group onto group)
 */
async function dragGrpToGrpChecks(driver, isReverse) {

    await support.addGroup(driver, 'Group 0'); //g0
    await support.toggleDefaultGrp(driver, 'g0');//on
    await support.addPassword(driver, true, support.getTestData("abc"));

    await support.addGroup(driver, 'Group 1'); //g1
    await support.toggleDefaultGrp(driver, 'g1');
    await support.addPassword(driver, true, support.getTestData("def"));

    await support.addGroup(driver, 'Group 2'); //g2
    await support.toggleDefaultGrp(driver, 'g2');
    await support.addPassword(driver, true, support.getTestData("ghi"));

    var posBefore = await driver.executeScript(async function () {
        var pos = SCA.getGrpPositions('g0', 'g2');
        return pos;
    });

    expect(posBefore).to.deep.equal([0, 2]);

    var g0 = await driver.findElement(webdriver.By.id('g0-drag'));
    var g2 = await driver.findElement(webdriver.By.id('g2-drag'));

    if (isReverse)
    {
        await driver.executeScript(dragAndDrop, g2, g0);

        var posAfter = await driver.executeScript(async function () {
            return SCA.getGrpPositions('g0', 'g2')
        });

        expect(posAfter).to.deep.equal([1, 0]);
    } else
    {
        await driver.executeScript(dragAndDrop, g0, g2);

        var posAfter = await driver.executeScript(async function () {
            return SCA.getGrpPositions('g0', 'g2')
        });

        expect(posAfter).to.deep.equal([2, 1]);
    }

    await support.assertPasswordExists(driver, 'p0', 'g0');//retains passwords after move 
    await support.assertPasswordExists(driver, 'p2', 'g2');
}

/*
 * Repeated logic for drag and drop tests (password onto password within separate group)
 */
async function dragPwdToPwdInGrpChecks(driver, isReverse) {

    await support.addGroup(driver, 'Group 0'); //g0
    await support.addGroup(driver, 'Group 1'); //g1

    await support.toggleDefaultGrp(driver, 'g0');//on   

    await support.addPassword(driver, true, support.getTestData("abc")); //p0 to g0

    await support.toggleDefaultGrp(driver, 'g1');//g1 on, g0 off

    await support.addPassword(driver, true, support.getTestData("def")); //p1 to g1                                         

    var movedPwd = isReverse ? "p1" : "p0";
    var extantPwd = isReverse ? "p0" : "p1"
    var startGrp = isReverse ? "g1" : "g0";
    var endGrp = isReverse ? "g0" : "g1";


    var draggable = await driver.findElement(webdriver.By.id(movedPwd + '-drag'));
    var droppable = await driver.findElement(webdriver.By.id(extantPwd + '-drag'));

    await support.assertPasswordExists(driver, movedPwd, startGrp);//starts in this group   
    await support.assertPasswordNotExists(driver, movedPwd, endGrp);//not yet in this group  

    await driver.executeScript(dragAndDrop, draggable, droppable);

    await support.assertPasswordNotExists(driver, movedPwd, startGrp);//no longer in this group   
    await support.assertPasswordExists(driver, movedPwd, endGrp);//now in group 

    var posAfter = await driver.executeScript(
            "var grpContainer = SCA.e('" + endGrp + "-pwds');"
            +
            "return SCA.getPwdPositions('p0', 'p1', grpContainer);"
            );

    //either way p0 will end up under p1
    expect(posAfter).to.deep.equal([1, 0]);
}

/*
 * Makes test wait for browser to do something
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
