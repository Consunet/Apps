/**
 * Holds tests common to both apps
 */
casper.test.begin('Can see various password strengths', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        C_TEST.setEncryptPass(casper, "asd");
        test.assertTextExists("Password: Weak", "Weak password detected");
        
        C_TEST.setEncryptPass(casper, "asdasdasd1234");
        test.assertTextExists("Password: OK", "OK password detected");
        
        C_TEST.setEncryptPass(casper, "asdasdasd1234546789123!");
        test.assertTextExists("Password: Strong", "Strong password detected");
    }).run(function() {
        test.done();
    });
});

casper.test.begin('When bad options are set an error shows.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        C_TEST.setCommonOptions(casper, test, "", "");
        C_TEST.sendKeysOptionSaveFilename(casper, test, "#$*&Y");
        test.assertTextExists("Invalid filename", "Bad save filename error exists");
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can verify basic encrypted data details.', function suite(test) {
    casper.start(TEST_ENCRYPTED_URL).then(function() {
        C_TEST.assertFormIsLocked(casper, test, true);
        var doctype = this.page.evaluate(function() {
            return document.doctype.name;
        });
        
        test.assertEquals(doctype, "html", "Doctype is present");
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Error returned when wrong decrypt password entered.', function suite(test) {
    casper.start(TEST_ENCRYPTED_URL).then(function() {
        C_TEST.decryptWith(casper, "wrongpassword");
        test.assertTextExists(TEST_HINT, "Hint exists");
        test.assertTextExists("Incorrect password, or data has been corrupted", "Bad password error exists");
    }).run(function() {
        test.done();
    });
});