/**
 * @namespace C_TEST
 * @type {object}
 * @description
 * <p>
 * These functions provide a higher level of abstraction for driving the app using Casper JS.
 * </p>
 */
var Promise = require('es6-promise').Promise; // required as PhantomJS lacks native Promise API.

var C_TEST = {
              
    /**
     * Asserts if the form is currently in a "locked" state or not.
     * 
     * @param {Casper} casper - the Casper page driver object
     * @param {Tester} test - the Casper test object
     * @param {boolean} isLocked - true if the form should be locked, false otherwise
     */
    assertFormIsLocked: function(casper, test, isLocked) {
        var lockedStyle = casper.getElementAttribute("#locked", 'style');
        var unlockedStyle = casper.getElementAttribute("#unlocked", 'style');

        if (isLocked) {
            test.assertEquals(lockedStyle, "display: inline; ", "Locked div is shown");
            test.assertEquals(unlockedStyle, "display: none; ", "Unlocked div is hidden");
        } else {
            test.assertEquals(lockedStyle, "display: none; ", "Locked div is hidden");
            test.assertEquals(unlockedStyle, "display: inline; ", "Unlocked div is shown");
        }
    },
    
    assertBrowserUnsupportedMessageIsShown: function(test, isShown) {
        var unsupportedStyle = casper.getElementAttribute("#unsupported", 'style');
        
         if (isShown) {
            test.assertEquals(unsupportedStyle, "display: inline; ", "Browser unsupported div is shown");
        } else {
            test.assertEquals(unsupportedStyle, "display: none; ", "Browser unsupported div is hidden");
        }
    },
    
    expandMenu: function(casper, test) {
        casper.click('#menu-button');
        test.assertTextExists("Import");
        test.assertTextExists("Options");
        test.assertTextExists("Help");
    },
    
    openOptions: function(casper, test) {
        this.expandMenu(casper, test);  
        casper.click('#menu-options');
    },
    
    sendKeysOptionSaveFilename: function(casper, test, saveFilename) {
        this.openOptions(casper, test);
        casper.sendKeys('form#options input#opt-save-filename', saveFilename);
    },
    
    setCommonOptions: function(casper, test, saveFilename, timeout) {
        this.openOptions(casper, test);
        var data = {
            '#opt-save-filename': saveFilename,
            '#opt-timeout': timeout
        };
        casper.fillSelectors('form#options', data, false);
    },
    
    decryptWith: function(casper, password) {
        var data = {"#dec-password": password};
        casper.fillSelectors('form#decrypt', data, false);
        casper.click('#do-decrypt');
    },
    
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
    encryptWith: function(casper, password, hint, writeToTarget) {
        var encValues = {"#enc-password": password, "#enc-hint": hint};
        casper.fillSelectors('form#encrypt', encValues, false);
        
        var retval = new Promise(function(resolve, reject) {
            casper.page.evaluate(function() {
                var encryptionPromise = SCA.encryptAndEmbedData();
                // Simulates the user clicking on Encrypt - like executing:
                // this.click('#do-encrypt');
                // Without the Casper test hanging at this point, waiting for User to save file
                encryptionPromise.then(function() {
                    var testEncryptedHtml = SCA.getDocumentHtml();
                    fs.write(writeToTarget, testEncryptedHtml);
                    resolve();
                }).catch(function(reason) {
                    reject(reason);
                });
            });
        });
        
        return retval;
    },
    
    setEncryptPass: function(casper, password) {
        var emptyValues = {"#enc-password": ""};
        casper.fillSelectors('form#encrypt', emptyValues, false);
        casper.sendKeys('form#encrypt input#enc-password', password);
    }
};
