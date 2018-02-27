const webdriver = require('selenium-webdriver');
const expect  = require("chai").expect;
const assert  = require("chai").assert;
var fs  = require('fs');

const BASE_URL = "http://localhost:8000/public_html/";

exports.TEST_UNENCRYPTED_URL = BASE_URL + "en/index.html";
exports.TEST_ENCRYPTED_URL = BASE_URL + "test_encrypted.html";
exports.TEST_IMPORTED_URL = BASE_URL + "test_imported.html";
exports.TEST_PASSWORD = "password";
exports.TEST_HINT = "hint value";

exports.addPassword = async function (driver, doClickAdd, service, username, password, question, answer) {
    
    service = service || 'test service';
    username = username || 'test username';
    password = password || 'test password';
    question = question || 'test question';
    answer = answer || 'test answer';    
    
    var searchForm = await driver.findElement(webdriver.By.id('new-entry'));
    await searchForm.findElement(webdriver.By.id('new-service')).sendKeys(service);
    await searchForm.findElement(webdriver.By.id('new-username')).sendKeys(username);         
    await searchForm.findElement(webdriver.By.id('new-password')).sendKeys(password);  
    await searchForm.findElement(webdriver.By.id('new-question')).sendKeys(question); 
    await searchForm.findElement(webdriver.By.id('new-answer')).sendKeys(answer); 
    
    if(doClickAdd)
    {
        await searchForm.findElement(webdriver.By.id('add-new-pwd')).click();
    }
};


/**
     * Returns a Promise which will perform encryption on the page in the
     * future.
     * 
     * @param {type} casper
     * @param {type} password
     * @param {type} hint
     * @param {type} writeToTarget
     * @returns {Promise} when resolved the encryption will be complete. When
     *      rejected, there was a problem with encryption.
     */
    exports.encryptThenSaveToFile = async function(driver, password, hint, writeToTarget) {
        
        var encForm = await driver.findElement(webdriver.By.id('encrypt'));
        await encForm.findElement(webdriver.By.id('enc-password')).sendKeys(password);
        await encForm.findElement(webdriver.By.id('enc-hint')).sendKeys(hint);
        
        await new Promise(function(resolve, reject) {
                              
            driver.executeScript(function() {
                                     
                var encryptPromise = SCA.encryptAndEmbedData();
            
                return encryptPromise;
                
            }).then(function() {
                resolve(); 
            });                                  
        });
        
        var htmlEnc = await new Promise(function(resolve, reject) {
                              
            driver.executeScript(function() {
                              
                var encStr = SCA.getDocumentHtml();
                
                return encStr;
                
            }).then(function(str) {
                resolve(str); 
            });                                  
        });

        await fs.writeFile(writeToTarget, htmlEnc, (err) => {  
        // throws an error, you could also catch it here
            if (err) throw err;

            // success case, the file was saved
            console.log('Encrypted File Saved');
        });       
    };