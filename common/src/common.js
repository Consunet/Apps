/**
 * @file common functions to encapsulate interface logic for Self-Contained Apps
 */

/**
 * @namespace SCA
 * @type {object}
 * @description
 * <p>
 * These common functions are used to interact with the DOM to provide an interface for 
 * Self-Contained apps.
 * They provide a basic level of abstraction above standard DOM manipulation methods.
 * </p>
 */
var SCA = {
    /**
     * A shortcut for {@link http://www.w3schools.com/jsref/met_document_getelementbyid.asp}.
     * 
     * @param {string} id - the element ID.
     * @returns {Element}
     */
    e: function (id) {
        return document.getElementById(id);
    },
    /**
     * Sets the style:display attribute of an element
     * 
     * @param {string} id - the element ID to set the display attribute for
     * @param {string} display - the display attribute value to set
     */
    setDisplay: function (id, display) {
        this.e(id).style.display = display;
    },
    /**
     * Used to determine if an element is shown or not.
     * 
     * @param {string} id - the element ID to query for
     * @returns {Boolean} true if the element is visible, false otherwise
     */
    isShown: function (e) {
        return this.e(e).style.display !== "none";
    },
    /**
     * Gets the value of an input element, and then clears the value.
     * Need to be agressive so that user data isn't left behind in the DOM.
     * 
     * @param {string} id - the ID of the input element
     * @returns {string} the input element value
     */
    getAndClear: function (id) {
        var element = this.e(id);
        var value = element.value;
        element.value = "";
        element.innerHtml = "";
        return value;
    },
    /**
     * Validates the password value to enforce non-empty password.
     * Prompts the user if the password if the supplied password is weak.
     * @returns {Boolean} true if the encrypting should proceed, false otherwise.
     */
    checkEncPass: function () {
        var encPass = this.e("enc-password").value;
        this.validateEncPass();
        if (encPass.length === 0) {
            alert("<%= PasswordCannotBeEmpty %>");
            return false;
        }

        var feedback = this.e("enc-password-fb").innerHTML;
        if (feedback === "<%= Password %>: <%= Weak %>") {
            return confirm("<%= WeakPasswordUsedWarning %>");
        }

        return true;
    },
    /**
     * Gets and clears the encryption password field.
     * 
     * @returns {string} the encryption password.
     */
    getEncPass: function () {
        return this.getAndClear("enc-password");
    },
    /**
     * Gets and clears the encryption hint field.
     * 
     * @returns {string} the encryption hint.
     */
    getEncHint: function () {
        return this.getAndClear("enc-hint");
    },
    /**
     * Gets and clears the decryption password field.
     * 
     * @returns {string} the decryption password.
     */
    getDecPass: function () {
        return this.getAndClear("dec-password");
    },
    /**
     * Returns the entire document HTML including DOCTYPE.
     * @returns {String} - the document HTML.
     */
    getDocumentHtml: function () {
        var node = document.doctype;
        var htmlDoctype = "";
        if (node) {
            htmlDoctype = "<!DOCTYPE " + node.name +
                    (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') +
                    (!node.publicId && node.systemId ? ' SYSTEM' : '') +
                    (node.systemId ? ' "' + node.systemId + '"' : '') + '>';
        }

        return htmlDoctype + document.documentElement.outerHTML;
    },
    /**
     * Saves the entire HTML document out to a file.
     */
    saveDocument: function () {
        saveAs(
                new Blob(
                        [this.getDocumentHtml()],
                        {type: "application/xhtml+xml;charset=" + document.characterSet}
                ),
                this.getSaveFilename() + ".html"
                );
    },
    /**
     * Returns a cloned JSON object containing cypher settings.
     * 
     * @returns {object} a cloned JSON object containing cypher settings.
     */
    getClonedCypherSettings: function () {
        return JSON.parse(JSON.stringify(CONST.cypherSettings));
    },   
    /**
     * Reads the selected file input and performs the import.
     */
    importFile: function () {
        var files = this.e('import').files;
        var file = files[0];
        var fileReader = new FileReader();
        fileReader.onload = function () {
            SCA.processImportedFileText(this.result);
        };

        fileReader.readAsText(file);
    },
    /**
     * Processes the imported file text to ensure that it is correctly formatted, and is valid.
     * If validation succeeds, the encrypted data is embedded into the document.
     * 
     * @param {string} text - the entire text of the imported file.
     */
    processImportedFileText: function (text) {
        try {
            // Validates the application type
            var appTypeMatches = CONST.regexAppType.exec(text);
            if (!(appTypeMatches && appTypeMatches.length === 2)) {
                throw "<%= CouldNotDetermineAppType %>";
            }

            if (appTypeMatches[1] !== CONST.appName) {
                throw "<%= IncorrectAppType %>";
            }

            // Validates the encrypted data
            var encDataMatches = CONST.regexEncryptedData.exec(text);
            if (!(encDataMatches && encDataMatches.length === 2)) {
                throw "<%= FileFormatIncorrect %>";
            }

            var parsed = JSON.parse(encDataMatches[1]);
            var clonedCypherSettings = this.getClonedCypherSettings();

            // Validates the cypher settings
            for (var key in CONST.cypherSettings) {
                // new keys may have been added to CONST.cypherSettings in later versions,
                // which should not cause an InvalidCypherSettings error. So
                // testing for null for 'parsed[key]'.
                if (parsed[key] != null && parsed[key] !== CONST.cypherSettings[key]) {
                    throw "<%= InvalidCypherSettings %>";
                }
            }

            // Validate variable cypher settings
            for (var key in CONST.variableCypherSettings) {
                var expect = CONST.variableCypherSettings[key];
                var value = parsed[key];
                var mandatoryValueWrong = expect.mandatory && typeof (value) !== expect.type;
                var nonMandatoryValueWrong = (!expect.mandatory && value && typeof (value) !== expect.type);
                if (mandatoryValueWrong || nonMandatoryValueWrong) {
                    throw "Bad " + expect.desc;
                } else {
                    clonedCypherSettings[key] = parsed[key];
                }
            }
            encData = clonedCypherSettings;
            
            var encDataMatches = CONST.regexEncryptedData.exec("");
            var appTypeMatches = CONST.regexAppType.exec("");
            
            SCA.doOnload();
        } catch (e) {
            console.log(e);
            alert("<%= ImportFailed %>" + e);
        }
    },
    /**
     * Shows an error if the decryption process has failed.
     * 
     * @param {boolean} show - true if the error should be shown, otherwise it is cleared.
     */
    showDecryptError: function (show) {
        var passGroup = this.e("dec-password-group");

        if (show) {
            passGroup.setAttribute("class", "form-group has-error");
            this.e("dec-password-help").innerHTML = "<%= IncorrectPassword %>";
        } else {
            passGroup.setAttribute("class", "form-group");
            this.e("dec-password-help").innerHTML = "";
        }
    },
    /**
     * Shows help information about the app
     */
    showAbout: function () {
        SCA.displayHelp(true);
    },

    /**
     * Converts from an ArrayBuffer to a String.
     * <p>
     * Should be replaced by use of TextDecoder once that API is available in all
     * browsers of interest...
     * <p>
     * Implementation of this function has been based on ab2str function at:
     * https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String?hl=en
     * 
     * @param {ArrayBuffer} arrayBuffer
     * @returns {DOMString}
     */
    convertArrayBufferToUtf16String: function (arrayBuffer) {
        return String.fromCharCode.apply(null, new Uint16Array(arrayBuffer));
    },

    /**
     * Converts from a String to an ArrayBuffer.
     * <p>
     * Should be replaced by use of TextEncoder once that API is available in all
     * browsers of interest...
     * <p>
     * Implementation of this function has been based on str2ab function at:
     * https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String?hl=en
     * 
     * @param {DOMString} domString
     * @returns {ArrayBuffer}
     */
    convertUtf16StringToArrayBuffer: function (utf16String) {
        var buf = new ArrayBuffer(utf16String.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = utf16String.length; i < strLen; i++) {
            bufView[i] = utf16String.charCodeAt(i);
        }
        return buf;
    },

    /**
     * Converts a Uint8Array to a displayable, Base64 string:
     * (copied from "http://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string")
     * 
     * @param {type} uint8Array expected to be cypher bytes.
     * @returns {Base64 string} base64 string representation of the given cypher bytes.
     */
    convertUint8ArrayToBase64String: function (uint8Array) {
        var CHUNK_SIZE = 0x8000; //arbitrary number
        var index = 0;
        var length = uint8Array.length;
        var result = '';
        var slice;
        while (index < length) {
            slice = uint8Array.subarray(index, Math.min(index + CHUNK_SIZE, length));
            result += String.fromCharCode.apply(null, slice);
            index += CHUNK_SIZE;
        }
        return btoa(result);
    },
    /**
     * Converts Base64 string, to a Uint8Array. Reversing the above 
     * 'convertUint8ArrayToBase64String()' function.
     * 
     * @param {type} str the base64 string to convert.
     * @returns {Uint8Array} the return array, which is expected to be cypher bytes.
     */
    convertBase64StringToUint8Array: function (base64String) {
        var array = window.atob(base64String);
        var retval = new Uint8Array(array.length);
        for (var i = 0; i < array.length; i++) {
            retval[i] = array.charCodeAt(i);
        }
        return retval;
    },
    /**
     * Sets up the encryption parameters, encrypts the plaintext and 
     * stores the JSON object in the encrypted-data section of the document.
     * 
     * @param {function} callback - a callback to enable specific actions to be
     * taken on the given encrypt parameters. The callback is required to 
     * return a Promise.
     * @return {Promise} when resolved page values shall be encrypted and stored
     * ready for persistence.
     */
    encryptWith: function (callback) {

        var me = this;

        var retval = new Promise(function (resolve, reject) {
       
            if (!me.checkEncPass()) {
                reject(Error("User rejected Password."));
            }
            

            var cs = me.getClonedCypherSettings();
            var iv = new Uint8Array(16);
            window.crypto.getRandomValues(iv);
            cs.v = CONST.version;
            cs.iv = me.convertUint8ArrayToBase64String(iv);

            var password = me.getEncPass();

            var adata = me.getEncHint();
            cs.adata = adata;

            var plaintext = {
                opts: me.readOptions(),
                pl: me.getPayload()
            };

            var sc = window.crypto.subtle;

            var cryptoKey;

            var keyBuffer = me.convertUtf16StringToArrayBuffer(password);
            sc.digest(cs.keyHashAlgorithm, keyBuffer).then(function (keyHash) {

                sc.importKey(
                        'raw',
                        keyHash,
                        {name: cs.cipherAlgorithm},
                        false,
                        ['encrypt', 'decrypt']
                        ).then(function (key) {
                    cryptoKey = key;

                    var plainTextStr = JSON.stringify(plaintext);
                    var plainTextBuffer = me.convertUtf16StringToArrayBuffer(plainTextStr);
                    var ivBuffer = iv.buffer;
                    var encryptPromise = sc.encrypt({'name': cs.cipherAlgorithm, 'iv': ivBuffer}, key, plainTextBuffer);

                    encryptPromise.then(
                            function (val) {
                                var byteArray = new Uint8Array(val);
                                cs.ct = me.convertUint8ArrayToBase64String(byteArray);

                                // Call the callback to do specific actions with encrypt parameters
                                var callbackPromise = callback(cs, cryptoKey, iv, adata);
                                callbackPromise.then(function () {
                                    // Embed encrypted data into the DOM
                                    var cypherData = "var encData=" + JSON.stringify(cs) + ";";
                                    me.e("encrypted-data").innerHTML = cypherData;

                                    // Reset the document
                                    encData = CONST.cypherSettings;

                                    me.setDisplay("nojavascript", "inline");
                                    me.setDisplay("unsupported", "none");
                                    me.setDisplay("locked", "none");
                                    me.setDisplay("unlocked", "none");
                                    me.displayOptions(false);
                                    me.resetHelp();
                                    me.displayTimeout(false);

                                    var fbGroup = me.e("enc-password-fb-group");
                                    fbGroup.style.display = "none";
                                    fbGroup.setAttribute("class", "form-group");
                                    me.e("enc-password-fb").innerHTML = "";
                                    me.e("enc-password-group").setAttribute("class", "form-group");
                                    resolve(); // resolving retval.
                                });
                            });
                }).catch(
                        function (reason) {
                            reject(reason);
                        }
                );
            });
        });

        return retval;
    },
    /**
     * Sets up and decrypts the cypher text, unlocking the user interface
     * if successful.
     * @param {function} callback - a callback to enable specific actions to be
     * taken on the given decrypt parameters. The callback is required to 
     * return a Promise.
     * @return {Promise} when resolved, the decryption has been completed and the
     * page fields populated.
     */
    decryptWith: function (callback) {

        // if prior to version 1.4 use SJCL to perform decryption.
        if (encData.v < 1.4) {
            // down this branch, the callback will be passed a SJCL algorithum/password pair.
            return this.decryptWithSJCL(callback);
        }
        // on this main branch, callback will be passed a CryptoKey.

        var me = this;

        var sc = window.crypto.subtle;

        // Setup decryption parameters
        var password = me.getDecPass();
        var iv = me.convertBase64StringToUint8Array(encData.iv);
        var adata = encData.adata;

        var retval = new Promise(function (resolve, reject) {
            var keyBuffer = me.convertUtf16StringToArrayBuffer(password);
            sc.digest(encData.keyHashAlgorithm, keyBuffer).then(function (keyHash) {
                sc.importKey('raw',
                        keyHash,
                        {name: encData.cipherAlgorithm},
                        false,
                        ['encrypt', 'decrypt']).then(function (key) {
                    var ivBuffer = iv.buffer;
                    var data = me.convertBase64StringToUint8Array(encData.ct);
                    var dataBuffer = data.buffer;

                    var decryptPromise = sc.decrypt({'name': encData.cipherAlgorithm, 'iv': ivBuffer}, key, dataBuffer);

                    decryptPromise.then(function (dec) {
                        var payload = me.convertArrayBufferToUtf16String(dec);

                        // Version 1.3 and onwards includes options as part of the payload (if here must be 1.4 or later)
                        var parsed = JSON.parse(payload);
                        var opts = parsed.opts;
                        payload = parsed.pl;

                        // Call with the decrypted contents and parameters
                        var callbackPromise = callback(encData.v, key, iv, adata, payload);

                        callbackPromise.then(function () {
                            me.setOptions(opts);
                            me.setUnlocked(true);
                            me.displayTimeout(true);
                            me.showDecryptError(false);
                            me.e("enc-password").value = password;
                            me.e("enc-hint").value = adata;

                            resolve(); // resolving retval.
                        });
                    }).catch(
                        function (reason) {
                            me.showDecryptError(true); 
                            reject(reason);
                        }
                    );
                });                
            }).catch(
                function (reason) {      
                    reject(reason);
                }
            );
        });

        return retval;
    },
    /**
     * This function exists to decrypt files which were encrypted in version 1.3
     * or earlier. All new encryption from version 1.4 onwards shall use the 
     * WebCrypto API.
     * <p>
     * Sets up and decrypts the cypher text, unlocking the user interface
     * if successful.
     * @param {function} callback - a callback to enable specific actions to be
     * taken on the given decrypt parameters.
     */
    decryptWithSJCL: function (callback) {
        var me = this;

        // Setup decryption parameters
        var password = this.getDecPass();
        var salt = sjcl.codec.base64.toBits(encData.salt);
        var iv = sjcl.codec.base64.toBits(encData.iv);
        var adata = sjcl.codec.base64.toBits(encData.adata);
        var t1 = sjcl.misc.pbkdf2(password, salt, encData.iter);
        var prp = new sjcl.cipher[encData.cipher](t1);
        var data = sjcl.codec.base64.toBits(encData.ct);

        return new Promise(function (resolve, reject) {
            try {
                var dec = sjcl.mode[encData.mode].decrypt(prp, data, iv, adata, encData.ts);
                var payload = sjcl.codec.utf8String.fromBits(dec);
                var opts = me.getDefaultOptions();

                // Version 1.3 and onwards includes options as part of the payload
                if (encData.v > 1.2) {
                    var parsed = JSON.parse(payload);
                    opts = parsed.opts;
                    payload = parsed.pl;
                }

                // Call with the decrypted contents and parameters
                var callbackPromise = callback(encData.v, prp, iv, adata, payload);
                callbackPromise.then(function () {
                    me.setOptions(opts);
                    me.setUnlocked(true);
                    me.displayTimeout(true);
                    me.showDecryptError(false);
                    me.e("enc-password").value = password;
                    me.e("enc-hint").value = sjcl.codec.utf8String.fromBits(adata);
                    resolve();
                }).catch(function (reason) {
                    reject(reason);
                });

            } catch (e) {
                me.showDecryptError(true);
                reject(e);
            }
        });
    },
    /**
     * Validates the current encryption password, providing feedback
     * to the user about its strength.
     */
    validateEncPass: function () {
        var pass = this.e("enc-password").value;
        var score = this.getPasswordStrength(pass);
        var formClass = "form-group";
        var feedback = "<%= Password %>: ";
        if (score === 0) {
            formClass += " has-error";
            feedback += "<%= Empty %>!";
        } else if (score < 0.65) {
            formClass += " has-error";
            feedback += "<%= Weak %>";
        } else if (score < 0.95) {
            formClass += " has-warning";
            feedback += "<%= OK %>";
        } else {
            formClass += " has-success";
            feedback += "<%= Strong %>";
        }

        var fbGroup = this.e("enc-password-fb-group");
        fbGroup.style.display = "inline-block";
        fbGroup.setAttribute("class", formClass);
        this.e("enc-password-fb").innerHTML = feedback;
        this.e("enc-password-group").setAttribute("class", formClass);
    },
    /**
     * A simple function to calculate the strength of a password based on
     * its length and content.
     * The returned score is normalized against a desired password length,
     * and the desired password length is based on whether the password contains
     * various combinations of mixed case alphanumeric characters.
     * It is based on the entropy definitions on Wikipedia:
     * http://en.wikipedia.org/wiki/Password_strength#Bit_strength_threshold
     * 
     * @param {string} password - the password to assess.
     * @returns {Number} the normalized score.
     */
    getPasswordStrength: function (password) {
        // 96 bits of entropy for just Arabic numerals
        var desiredLength = 29;
        var matchesNumeric = password.match(/[0-9].*[0-9]/);
        var matchesLower = password.match(/[a-z].*[a-z]/);
        var matchesUpper = password.match(/[A-Z].*[A-Z]/);
        var matchesSymbol = password.match(/[\W].*[\W]/);

        if (matchesNumeric && matchesLower && matchesUpper) {
            desiredLength = 17;
        } else if (matchesNumeric && matchesLower) {
            desiredLength = 19;
        } else if (matchesNumeric && matchesUpper) {
            desiredLength = 19;
        } else if (matchesLower && matchesUpper) {
            desiredLength = 17;
        } else if (matchesLower || matchesUpper) {
            desiredLength = 21;
        }

        if (matchesSymbol) {
            desiredLength -= 2;
        }

        var score = password.length / desiredLength;
        return score;
    },
    /**
     * Used to display or hide the help alert.
     * @param {boolean} isDisplay - true to display the help, false to hide it
     */
    displayHelp: function (isDisplay) {
        var display = isDisplay ? "block" : "none";
        this.setDisplay("help-screen", display);
    },
    /**
     * Used to toggle the detailed help section of the help alert.
     */
    toggleHelpDetail: function () {
        var isDetailed = this.isHelpDetailed();
        var display = isDetailed ? "none" : "block";
        var toggle = isDetailed ? "<%= more %>" : "<%= less %>";
        this.setDisplay("help-detail", display);
        this.e("help-toggle").innerHTML = toggle;
    },
    /**
     * Determines if the detailed help section is displayed or not.
     * @returns {Boolean} true if displayed, false otherwise.
     */
    isHelpDetailed: function () {
        return this.e("help-detail").style.display === 'block';
    },
    /**
     * Resets the help alert to its original state (e.g. before the
     * encrypted document is saved).
     */
    resetHelp: function () {
        if (this.isHelpDetailed()) {
            this.toggleHelpDetail();
        }
        this.displayHelp(false);
    },
    /**
     * Used to toggle the state of the menu.
     * @returns {undefined}
     */
    toggleMenu: function () {
        if (this.isShown("menu")) {
            this.displayMenu(false);
        } else {
            this.displayMenu(true);
        }
    },
    /**
     * Used to display or hide the menu.
     * @param {boolean} isDisplay - true to display the menu, false to hide it
     */
    displayMenu: function (isDisplay) {
        var display = isDisplay ? "inline" : "none";
        this.setDisplay("menu", display);
    },
    /**
     * Used to display or hide the options.
     * @param {boolean} isDisplay - true to display the options, false to hide it
     */
    displayOptions: function (isDisplay) {
        var display = isDisplay ? "block" : "none";
        this.setDisplay("options-screen", display);
    },
    /**
     * Handles all mouse click events in the app.
     * @param {type} source - the source of the event.
     */
    handleMouseClick: function (source) {
        var target = source.target || source.srcElement;

        // Hide the menu unless we are clicking on the show menu button
        if (target.id === "menu-button") {
            SCA.toggleMenu();
        } else {
            SCA.displayMenu(false);
        }

        // Reset the timer if we are counting down.
        if (SCA.isTimingOut) {
            SCA.resetTimeout();
        }
    },
    /**
     * Adds a class to a particular element
     * @param {type} id the id of the element to add to
     * @param {type} className the class to add
     */
    addClass: function (id, className) {
        var ele = this.e(id);
        ele.classList.add(className);
    },

    /**
     * Removes a class from a particular element
     * @param {type} id the id of the element to remove from
     * @param {type} className the class to remove
     */
    removeClass: function (id, className) {
        var ele = this.e(id);
        ele.classList.remove(className);
    },
    /**
     * Used to enforce numeric input for form inputs. 
     * @param {type} evt the event
     * @returns {Boolean} true if the key was numeric, false otherwise.
     */
    isNumericKey: function (evt) {
        var charCode = (evt.which) ? evt.which : evt.keyCode
        if (charCode > 31 && (charCode < 48 || charCode > 57))
            return false;
        return true;
    },
    /**
     * Get a set of default options.
     * @returns
     */
    getDefaultOptions: function () {
        return {
            saveFileName: CONST.appName,
            timeoutPeriodMins: CONST.defaultTimeoutPeriodMins
        };
    },
    /**
     * Sets the options to reasonable default values.
     */
    setDefaultOptions: function () {
        this.setOptions(this.getDefaultOptions());
    },
    /**
     * Validates the save filename value and shows an error if it is invalid.
     */
    validateSaveFilename: function () {
        if (!this.isSaveFilenameValid()) {
            this.addClass("opt-save-filename-group", "has-error");
            this.e("opt-save-filename-help").innerHTML = "<%= InvalidFilename %>: " + CONST.appName;
        } else {
            this.removeClass("opt-save-filename-group", "has-error");
            this.e("opt-save-filename-help").innerHTML = "";
        }
    },
    /**
     * Gets the save filename value or resets it to a default value if it is invalid.
     */
    getSaveFilename: function () {
        if (!this.isSaveFilenameValid()) {
            this.e("opt-save-filename").value = CONST.appName;
            this.validateSaveFilename();
        }
        return this.e("opt-save-filename").value;
    },
    /**
     * @returns true if the save filename is valid, false otherwise.
     */
    isSaveFilenameValid: function () {
        var saveFilename = this.e("opt-save-filename").value;
        return saveFilename.match(/\w+/) && !saveFilename.match(/\W+/);
    },
    /**
     * Shows/Hides the timeout display
     * @param {Boolean} isDisplay true if the timeout should be displayed, false otherwise.
     */
    displayTimeout: function (isDisplay) {
        if (isDisplay) {
            this.resetTimeout();
            this.isTimingOut = true;
            clearInterval(this.timeoutHandler);
            this.timeoutHandler = setInterval("SCA.decrement()", 1000);
        } else {
            clearInterval(this.timeoutHandler);
            this.e("timeout-value").innerHTML = "";
        }
    },
    /**
     * Validates the timeout value and shows an error if it is invalid.
     */
    validateTimeout: function () {
        if (!this.isTimeoutValid()) {
            this.addClass("opt-timeout-group", "has-error");
            this.e("opt-timeout-help").innerHTML = "<%= InvalidTimeout %>: " + CONST.defaultTimeoutPeriodMins;
        } else {
            this.removeClass("opt-timeout-group", "has-error");
            this.e("opt-timeout-help").innerHTML = "";
        }
    },
    /**
     * @returns true if the timeout is a valid number, false otherwise
     */
    isTimeoutValid: function () {
        var timeout = this.e("opt-timeout").value;
        return timeout.match(/\d+/) && !timeout.match(/\D+/);
    },
    /**
     * Gets the timeout value or resets it to a default value if it is invalid.
     */
    getTimeout: function () {
        if (!this.isTimeoutValid()) {
            this.e("opt-timeout").value = CONST.defaultTimeoutPeriodMins;
            this.validateTimeout();
        }
        return this.e("opt-timeout").value;
    },
    /**
     * Decrements the timeout value and causes a page refresh if it reaches 0.
     */
    decrement: function () {
        this.timeoutValueSecs -= 1;
        if (this.timeoutValueSecs === 0) {
            location.reload();
        }

        this.setTimeoutString();
    },
    /**
     * Pads the supplied number with a zero if required.
     * @param {type} num the number to pad.
     * @returns the padded number.
     */
    padNum: function (num) {
        var toStr = num.toString();
        if (toStr.length === 1) {
            return "0" + toStr;
        } else {
            return toStr;
        }
    },
    /**
     * Sets the timeout String displayed to the user.
     */
    setTimeoutString: function () {
        var minutes = this.padNum(Math.floor(this.timeoutValueSecs / 60.0) % 60);
        var hours = this.padNum(Math.floor(this.timeoutValueSecs / 3600.0));
        var secs = this.padNum(this.timeoutValueSecs % 60);
        if (secs < 0 && this.getTimeout() != 0) {
            secs = padNum(0);
        }
        if (hours < 0) {
            hours = padNum(0);
        }
        if (minutes < 0) {
            minutes = padNum(0);
        }
        var timeoutStr = hours + ":" + minutes + ":" + secs;
        // Make red if timeout is less than or equal to 30
        if (this.timeoutValueSecs <= 30) {
            this.addClass("timeout-value", "red");
        } else {
            this.removeClass("timeout-value", "red");
        }
        this.e("timeout-value").innerHTML = timeoutStr;
    },
    /**
     * Resets the timeout value to the one obtained from the user options.
     */
    resetTimeout: function () {
        this.timeoutValueSecs = parseInt(this.getTimeout()) * 60;
        this.setTimeoutString();
    },
    /**
     * Gets the browser name, and returns it as a String.
     * 
     * @returns {String}
     */
    getBrowserName: function () {
        var retval = "<unknown>";
        var ua = navigator.userAgent;
        var M = ua.match(/(opera|chrome|safari|firefox|msie|phantomjs)\/?\s*(\.?\d+(\.\d+)*)/i);
        M = M ? [M[1], M[2]] : null;
        if (M) {
            retval = M[0];
        }
        return retval;
    },
    /**
     * Initialises the app.
     */
    doOnload: function () {
        this.setDisplay("nojavascript", "none");

        if (document.addEventListener) {
            document.addEventListener('click', SCA.handleMouseClick, false);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', SCA.handleMouseClick, false);
        }

        try {
            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                throw "<%= FileOpsNotSupported %>";
            }

            // PhantomJS lacks WebCrypto API and Blob constructor.
            if (this.getBrowserName() !== "PhantomJS") {
                if (!(window.crypto && window.crypto.subtle)) {
                    throw "<%= WebCryptoAPINotSupported %>";
                }

                new Blob();
            }

            this.setDisplay("unsupported", "none");

            if (encData.ct && encData.iv) {
                this.setUnlocked(false);

                if (encData.adata) {
                    if (encData.v < 1.4) {
                        var decodedHint =
                        sjcl.codec.utf8String.fromBits(sjcl.codec.base64.toBits(encData.adata));
                        this.e("dec-hint").innerHTML = decodedHint;
                    } 
                    else
                    {
                        //1.4 or after
                        var decodedHint = encData.adata;
                        this.e("dec-hint").innerHTML = decodedHint;
                    }
                }

                this.e("dec-password").focus();
            } else {
                this.setDefaultOptions();
                this.setUnlocked(true);
                this.displayHelp(true);
            }

        } catch (e) {
            alert(e);
            console.log(e);
            this.setDisplay("unsupported", "inline");
        }
    }  
};