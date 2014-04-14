/**
 * @file functions to encapsulate interface logic for the Password Manager App
 */

/**
 * @namespace SCA
 * @type {object}
 * @description
 * <p>
 * These functions build upon the SCA namespace to provide an interface for the Password Manager app.
 * They provide a basic level of abstraction above standard DOM manipulation methods.
 * </p>
 */

/**
 * An integer which is used to provide a unique ID for password elements.
 * 
 * @type Number
 * @private
 */
SCA._nextPwdId = 0;

/**
 * Gets the pw-data hidden template for passwords, and caches its value for future use.
 * 
 * @returns {Element} the pw-data Element
 * @private
 */
SCA._divPwData = function() {
    if (!this.dPwData) {
        this.dPwData = this.e("pw-data");
    }
    return this.dPwData;
};

/**
 * Gets the pwds element which holds all password objects, and caches its value for future use.
 * 
 * @returns {Element} the pwds Element
 * @private
 */
SCA._divPwds = function() {
    if (!this.dPwds) {
        this.dPwds = this.e("pwds");
    }
    return this.dPwds;
};

/**
 * Creates a new password entry from reading form fields, and adds it to the DOM.
 */
SCA.newPwd = function() {
    var pwData = {
        s: this.getAndClear("new-service"),
        u: this.getAndClear("new-username"),
        p: this.getAndClear("new-password"),
        q: this.getAndClear("new-question"),
        a: this.getAndClear("new-answer")
    };

    this.addPwd(pwData);
    this.e("search").value = "";
    this.filterPwds();
};

/**
 * Adds a new password entry element to the DOM.
 * 
 * @param {object} item - the password JSON object to add
 */
SCA.addPwd = function(item) {
    var id = "p" + this._nextPwdId;
    this._nextPwdId += 1;

    var cloned = this._divPwData().innerHTML;
    var replaced = cloned.replace(/pwid/g, id).replace(":none", ":inherit");
    var div = document.createElement('div');
    div.id = id;
    div.innerHTML = replaced;
    this._divPwds().appendChild(div);
    this.e(id + "-service").value = item.s;
    this.e(id + "-username").value = item.u;
    this.e(id + "-password").value = item.p;
    this.e(id + "-question").value = item.q;
    this.e(id + "-answer").value = item.a;
    this.showPwdBody(id, false);
};

/**
 * Adds all passwords in the supplied array to the DOM
 * 
 * @param {array} pwds - an array of password JSON objects
 */
SCA.addPwds = function(pwds) {
    for (var id in pwds) {
        this.addPwd(pwds[id]);
    }
};

/**
 * Removes a password element from the DOM.
 * 
 * @param {string} id - the ID of the password element to remove.
 */
SCA.delPwd = function(id) {
    this.e(id).outerHTML = "";
};

/**
 * Show or hide a password's body in the DOM.
 * 
 * @param {string} id - the ID of the password to show/hide the body of
 * @param {boolean} show - true if the password body should be shown, false otherwise
 */
SCA.showPwdBody = function(id, show) {
    var panelBody = this.e(id + "-body");
    var toggleButton = this.e(id + "-toggle");

    if (show) {
        panelBody.style.display = "inherit";
        toggleButton.innerHTML = "Hide";
    } else {
        panelBody.style.display = "none";
        toggleButton.innerHTML = "Show";
    }
};

/**
 * Toggles the show/hide state of a password's body.
 * 
 * @param {string} id - the ID of the password to toggle the body state of
 */
SCA.togglePwd = function(id) {
    var panelBody = this.e(id + "-body");
    var isHidden = panelBody.style.display === "none";
    this.showPwdBody(id, isHidden);
};

/**
 * Reads the password information from the DOM into a JSON object for the supplied id.
 * 
 * @param {string} id - the ID of the password to retrieve JSON data for
 * @returns {object} a JSON object which encapsulates the password data.
 */
