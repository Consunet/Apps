/**
 * @namespace C_TEST
 * @type {object}
 * @description
 * <p>
 * These functions provide a higher level of abstraction for driving the app using Casper JS.
 * </p>
 */
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
    
    setCommonOptions: function(casper, test, saveFilename, timeout) {
        this.openOptions(casper, test);
        var data = {
            '#opt-save-filename': saveFilename,
            '#opt-timeout': timeout
        };
        casper.fillSelectors('form#options', data, false);
    }
};
