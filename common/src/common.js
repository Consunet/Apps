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
    e: function(id) {
        return document.getElementById(id);
    },

    /**
     * Sets the style:display attribute of an element
     * 
     * @param {string} id - the element ID to set the display attribute for
     * @param {string} display - the display attribute value to set
     */
    setDisplay: function(id, display) {
        this.e(id).style.display = display;
    },

    /**
     * Used to determine if an element is shown or not.
     * 
     * @param {string} id - the element ID to query for
     * @returns {Boolean} true if the element is visible, false otherwise
     */
    isShown: function(e) {
        return this.e(e).style.display !== "none";
    },

    /**
     * Gets the value of an input element, and then clears the value.
     * Need to be agressive so that user data isn't left behind in the DOM.
     * 
     * @param {string} id - the ID of the input element
     * @returns {string} the input element value
     */
    getAndClear: function(id) {
        var element = this.e(id);
        var value = element.value;
        element.value = "";
        try {
            element.innerHtml = "";
        } catch (e){
        }
        return value;
    },  
            
    /**
     * Validates the password value to enforce non-empty password.
     * Prompts the user if the password if the supplied password is weak.
     * @returns {Boolean} true if the encrypting should proceed, false otherwise.
     */
    checkEncPass: function() {
        var encPass = this.e("enc-password").value;
        this.validateEncPass();
        if (encPass.length === 0) {
            alert("Password cannot be empty!");
            return false;
        }
        
        var feedback = this.e("enc-password-fb").innerHTML;
        if (feedback === "Password: Weak") {
            return confirm("Weak password used - proceed with Encrypt?");
        }
        
        return true;
    },
            
    /**
     * Gets and clears the encryption password field.
     * 
     * @returns {string} the encryption password.
     */
    getEncPass: function() {
        return this.getAndClear("enc-password");
    },

    /**
     * Gets and clears the encryption hint field.
     * 
     * @returns {string} the encryption hint.
     */
    getEncHint: function() {
        return this.getAndClear("enc-hint");
    },
            
    /**
     * Gets and clears the decryption password field.
     * 
     * @returns {string} the decryption password.
     */
    getDecPass: function() {
        return this.getAndClear("dec-password");
    },

    /**
     * Gets and clears the decryption hint field.
     * 
     * @returns {string} the decryption hint.
     */
    getDecHint: function() {
        return this.getAndClear("dec-hint");
    },
    
    /**
     * Returns the entire document HTML including DOCTYPE.
     * @returns {String} - the document HTML.
     */
    getDocumentHtml: function() {
        var node = document.doctype;
        var htmlDoctype = "";
        if (node) {
            htmlDoctype = "<!DOCTYPE " + node.name + 
                (node.publicId ? ' PUBLIC "' + node.publicId + '"' : '') + 
                (!node.publicId && node.systemId ? ' SYSTEM' : '')  + 
                (node.systemId ? ' "' + node.systemId + '"' : '') + '>';
        }
        
        return htmlDoctype + document.documentElement.outerHTML;
    },

    /**
     * Saves the entire HTML document out to a file.
     */
    saveDocument: function() {
        saveAs(
            new Blob(
                [this.getDocumentHtml()], 
                {type: "application/xhtml+xml;charset=" + document.characterSet}
            ),
            CONST.appName + ".html"
        );
    },
            
     /**
     * Returns a cloned JSON object containing cypher settings.
     * 
     * @returns {object} a cloned JSON object containing cypher settings.
     */
    getClonedCypherSettings: function() {
        return JSON.parse(JSON.stringify(CONST.cypherSettings));
    },
            
    /**
     * Performs a click on the "import" file input.
     */
    clickImport: function() {
        this.e("import").click();
    },

    /**
     * Reads the selected file input and performs the import.
     */
    importFile: function() {
        var files = this.e('import').files;
        var file = files[0];
        var fileReader = new FileReader();
        fileReader.onload = function() {
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
    processImportedFileText: function(text) {
        try {
            // Validates the application type
            var appTypeMatches = CONST.regexAppType.exec(text);
            if (!(appTypeMatches && appTypeMatches.length === 2)) {
                throw CONST.errorApplicationTypeNotFound;
            }

            if (appTypeMatches[1] !== CONST.appName) {
                throw CONST.errorWrongApplicationType;
            }
            
            // Validates the encrypted data
            var encDataMatches = CONST.regexEncryptedData.exec(text);
            if (!(encDataMatches && encDataMatches.length === 2)) {
                throw CONST.errorImportFileFormat;
            }

            var parsed = JSON.parse(encDataMatches[1]);
            var clonedCypherSettings = this.getClonedCypherSettings();

            // Validates the cypher settings
            for (var key in CONST.cypherSettings) {
                if (parsed[key] !== CONST.cypherSettings[key]) {
                    throw CONST.errorInvalidCypherSettings;
                }
            }

            // Validate variable cypher settings
            for (var key in CONST.variableCypherSettings) {
                var expect = CONST.variableCypherSettings[key];
                var value = parsed[key];
                var mandatoryValueWrong = expect.mandatory && typeof(value) !== expect.type;
                var nonMandatoryValueWrong = (!expect.mandatory && value && typeof(value) !== expect.type);
                if (mandatoryValueWrong || nonMandatoryValueWrong) {
                    throw "Bad " + expect.desc;
                } else {
                    clonedCypherSettings[key] = parsed[key];
                }
            }
            encData = clonedCypherSettings;
            SCA.doOnload();
        } catch(e) {
            console.log(e);
            alert(CONST.errorImportFailed + e);
        }
    },            

    /**
     * Shows an error if the decryption process has failed.
     * 
     * @param {boolean} show - true if the error should be shown, otherwise it is cleared.
     */
    showDecryptError: function(show) {
        var passGroup = this.e("dec-password-group");

        if (show) {
            passGroup.setAttribute("class", "form-group has-error");
            this.e("dec-password-help").innerHTML = CONST.errorDecrypt;
        } else {
            passGroup.setAttribute("class", "form-group");
            this.e("dec-password-help").innerHTML = "";
        }
    },

    /**
     * Shows help information about the app
     */
    showAbout: function() {
        var contextualInfo = "";
        if (this.isShown("locked")) {
            contextualInfo = CONST.about.locked;
        } else if(this.isShown("unlocked")) {
            contextualInfo = CONST.about.unlocked;
        }
        SCA.displayHelp(true);
    },

    /**
     * Sets up the encryption parameters, encrypts the plaintext and 
     * stores the JSON object in the encrypted-data section of the document.
     * 
     * @param {function} callback - a callback to enable specific actions to be
     * taken on the given encrypt parameters.
     */
    encryptWith: function(callback) {
        if (!this.checkEncPass()) {
            return false;
        }
        
        var cs = this.getClonedCypherSettings();
        var salt = sjcl.random.randomWords(2, 2);
        var iv = sjcl.random.randomWords(4, 2);
        cs.salt = sjcl.codec.base64.fromBits(salt);
        cs.iv = sjcl.codec.base64.fromBits(iv);

        var pwd = sjcl.misc.pbkdf2(this.getEncPass(), salt, cs.iter);
        var prp = new sjcl.cipher[cs.cipher](pwd);
        var adata = sjcl.codec.utf8String.toBits(this.getEncHint());
        cs.adata = sjcl.codec.base64.fromBits(adata);
        
        var plaintext = sjcl.codec.utf8String.toBits(SCA.getPlaintext());
        var ct = sjcl.mode[cs.mode].encrypt(prp, plaintext, iv, adata, cs.ts);
        cs.ct = sjcl.codec.base64.fromBits(ct);
        
        // Call the callback to do specific actions with encrypt parameters
        callback(cs, prp, iv, adata);
        
        // Embed encrypted data into the DOM
        var cypherData = "var encData=" + JSON.stringify(cs) + ";";
        this.e("encrypted-data").innerHTML = cypherData;

        // Reset the document
        encData = CONST.cypherSettings;

        this.setDisplay("nojavascript", "inline");
        this.setDisplay("unsupported", "none");
        this.setDisplay("locked", "none");
        this.setDisplay("unlocked", "none");
        this.resetHelp();

        var fbGroup = this.e("enc-password-fb-group");
        fbGroup.style.display = "none";
        fbGroup.setAttribute("class", "form-group");
        this.e("enc-password-fb").innerHTML = "";
        this.e("enc-password-group").setAttribute("class", "form-group");
        return true;
    },
            
    /**
     * Sets up and decrypts the cypher text, unlocking the user interface
     * if successful.
     * @param {function} callback - a callback to enable specific actions to be
     * taken on the given decrypt parameters.
     */
    decryptWith: function(callback) {
        // Setup decryption parameters
        var password = this.getDecPass();
        var salt = sjcl.codec.base64.toBits(encData.salt);
        var iv = sjcl.codec.base64.toBits(encData.iv);
        var adata = sjcl.codec.base64.toBits(encData.adata);
        var t1 = sjcl.misc.pbkdf2(password, salt, encData.iter);
        var prp = new sjcl.cipher[encData.cipher](t1);
        var data = sjcl.codec.base64.toBits(encData.ct);
        
        try {
            var out = sjcl.mode[encData.mode].decrypt(prp, data, iv, adata, encData.ts);
            out = sjcl.codec.utf8String.fromBits(out);
            
            // Call with the decrypted contents and parameters
            callback(prp, iv, adata, out);
            
            this.setUnlocked(true);
            this.showDecryptError(false);
            this.e("enc-password").value = password;
            this.e("enc-hint").value = sjcl.codec.utf8String.fromBits(adata);
        } catch (e) {
            console.log(e);
            this.showDecryptError(true);
        }
    },

    /**
     * Validates the current encryption password, providing feedback
     * to the user about its strength.
     */
    validateEncPass: function() {
        var pass = this.e("enc-password").value;
        var score = this.getPasswordStrength(pass);
        var formClass = "form-group";
        var feedback = "Password: ";
        if (score === 0) {
            formClass += " has-error";
            feedback += "Empty!";
        } else if (score < 0.33) {
            formClass += " has-error";
            feedback += "Weak";
        } else if (score < 0.66) {
            formClass += " has-warning";
            feedback += "OK";
        } else {
            formClass += " has-success";
            feedback += "Strong";
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
     * and the score is boosted by the presence of non-word and uppercase characters.
     * 
     * @param {string} password - the password to assess.
     * @returns {Number} the normalized score.
     */
    getPasswordStrength: function(password) {
        var desiredLength = 20;
        var score = password.length;
        if (password.match(/[A-Z]/)) {
            score += 1;
        }
        
        if (password.match(/\W/)) {
            score += 2;
        }
        
        return score / desiredLength;
    },
            
    /**
     * Used to display or hide the help alert.
     * @param {boolean} isDisplay - true to display the help, false to hide it
     */
    displayHelp: function(isDisplay) {
        var display = isDisplay ? "block" : "none";
        this.setDisplay("help-screen", display);
    },
            
    /**
     * Used to toggle the detailed help section of the help alert.
     */
    toggleHelpDetail: function() {
        var isDetailed = this.isHelpDetailed();
        var display = isDetailed ? "none" : "block";
        var toggle = isDetailed ? "more" : "less";
        this.setDisplay("help-detail", display);
        this.e("help-toggle").innerHTML = toggle;
    },
            
    /**
     * Determines if the detailed help section is displayed or not.
     * @returns {Boolean} true if displayed, false otherwise.
     */
    isHelpDetailed: function() {
        return this.e("help-detail").style.display === 'block';
    },
            
    /**
     * Resets the help alert to its original state (e.g. before the
     * encrypted document is saved).
     */
    resetHelp: function() {
        if (this.isHelpDetailed()) {
            this.toggleHelpDetail();
        }
        this.displayHelp(false);
    },
            
    /**
     * Used to toggle the state of the menu.
     * @returns {undefined}
     */
    toggleMenu: function() {
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
    displayMenu: function(isDisplay) {
        var display = isDisplay ? "inline" : "none";
        this.setDisplay("menu", display);
    },  
            
    /**
     * Handles all mouse click events in the app.
     * @param {type} source - the source of the event.
     */
    handleMouseClick: function(source) {
        var target = source.target || source.srcElement;

        if (target.id === "menu-button") {
            SCA.toggleMenu();
        } else {
            SCA.displayMenu(false);
        }
    },
    
    /**
     * Adds a class to a particular element
     * @param {type} id the id of the element to add to
     * @param {type} className the class to add
     */
    addClass: function(id, className) {
        var ele = this.e(id);
        ele.classList.add(className);
    },
    
    /**
     * Checks for a class on a particular element
     * @param {type} id the id of the element to check
     * @param {type} className the class to check for
     * @return {Boolean} true if the element has that class, false otherwise.
     */
    hasClass: function(id, className) {
        var ele = this.e(id);
        return ele.classList.contains(className);
    },
    
    /**
     * Removes a class from a particular element
     * @param {type} id the id of the element to remove from
     * @param {type} className the class to remove
     */
    removeClass: function(id, className) {
        var ele = this.e(id);
        ele.classList.remove(className);
    },
            
    /**
     * Initialises the app.
     */
    doOnload: function() {
        this.setDisplay("nojavascript", "none");
        
        if (document.addEventListener) {
            document.addEventListener('click', SCA.handleMouseClick, false);
        } else if (document.attachEvent) {
            document.attachEvent('onclick', SCA.handleMouseClick, false);
        }

        try {
            if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
                throw "File operations not supported";
            }

            this.setDisplay("unsupported", "none");

            sjcl.random.startCollectors();
            if (encData.ct && encData.salt && encData.iv) {
                this.setUnlocked(false);

                if (encData.adata) {
                    var decodedHint = sjcl.codec.utf8String.fromBits(sjcl.codec.base64.toBits(encData.adata));
                    this.e("dec-hint").innerHTML = decodedHint;
                }
                this.e("dec-password").focus();
            } else {
                this.setUnlocked(true);
                this.displayHelp(true);
            }
            // Allows automated tests to pass with PhantomJS / Blob incompatiblity for now.
            new Blob();
        } catch (e) {
            alert(e);
            console.log(e);
            this.setDisplay("unsupported", "inline");
        }
    }
};