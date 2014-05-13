/**
 * WhisperNote global parameters
 */
var BASE_URL = "http://localhost:8001/public_html/";
var TEST_UNENCRYPTED_URL = BASE_URL + "index.html";
var TEST_ENCRYPTED_URL = BASE_URL + "test_encrypted.html";
var TEST_IMPORTED_URL = BASE_URL + "test_imported.html";
var TEST_PASSWORD = "password";
var TEST_HINT = "hint value";
var TEST_MESSAGE = "This is a test message";

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
