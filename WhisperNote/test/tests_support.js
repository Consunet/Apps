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

    addNote: function(casper, test, message) {
        data = { '#payload': message };
        casper.fillSelectors('form#main', data, false);
    },
    
    assertNoteText: function(casper, test, expectedText) {
        var msg = casper.evaluate(function() {
            return document.getElementById("payload").value;
        });
        
        test.assertEqual(msg, expectedText, "Found expected test message: " + expectedText);
    }
};
