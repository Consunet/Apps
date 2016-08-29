

casper.test.begin('Can verify basic app details.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        test.assertTitle("WhisperNote Encrypted Note v1.3", "WhisperNote homepage title is the one expected");
        test.assertTextExists("WhisperNote", "Description exists");
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can create a note without an attachment, then encrypt it.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function () {
        CNOTE_TEST.addNote(casper, test, TEST_MESSAGE);

        // Do encrypt
        var encryptionPromise = C_TEST.encryptWith(casper, TEST_PASSWORD, TEST_HINT, "public_html/test_encrypted.html");
        encryptionPromise.then(function () {
            // Note should be deleted on encryption
            CNOTE_TEST.assertNoteText(casper, test, '');

            test.done();
        }).catch(function (reason) {
            test.fail(reason);
        });
    }).run();
});

casper.test.begin('Does not import bad WhisperNote data.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        this.page.evaluate(function() {
            var badText = '<meta name="sca-app-type" content="WhisperNote">' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":100,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","iv":"3/fid049KhK4Yw/tGhRUGw==","salt":"yQVb651u3aY=","adata":"YSBh","ct":"SPTYJPHQEeE7kcsbTAUgugd+CZ6IaNIc7YXI1WvmcidiOz2dJ9/tn6DkvFBqlBFwPFvFhD5ganzdVeWA6H8Rytu94YbTCGBXzawVV+FFnRjGok53EQ6+I9uRCin95b3Lu4MSd2z+5Y1zAx3+xt5nVe0="};</script>';
            SCA.processImportedFileText(badText);
        });
        
        C_TEST.assertFormIsLocked(casper, test, false);
    }).run(function() {
        test.done();
    });
});

casper.test.begin('Can import good WhisperNote data.', function suite(test) {
    casper.start(TEST_UNENCRYPTED_URL).then(function() {
        this.page.evaluate(function() {
            var goodText = '<meta name="sca-app-type" content="WhisperNote" />' + '<script id="encrypted-data" type="text/javascript">var encData={"v":1,"iter":1000,"ks":256,"ts":128,"mode":"ocb2","cipher":"aes","salt":"9crMqEZL+3I=","iv":"xPZr3cdl6FzORmsbajidRA==","adata":"YQ==","ct":"szz3oOygcA5dq885EWFZSJaCAP8YbJckeDRGlCgn1F5i529fnqFSJvxGaMfVy9nisZ967zgvr52rBA=="};</script>';
            SCA.processImportedFileText(goodText);
        });

        C_TEST.assertFormIsLocked(casper, test, true);
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

casper.test.begin('Can do decrypt of encrypted file.', function suite(test) {
    casper.start(TEST_ENCRYPTED_URL).then(function() {
        C_TEST.decryptWith(casper, "password");
        C_TEST.assertBrowserUnsupportedMessageIsShown(test, false);

        // Reveal the decrypted message
        CNOTE_TEST.assertNoteText(casper, test, TEST_MESSAGE);
    }).run(function() {
        test.done();
    });
});
