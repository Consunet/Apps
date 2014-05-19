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
    this.showPwdBody(id, false, false);
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
    var canDelete = true;
    if (this.isConfirmPwdDelete()) {
        var pwdName = this.e(id + "-service").value;
        canDelete = confirm("<%= DeletePasswordFor %> " + pwdName + "?");
    }
    
    if (canDelete) {
        this.e(id).outerHTML = "";
    }
};

/**
 * Show or hide a password's body in the DOM.
 * 
 * @param {string} id - the ID of the password to show/hide the body of
 * @param {boolean} show - true if the password body should be shown, false otherwise
 * @param {boolean} select - true if the password field should be selected on show, false otherwise
 */
SCA.showPwdBody = function(id, show, select) {
    var panelBody = this.e(id + "-body");
    var toggleButton = this.e(id + "-toggle");

    if (show) {
        panelBody.style.display = "inherit";
        toggleButton.innerHTML = "<%= Hide %>";
        if (select) {
            SCA.selectPwd(id);
        }
        this.checkGo(id);
    } else {
        panelBody.style.display = "none";
        toggleButton.innerHTML = "<%= Show %>";
        this.setDisplay(id + "-go", "none");
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
    this.showPwdBody(id, isHidden, true);
};

/**
 * Selects password text for a particular password..
 * 
 * @param {string} id - the ID of the password text to select.
 */
SCA.selectPwd = function(id) {
    var pwdField = this.e(id + "-password");
    pwdField.select();
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
    if (this.encryptAndEmbedData()) {
        this.saveDocument();
        this.doOnload();
    }
};

/**
 * Encrypts all password data in the DOM and stores it as a JSON object within a script tag element.
 */
SCA.encryptAndEmbedData = function() {
    // Check for existing uncommitted password data.
    var newService = SCA.e("new-service").value;
    var newUser = SCA.e("new-username").value;
    var newPass = SCA.e("new-password").value;
    var newQuestion = SCA.e("new-question").value;
    var newAnswer = SCA.e("new-answer").value;

    // If there is any data there, then add the password.
    if (newService.length !== 0 ||
        newUser.length !== 0 ||
        newPass.length !== 0 ||
        newQuestion.length !== 0 ||
        newAnswer.length !== 0) {
        SCA.newPwd();
    }
    
    return this.encryptWith(function(cs, prp, iv, adata) {
        // Reset document specific elements
        SCA._divPwds().innerHTML = "";
        SCA.e("search").setAttribute("disabled", "");
    });
};

/**
 * Gets the plaintext JSON passwords payload to be encrypted.
 * @returns {string} - the passwords to be encrypted in plaintext.
 */
SCA.getPayload = function() {
    return SCA.getPwds();
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
        search.focus();
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
    this.decryptWith(function(v, prp, iv, adata, out) {
        // Handle decoding of versions older than 1.3 where options wasn't part of payload
        if (v === undefined || v <= 1.2) {
            out = JSON.parse(out);
        }
        SCA.addPwds(out);
    });
};

/**
 * Filters displayed passwords based on the search input field.
 * Passwords are displayed based on a string match of the JSON password object.
 * Matching is only done when the search term length is greater than two.
 * If there is a single match, that password's body is revealed.
 */
SCA.filterPwds = function(event) {
    // Clear search field on ESC
    if (event && event.which === 27) {
        SCA.e("search").value = "";
    }
    
    var MIN_SEARCH_TERM_LENGTH = 2;
    var searchTerm = this.e("search").value.toLowerCase();
    var filtered = [];

    this.eachPwd(function(id, pwd) {
        if (searchTerm.length < MIN_SEARCH_TERM_LENGTH) {
            SCA.setDisplay(id, "inherit");
            filtered.push(id);
        } else {
            var jsonString = JSON.stringify(pwd).toLowerCase();

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
        this.showPwdBody(filtered[0], true, false);
    } else {
        for (var id in filtered) {
            this.showPwdBody(filtered[id], false, false);
        }
    }
};

/**
 * Populates the password field for a new entry with a generated random base64 String.
 */
SCA.generatePwd = function() {
    var generated = sjcl.codec.base64.fromBits(sjcl.random.randomWords(4, 2));
    generated = generated.substring(0, generated.length - 2);
    var replace = String.fromCharCode(97 + Math.round(Math.random() * 25));
    generated = generated.replace(/\+/g, replace);
    replace = String.fromCharCode(97 + Math.round(Math.random() * 25));
    generated = generated.replace(/\//g, replace);
    this.e("new-password").value = generated;
};

/**
 * Opens a new window matching the URL stored in the service name.
 */
SCA.go = function(id) {
    var service = this.e(id + "-service").value;
    
    // If there is no specified protocol, assume http
    if (service.indexOf("://") === -1) {
        service = "http://" + service;
    }

    window.open(service);
};

/**
 * Stores the RegExp used for checking for URLs in the password service name.
 * Credit: http://mathiasbynens.be/demo/url-regex (@cowboy)
 * @type RegExp
 */
SCA.checkGoRegex = /(?:\b[a-z\d.-]+:\/\/[^<>\s]+|\b(?:(?:(?:[^\s!@#$%^&*()_=+[\]{}\|;:'",.<>/?]+)\.)+(?:ac|ad|aero|ae|af|ag|ai|al|am|an|ao|aq|arpa|ar|asia|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|biz|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|cat|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|coop|com|co|cr|cu|cv|cx|cy|cz|de|dj|dk|dm|do|dz|ec|edu|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gov|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|info|int|in|io|iq|ir|is|it|je|jm|jobs|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mil|mk|ml|mm|mn|mobi|mo|mp|mq|mr|ms|mt|museum|mu|mv|mw|mx|my|mz|name|na|nc|net|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|org|pa|pe|pf|pg|ph|pk|pl|pm|pn|pro|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sy|sz|tc|td|tel|tf|tg|th|tj|tk|tl|tm|tn|to|tp|travel|tr|tt|tv|tw|tz|ua|ug|uk|um|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|xn--0zwm56d|xn--11b5bs3a9aj6g|xn--80akhbyknj4f|xn--9t4b11yi5a|xn--deba0ad|xn--g6w251d|xn--hgbk6aj7f53bba|xn--hlcj6aya9esc7a|xn--jxalpdlp|xn--kgbechtv|xn--zckzah|ye|yt|yu|za|zm|zw)|(?:(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:[0-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5]))(?:[;/][^#?<>\s]*)?(?:\?[^#<>\s]*)?(?:#[^<>\s]*)?(?!\w))/i;

/**
 * Enables or disables the "Go" button depending of if the Service name is a URL or not.
 * @param {type} id the id of the password to check.
 */
SCA.checkGo = function(id) {
    var service = this.e(id + "-service").value;
    var panelBody = this.e(id + "-body");

    if (service.match(SCA.checkGoRegex) && panelBody.style.display === "inherit") {
        this.setDisplay(id + "-go", "inline");
    } else {
        this.setDisplay(id + "-go", "none");
    }
};

/**
 * Stores the current password being dragged - greyed out.
 */
SCA.currentDraggablePwd = "";

/**
 * Handles ondragstart events for passwords.
 */
SCA.dragStartPwd = function(ev) {
    var id = ev.target.id;
    SCA.currentDraggablePwd = id;

    // Required by Firefox to allow drag and drop events to fire
    ev.dataTransfer.setData("id", id);
    ev.dataTransfer.effectAllowed = 'move';
    var glowId = id.replace("-drag", "-glow");
    SCA.addClass(glowId, "dragged");
};

/**
 * Handles drag over events for passwords.
 */
SCA.dragOverPwd = function(ev) {
    if (ev.preventDefault) {
        ev.preventDefault(); // Necessary. Allows us to drop.
    }

    ev.dataTransfer.dropEffect = 'move';
    return false;
};

/**
 * Handles drag enter events for passwords - highlights targets.
 */
SCA.dragEnterPwd = function(ev) {
    var id = ev.currentTarget.id;
    var glowId = id.replace("-drag", "-glow");
    SCA.addClass(glowId, "drag-target");
};

/**
 * Handles drag leave events for passwords - unhighlights targets.
 */
SCA.dragLeavePwd = function(ev) {
    var id = ev.currentTarget.id;
    var glowId = id.replace("-drag", "-glow");
    SCA.removeClass(glowId, "drag-target");
};

/**
 * Handles drag end events for passwords - resets state.
 */
SCA.dragEndPwd = function(ev) {
    // Reset all passwords - to cater for Firefox case where multiple selections take place.
    // Also makes it more robust.
    this.eachPwd(function(id, pwd) {
        var form = id + "-glow";
        SCA.removeClass(form, "dragged");
        SCA.removeClass(form, "drag-target");
    });
    
    SCA.currentDraggablePwd = "";
};
    
/**
 * Handles drop events for passwords - performs the reshuffling if required.
 */
SCA.dragDrop = function(ev) {
    // Stops some browsers from redirecting.
    if (ev.stopPropagation) {
        ev.stopPropagation(); 
    }
    if (ev.preventDefault) { 
        ev.preventDefault(); 
    }

    var srcIdForm = SCA.currentDraggablePwd;
    var destIdForm = ev.currentTarget.id;
    var srcId = srcIdForm.replace("-drag", "");
    var destId = destIdForm.replace("-drag", "");

    if (srcId === destId) {
        return false;
    }
    
    var src = this.e(srcId);
    var dest = this.e(destId);
    var pwds = this._divPwds();

    var pos = this.getPwdPositions(srcId, destId);
    
    // Swap src and dest (ensure src is before dest)
    pwds.removeChild(src);
    pwds.insertBefore(src, dest);
    
    // If Src was before dest, then swap src and dest position - make dest before src.
    if (pos[0] < pos[1]) { 
        pwds.removeChild(dest);
        pwds.insertBefore(dest, src);
    }
    
    return false;
};

/**
 * Obtains an array containing the src and dest positions of the passwords in the list.
 * @param {type} srcId the id of the src password
 * @param {type} destId the id of the dest password
 * @returns {Array} of the src and dest positions in the list, respectively.
 */
SCA.getPwdPositions = function(srcId, destId) {
    var srcPos = 0;
    var destPos = 0;
    var i = 0;
    this.eachPwd(function(searchId, pwd) {
        if (srcId === searchId) {
            srcPos = i;
        }
        if (destId === searchId) {
            destPos = i;
        }
        i++;
    });
    
    return [srcPos, destPos];
};

/**
 * @returns true if the confirm password checkbox is checked, false otherwise
 */
SCA.isConfirmPwdDelete = function() {
  return this.e("opt-confirm-del").checked;
};

/**
 * Get a set of default options for EveryPass.
 * @returns
 */
SCA.getDefaultOptions = function() {
    return {
        saveFileName: CONST.appName,
        timeoutPeriodMins: CONST.defaultTimeoutPeriodMins,
        confirmPwdDelete: true
    };
};

/**
 * @param {type} opts options to set
 */
SCA.setOptions = function(opts) {
    this.e("opt-save-filename").value = opts.saveFileName;
    this.e("opt-timeout").value = opts.timeoutPeriodMins;
    this.e("opt-confirm-del").checked = opts.confirmPwdDelete;
};

/**
* Reads options from the EveryPass User interface.
* @returns a JSON object containing the read options
*/
SCA.readOptions = function() {
    var sfn = this.getSaveFilename();
    var timeout = this.getTimeout();
    var pwdDelete = this.isConfirmPwdDelete();

    return {
        saveFileName: sfn,
        timeoutPeriodMins: timeout,
        confirmPwdDelete: pwdDelete
    };
};