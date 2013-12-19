/**
 * @file functions to support testing of the WhisperNote app using Casper JS
 */ 
 
/**
 * @namespace CNOTE_TEST
 * @type {object}
 * @description
 * <p>
 * These functions provide a higher level of abstraction for driving the app using Casper JS.
 * </p>
 */
var CNOTE_TEST = {
              
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
    }
};
