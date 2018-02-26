/**
 * EveryPass global parameters
 */


/**
 * @file functions to support testing of the app using Casper JS
 */ 
 
/**
 * @namespace CPASS_TEST
 * @type {object}
 * @description
 * <p>
 * These functions provide a higher level of abstraction for driving the app using Casper JS.
 * </p>
 */
var CPASS_TEST = {
    /**
     * Asserts that a password DOM entry is found for the specified ID.
     * 
     * @param {Tester} test - the Casper test object
     * @param {string} id - the id of the password to check
     */
    assertPasswordExists: function(test, id) {
        test.assertExists('#' + id, "Password entry is found for " + id);
    },

    /**
     * Asserts that a password DOM entry is not found for the specified ID.
     * 
     * @param {Tester} test - the Casper test object
     * @param {string} id - the id of the password to check
     */
    assertPasswordNotExists: function(test, id) {
        test.assertNotExists('#' + id, "Password entry is not found for " + id);
    },

    /**
     * Asserts that a password entry is completely hidden in the DOM for the specified ID.
     * 
     * @param {Tester} test - the Casper test object
     * @param {string} id - the id of the password to check
     */
    assertPasswordHidden: function(test, id) {
        this.assertPasswordExists(test, id);
        test.assertNotVisible('#' + id, "Password is hidden for " + id);
    },

    /**
     * Asserts that a password entry is visible in the DOM for the specified ID.
     * 
     * @param {Tester} test - the Casper test object
     * @param {string} id - the id of the password to check
     */
    assertPasswordShown: function(test, id) {
        this.assertPasswordExists(test, id);
        test.assertVisible('#' + id, "Password is shown for " + id);
    },

    /**
     * Asserts that the body of a password entry is hidden in the DOM for the specified ID.
     * 
     * @param {Tester} test - the Casper test object
     * @param {string} id - the id of the password to check
     */
    assertPasswordBodyHidden: function(test, id) {
        this.assertPasswordExists(test, id);
        test.assertVisible('#' + id + '-service', "Service name is visible for " + id);
        test.assertNotVisible('#' + id + '-username', "Username is hidden for " + id);
        test.assertNotVisible('#' + id + '-password', "Password is hidden for " + id);
        test.assertNotVisible('#' + id + '-question', "Question is hidden for " + id);
        test.assertNotVisible('#' + id + '-answer', "Answer is hidden for " + id);
    },

    /**
     * Asserts that the body of a password entry is shown in the DOM for the specified ID.
     * 
     * @param {Tester} test - the Casper test object
     * @param {string} id - the id of the password to check
     */
    assertPasswordBodyShown: function(test, id) {
        this.assertPasswordExists(test, id);
        test.assertVisible('#' + id + '-service', "Service name is visible for " + id);
        test.assertVisible('#' + id + '-username', "Username is visible for " + id);
        test.assertVisible('#' + id + '-password', "Password is visible for " + id);
        test.assertVisible('#' + id + '-question', "Question is visible for " + id);
        test.assertVisible('#' + id + '-answer', "Answer is visible for " + id);
    },

    /**
     * Asserts that the password entry matches the specified expectation
     * 
     * @param {Tester} test - the Casper test object
     * @param {string} id - the id of the password to check
     * @param {object} data - the expected data to check against
     */
    verifyDataMatches: function(test, id, data) {
        test.assertField(id + '-service', data['#new-service']);
        test.assertField(id + '-username', data['#new-username']);
        test.assertField(id + '-password', data['#new-password']);
        test.assertField(id + '-question', data['#new-question']);
        test.assertField(id + '-answer', data['#new-answer']);
    },

    /**
     * Simulates clicking the Show/Hide password body button for a password.
     * 
     * @param {Casper} casper - the Casper page driver object
     * @param {string} id - the id of the password to toggle
     */
    togglePwd: function(casper, id) {
        casper.click('#' + id + '-toggle');
    },

    /**
     * Simulates clicking the delete button for a password.
     * 
     * @param {Casper} casper - the Casper page driver object
     * @param {string} id - the id of the password to delete
     */
    delPwd: function(casper, id) {
        casper.click('#' + id + '-delete');
    },

    /**
     * Generates test data to be entered into the new password form.
     * 
     * @param {string} service - defaults to 'test service'
     * @param {string} username - defaults to 'test username'
     * @param {string} password - defaults to 'test password'
     * @param {string} question - defaults to 'test question'
     * @param {string} answer - defaults to 'test answer'
     */
    getTestData: function(service, username, password, question, answer) {
        service = service || 'test service';
        username = username || 'test username';
        password = password || 'test password';
        question = question || 'test question';
        answer = answer || 'test answer';

        data = {
            '#new-service': service,
            '#new-username': username,
            '#new-password': password,
            '#new-question': question,
            '#new-answer': answer
        };

        return data;
    },

    /**
     * Simulates adding a password entry by filling in the new password form, and clicking add.
     * Also asserts that all form entries have been cleared after adding the entry.
     * 
     * @param {Casper} casper - the Casper page driver object
     * @param {Tester} test - the Casper test object
     * @param {object} data - the password entry data to add
     */
    addPassword: function(casper, test, data) {
        data = data || this.getTestData();

        // Fill in the form and add a new password. 
        casper.fillSelectors('form#new-entry', data, false);
        casper.click('#add-new-pwd');

        // Form should be reset and new password should be hidden initially
        test.assertField('new-service', '');
        test.assertField('new-username', '');
        test.assertField('new-password', '');
        test.assertField('new-question', '');
        test.assertField('new-answer', '');
    },

    /**
     * Simulates searching/filtering of password via the search input field.
     * 
     * @param {Casper} casper - the Casper page driver object.
     * @param {string} text - the search text to type.
     * @param {boolean} reset - whether to reset the search field or not.
     */
    search: function(casper, text, reset) {
        if (reset) {
            casper.evaluate(function() {
                document.getElementById('search').value = '';
            });
        }
        casper.sendKeys('#search', text);
    }
};
