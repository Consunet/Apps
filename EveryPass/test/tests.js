var BASE_URL = "http://localhost:8000/public_html/";
var TEST_UNENCRYPTED_URL = BASE_URL + "index.html";
var TEST_ENCRYPTED_URL = BASE_URL + "test_encrypted.html";
var TEST_IMPORTED_URL = BASE_URL + "test_imported.html";
var TEST_PASSWORD = "password";
var TEST_HINT = "hint value";

casper.test.begin('Can verify basic app details.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        test.assertTitle("EveryPass Password Manager v1.3", "Password manager homepage title is the one expected");
        test.assertTextExists("EveryPass", "Description exists");
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can create a password, then hide, show and delete it.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        var data = CPASS_TEST.getTestData("www.consunet.com.au");
        CPASS_TEST.addPassword(casper, test, data);

        var id = 'p0';
        CPASS_TEST.assertPasswordBodyHidden(test, id);

        // Reveal the password
        CPASS_TEST.togglePwd(casper, id);
        CPASS_TEST.assertPasswordBodyShown(test, id);
        CPASS_TEST.verifyDataMatches(test, id, data);
        test.assertVisible('#' + id + '-go', "Go button is visible for " + id);

        // Hide the password again
        CPASS_TEST.togglePwd(casper, id);
        CPASS_TEST.assertPasswordBodyHidden(test, id);

        // Ensure that the option to confirm deletion is unchecked.
        C_TEST.openOptions(casper, test);
        casper.click('#opt-confirm-del');

        // Delete the entry
        CPASS_TEST.delPwd(casper, id);
        CPASS_TEST.assertPasswordNotExists(test, id);
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can create multiple passwords and search for them case-insensitively.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        var p0 = CPASS_TEST.getTestData("ABc");
        var p1 = CPASS_TEST.getTestData("def");
        var p2 = CPASS_TEST.getTestData("ghi");
        var p3 = CPASS_TEST.getTestData("jkl");
        var p4 = CPASS_TEST.getTestData("abcd");

        CPASS_TEST.addPassword(casper, test, p0);
        CPASS_TEST.addPassword(casper, test, p1);
        CPASS_TEST.addPassword(casper, test, p2);
        CPASS_TEST.addPassword(casper, test, p3);
        CPASS_TEST.addPassword(casper, test, p4);

        CPASS_TEST.search(casper, "a");
        CPASS_TEST.assertPasswordBodyHidden(test, 'p0');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p1');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p2');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p3');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p4');

        // After 'ab' the non-matches should be hidden
        CPASS_TEST.search(casper, "b");
        CPASS_TEST.assertPasswordBodyHidden(test, 'p0');
        CPASS_TEST.assertPasswordHidden(test, 'p1');
        CPASS_TEST.assertPasswordHidden(test, 'p2');
        CPASS_TEST.assertPasswordHidden(test, 'p3');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p4');

        CPASS_TEST.search(casper, "c");
        CPASS_TEST.assertPasswordBodyHidden(test, 'p0');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p4');

        // Once there is a single match the password body should be shown
        CPASS_TEST.search(casper, "d");
        CPASS_TEST.assertPasswordBodyShown(test, 'p4');
        test.assertNotVisible('#p4-go', "Go button is not visible for p4, which is not a URL");
        CPASS_TEST.verifyDataMatches(test, 'p4', p4);

        // Once the search is reset, the passwords are hidden again
        CPASS_TEST.search(casper, "a", true);
        CPASS_TEST.assertPasswordBodyHidden(test, 'p0');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p1');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p2');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p3');
        CPASS_TEST.assertPasswordBodyHidden(test, 'p4');

    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can create a password, add more details to form without adding, then encrypt it.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        CPASS_TEST.addPassword(casper, test);
        var id = 'p0';

        // Simulates adding details to form without clicking add
        casper.fillSelectors('form#new-entry', CPASS_TEST.getTestData("abc"), false);

        var encValues = {"#enc-password": TEST_PASSWORD, "#enc-hint": TEST_HINT};
        this.fillSelectors('form#encrypt', encValues, false);

        // Simulates the user clicking on Encrypt - like executing:
        // this.click('#do-encrypt');
        // Without the Casper test hanging at this point, waiting for User to save file
        var testEncryptedHtml = this.page.evaluate(function() {
            SCA.encryptAndEmbedData();
            return SCA.getDocumentHtml();
        });

        // Password should be deleted on encryption
        CPASS_TEST.assertPasswordNotExists(test, id);
        fs.write("public_html/test_encrypted.html", testEncryptedHtml);
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Does not import bad data.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        this.page.evaluate(function() {
            var badText = '<meta name="sca-app-type" content="EveryPass">' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":100,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","iv":"3/fid049KhK4Yw/tGhRUGw==","salt":"yQVb651u3aY=","adata":"YSBh","ct":"SPTYJPHQEeE7kcsbTAUgugd+CZ6IaNIc7YXI1WvmcidiOz2dJ9/tn6DkvFBqlBFwPFvFhD5ganzdVeWA6H8Rytu94YbTCGBXzawVV+FFnRjGok53EQ6+I9uRCin95b3Lu4MSd2z+5Y1zAx3+xt5nVe0="};</script>';
            SCA.processImportedFileText(badText);
        });
        
        C_TEST.assertFormIsLocked(casper, test, false);
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can import good data.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        this.page.evaluate(function() {
            var goodText = '<meta name="sca-app-type" content="EveryPass" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"9crMqEZL+3I=","iv":"xPZr3cdl6FzORmsbajidRA==","adata":"YQ==","ct":"szz3oOygcA5dq885EWFZSJaCAP8YbJckeDRGlCgn1F5i529fnqFSJvxGaMfVy9nisZ967zgvr52rBA=="};</script>';
            SCA.processImportedFileText(goodText);
        });

        C_TEST.assertFormIsLocked(casper, test, true);
    }).run(function() {
        test.done();
    });
});

casper.test.begin('When bad options are set an error shows.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        C_TEST.setCommonOptions(casper, test, "#$*&Y", "-1");
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
        var wrongDecPassword = {"#dec-password": "wrongpassword"};
        this.fillSelectors('form#decrypt', wrongDecPassword, false);
        this.click('#do-decrypt');
        test.assertTextExists("Incorrect password, or data has been corrupted", "Bad password error exists");
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can do decrypt of encrypted file.', function suite(test) {
    casper.start(TEST_ENCRYPTED_URL).then(function() {
        var rightDecPassword = {"#dec-password": "password"};
        test.assertTextExists(TEST_HINT, "Hint exists");

        this.fillSelectors('form#decrypt', rightDecPassword, false);
        this.click('#do-decrypt');

        C_TEST.assertBrowserUnsupportedMessageIsShown(test, false);

        var id = 'p0';
        CPASS_TEST.assertPasswordBodyHidden(test, id);

        // Reveal the decrypted password
        CPASS_TEST.togglePwd(casper, id);
        CPASS_TEST.assertPasswordBodyShown(test, id);
        CPASS_TEST.verifyDataMatches(test, id, CPASS_TEST.getTestData());
        
        id = 'p1';
        CPASS_TEST.assertPasswordBodyHidden(test, id);
        CPASS_TEST.togglePwd(casper, id);
        CPASS_TEST.assertPasswordBodyShown(test, id);
        CPASS_TEST.verifyDataMatches(test, id, CPASS_TEST.getTestData("abc"));
    }).run(function() {
        test.done();
    });
});