SCA.getPwd = function(id) {
    return {
        s: this.e(id + "-service").value,
        u: this.e(id + "-username").value,
        p: this.e(id + "-password").value,
        q: this.e(id + "-question").value,
        a: this.e(id + "-answer").value
    };
};

/**
 * Reads all passwords from the DOM into an array of JSON objects.
 * 
 * @returns {Array} an array of JSON objects representing all passwords on the page.
 */
SCA.getPwds = function() {
    var pwds = [];
    this.eachPwd(function(id, pwd) {
        pwds.push(pwd);
    });

    return pwds;
};

/**
 * Iterates over all passwords stored in the DOM with the supplied function.
 * 
 * @param {function} fn - the function which consumes the password id and JSON password object.
 */
SCA.eachPwd = function(fn) {
    var child = this._divPwds().firstChild;
    while (child) {
        if (child.nodeName === "DIV") {
            var id = child.id;
            fn(id, this.getPwd(id));
        }
        child = child.nextSibling;
    }
};

/**
 * Stores all password data as an encrypted object within the DOM and then writes it out to a file.
 */
SCA.encrypt = function() {
    this.encryptAndEmbedData();
    this.saveDocument();
    this.doOnload();
};

/**
 * Encrypts all password data in the DOM and stores it as a JSON object within a script tag element.
 */
SCA.encryptAndEmbedData = function() {
    this.encryptWith(function(cs, prp, iv, adata) {
        // Reset document specific elements
        SCA._divPwds().innerHTML = "";
        SCA.e("search").setAttribute("disabled", "");
    });
};

/**
 * Gets the plaintext JSON passwords payload to be encrypted.
 * @returns {string} - the passwords to be encrypted in plaintext.
 */
SCA.getPlaintext = function() {
    return JSON.stringify(SCA.getPwds());
};

/**
 * Sets whether or not the interface is unlocked or not.
 * When locked, the encrypted password data needs to be decrypted in order to unlock the interface.
 * 
 * @param {boolean} isUnlocked - true if the interface is unlocked, false otherwise
 */
SCA.setUnlocked = function(isUnlocked) {
    var lockedDisplay = isUnlocked ? "none" : "inline";
    var unlockedDisplay = isUnlocked ? "inline" : "none";

    this.setDisplay("locked", lockedDisplay);
    this.setDisplay("unlocked", unlockedDisplay);

    var search = this.e("search");
    var menuButton = this.e("menu-button");

    if (isUnlocked) {
        search.removeAttribute("disabled");
        menuButton.removeAttribute("disabled");
    } else {
        search.setAttribute("disabled", "");
        menuButton.setAttribute("disabled", "");
    }
};

/**
 * Decrypts the encrypted data with the credentials obtained from the form,
 * and unlocks the interface if successful.
 */
SCA.decrypt = function() {
    this.decryptWith(function(prp, iv, adata, out) {
        var pwds = JSON.parse(out);
        SCA.addPwds(pwds);
    });
};

/**
 * Filters displayed passwords based on the search input field.
 * Passwords are displayed based on a string match of the JSON password object.
 * Matching is only done when the search term length is greater than two.
 * If there is a single match, that password's body is revealed.
 */
SCA.filterPwds = function() {
    var MIN_SEARCH_TERM_LENGTH = 2;
    var searchTerm = this.e("search").value;
    var filtered = [];

    this.eachPwd(function(id, pwd) {
        if (searchTerm.length < MIN_SEARCH_TERM_LENGTH) {
            SCA.setDisplay(id, "inherit");
            filtered.push(id);
        } else {
            var jsonString = JSON.stringify(pwd);

            // Search the jsonString for the search term
            if (jsonString.indexOf(searchTerm) !== -1) {
                SCA.setDisplay(id, "inherit");
                filtered.push(id);
            } else {
                SCA.setDisplay(id, "none");
            }
        }
    });

    if (filtered.length === 1 && searchTerm.length >= MIN_SEARCH_TERM_LENGTH) {
        this.showPwdBody(filtered[0], true);
    } else {
        for (var id in filtered) {
            this.showPwdBody(filtered[id], false);
        }
    }
};