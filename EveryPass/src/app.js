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
 * An integer which is used to provide a unique ID for group elements.
 * 
 * @type Number
 * @private
 */
SCA._nextGrpId = 0;


/**
 * An identifier for the currently selected group for all new passwords to be added to.
 * If null, next new password not grouped.
 * 
 * @type String
 * @private
 */
SCA._currentDefaultGrpId = null;

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
 * Gets the pw-data hidden template for groups, and caches its value for future use.
 * 
 * @returns {Element} the pw-data Element
 * @private
 */
SCA._divGrpData = function() {
    if (!this.dGrpData) {
        this.dGrpData = this.e("grp-data");
    }
    return this.dGrpData;
};

/**
 * Gets the pwds element which holds all password objects (either in a group or not grouped).
 * 
 * @param {String} grp - optionally identifies the group to get password container for.
 * @returns {Element} the pwds Element
 * @private
 */
SCA._divPwds = function(grp) {
    
    if (grp) {
        return this.e(grp+"-pwds"); //grouped
    }
    else
    {
        return this.e("pwds"); //not grouped
    } 
};


/**
 * Gets the grps element which holds all group objects, and caches its value for future use.
 * 
 * @returns {Element} the pwds Element
 * @private
 */
SCA._divGrps = function() {
    if (!this.dGrps) {
        this.dGrps = this.e("grps");
    }
    return this.dGrps;
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

    //if _currentDefaultGrpId = null, not grouped
    this.addPwd(pwData,this._currentDefaultGrpId);
    this.e("search").value = "";
    this.filterPwds();
};


/**
 * Creates a new group entry from reading form field, and adds it to the DOM.
 */
SCA.newGrp = function() {
    var grpData = {
        g: this.getAndClear("new-group-name"),
        pwds: [], //none yet
        vis: true, //show by default
        def: false //not yet default group
    };

    this.addGrp(grpData);
    this.e("search").value = "";
    this.filterPwds();
};

/**
 * Adds a password entry element to the DOM.
 * 
 * @param {object} item - the password JSON object to add
 * @param {String} grp - optional for the group to add password to.
 */
SCA.addPwd = function(item, grp) {
    
    var id = "p" + this._nextPwdId;
    
    this._nextPwdId += 1;
       

    var cloned = this._divPwData().innerHTML;
    var replaced = cloned.replace(/pwid/g, id).replace(":none", ":inherit");
    var div = document.createElement('div');
    div.id = id;
    div.className = "password-container"
    div.innerHTML = replaced;   

    //if grp = null, added to non-grouped passwords
    this._divPwds(grp).appendChild(div);
      
    this.e(id + "-service").value = item.s;
    this.e(id + "-username").value = item.u;
    this.e(id + "-password").value = item.p;
    this.e(id + "-question").value = item.q;
    this.e(id + "-answer").value = item.a;
    this.showPwdBody(id, false, false);

    if(this.passwordsExist() ) {
        // No passwords exist, show "no passwords" message.
        this.setDisplay("store-empty-message", "none");
    }

};


/**
 * Adds a group entry element to the DOM.
 * Existing groups imported/decrypted will retain 
 * open/hide status and default group status.
 * 
 * @param {object} item - the group JSON object to add
 */
SCA.addGrp = function(item) {
    var id = "g" + this._nextGrpId;
    this._nextGrpId += 1;

    var cloned = this._divGrpData().innerHTML;
    var replaced = cloned.replace(/grpid/g, id).replace(":none", ":inherit");
    var div = document.createElement('div');
    div.id = id;
    div.innerHTML = replaced;
    this._divGrps().appendChild(div);
    this.e(id + "-name").value = item.g;
    
    //visibility before encrypt retained
    this.showGrpBody(id, item.vis)
     
    //default status before encrypt retained
    if(item.def)
        this.toggleDefaultGroup(id);
          
    //add passwords (if imported/decrypted group)
    for(var i = 0; i < item.pwds.length; i++)
    {
        this.addPwd(item.pwds[i], id);
    }    
};

/**
 * Adds all non-grouped passwords in the supplied array to the DOM.
 * 
 * @param {array} pwds - an array of password JSON objects
 */
SCA.addPwds = function(pwds) {
    for (var id in pwds) {
        this.addPwd(pwds[id]);
    }

    if(this.passwordsExist() ) {
        // No passwords exist, show "no passwords" message.
        this.setDisplay("store-empty-message", "none");
    }

};

/**
 * Adds all groups in the supplied array to the DOM.
 * 
 * @param {array} grps - an array of group JSON objects
 */
SCA.addGrps = function(grps) {
    for (var id in grps) {
        this.addGrp(grps[id]);
    }
};

/**
 * Removes a password element from the DOM.
 * 
 * @param {string} id - the ID of the password element to remove.
 */
SCA.delPwd = function(id) {
    var canDelete = true;
    if (this.isConfirmItemDelete()) {
        var pwdName = this.e(id + "-service").value;          
        
        canDelete = confirm("<%= DeletePasswordFor %> " + pwdName + "?");
    }
    
    if (canDelete) {
        this.e(id).outerHTML = "";
    }

    if( !this.passwordsExist() ) {
        // No passwords exist, show "no passwords" message.
        this.setDisplay("store-empty-message", "block");
    }

};

/**
 * Removes a group element from the DOM.
 * 
 * @param {string} id - the ID of the group element to remove.
 */
SCA.delGrp = function(id) {
    var canDelete = true;
    if (this.isConfirmItemDelete()) {       
        var grpName = this.e(id + "-name").value;
        
        var pwdMessage;
        
        //prompt based on setting for keeping passwords
        this.isKeepPwdsOfDeletedGrp() ? pwdMessage = "(<%= DeleteGroupKeepPwds %>)" : pwdMessage = "(<%= DeleteGroupLosePwds %>)";
                
        canDelete = confirm("<%= DeleteGroup %> '" + grpName + "'?\n\n"+pwdMessage);
    }       
            
    if (canDelete) {
        
        if(this._currentDefaultGrpId === id)
            this._currentDefaultGrpId = null;
        
        //retain passwords of deleted group (if option)
        if(this.isKeepPwdsOfDeletedGrp())
        {
            var grpPwdContainer = this.e(id+"-pwds");          

            while(grpPwdContainer.firstChild)
            {
                this._divPwds().appendChild(grpPwdContainer.firstChild);
            }
        }

        
        this.e(id).outerHTML = "";
    }

    if( !this.passwordsExist() ) {
        // No passwords exist, show "no passwords" message.
        this.setDisplay("store-empty-message", "block");
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
            this.selectPwd(id);
        }
        this.checkGo(id);
    } else {
        panelBody.style.display = "none";
        toggleButton.innerHTML = "<%= Show %>";
        this.setDisplay(id + "-go", "none");
    }
};

/**
 * Returns true if passwords exist, false if not.
 */
SCA.passwordsExist = function() {
    return document.getElementsByClassName("password-container").length > 0;
};

/**
 * Show or hide a group's body in the DOM.
 * 
 * @param {string} id - the ID of the group to show/hide the body of
 * @param {boolean} show - true if the group body should be shown, false otherwise
 */
SCA.showGrpBody = function(id, show) {
    var panelBody = this.e(id + "-pwds");
    var toggleButton = this.e(id + "-toggle");

    if (show) {
        panelBody.style.display = "inherit";
        toggleButton.innerHTML = "<%= Hide %>";
    } else {
        panelBody.style.display = "none";
        toggleButton.innerHTML = "<%= Show %>";
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
 * Toggles the show/hide state of a group's body.
 * 
 * @param {string} id - the ID of the group to toggle the body state of
 */
SCA.toggleGrp = function(id) {
    var panelBody = this.e(id + "-pwds");
    var isHidden = panelBody.style.display === "none";
    this.showGrpBody(id, isHidden);
};

/**
 * Makes a group the default destination for newly added passwords.
 * 
 * @param {string} id - the ID of the group to set as default
 */
SCA.toggleDefaultGroup = function(id) {
    
    var toggleButton = this.e(id + "-setdefault");
    
    //this group us currently default, clear default
    if(this._currentDefaultGrpId === id)
    {
        this._currentDefaultGrpId = null;
    
        toggleButton.classList.remove("btn-warning");
        toggleButton.classList.add("btn-custom"); 
    }
    else //group not currently default
    {
        //there is an existing default, make that no longer default
        if(this._currentDefaultGrpId)
        {
            var prevToggleButton = this.e(this._currentDefaultGrpId + "-setdefault");               
            
            prevToggleButton.classList.remove("btn-warning");   
            prevToggleButton.classList.add("btn-custom"); 
        }
        
        //make this group new default
        this._currentDefaultGrpId = id;

        toggleButton.classList.remove("btn-custom");
        toggleButton.classList.add("btn-warning");   
        //
    }           
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
 * Reads the password information from the DOM into a password JSON object for the supplied id.
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
 * Reads the group information from the DOM into a group JSON object for the supplied id.
 * 
 * @param {string} id - the ID of the group to retrieve JSON data for
 * @returns {object} a JSON object which encapsulates the group data.
 */
SCA.getGrp = function(id) {
    
    var grpPwdContainer = this.e(id+"-pwds");
               
    return {
        g: this.e(id + "-name").value, 
        pwds: this.getPwds(grpPwdContainer), //array of passwords within group
        vis: grpPwdContainer.style.display !== "none", //true if currently not hidden
        def: (id === this._currentDefaultGrpId) //only true if current default group
    };
};

/**
 * Reads all passwords from either a group or outside of groups into an array of JSON objects.
 * 
 * @param {Element} container - optional group container for where to get passwords from
 * @returns {Array} an array of JSON objects representing all passwords within a group or outside all groups.
 */
SCA.getPwds = function(container) {
    var pwds = [];
    this.eachPwd(function(id, pwd) {
        pwds.push(pwd);
    }, container);

    return pwds;
};


/**
 * Reads all groups from the DOM into an array of JSON objects.
 * 
 * @returns {Array} an array of JSON objects representing all groups on the page.
 */
SCA.getGrps = function() {
    var grps = [];
    this.eachGrp(function(id, grp) {
        grps.push(grp);
    });

    return grps;
};


/**
 * Iterates over all passwords stored in the DOM with the supplied function.
 * 
 * @param {function} fn - the function which consumes the password id and JSON password object.
 * @param {Element} _container - optional group container for where to get passwords from
 */
SCA.eachPwd = function(fn, _container) {
    
    var container;
    
    //if a conainer was provided
    if(_container)
    {
        container = _container;
    }
    //no container, just gets container for non-grouped passwords
    else
    {
        container = this._divPwds();
    }     
        
    var child = container.firstChild;
    while (child) {
        if (child.nodeName === "DIV") {
            var id = child.id;
            fn(id, this.getPwd(id));
        }
        child = child.nextSibling;
    }
};

/**
 * Iterates over all groups stored in the DOM with the supplied function.
 * 
 * @param {function} fn - the function which consumes the group id and JSON group object.
 */
SCA.eachGrp = function(fn) {
    var child = this._divGrps().firstChild;
    while (child) {
        if (child.nodeName === "DIV") {
            var id = child.id;
            fn(id, this.getGrp(id));
        }
        child = child.nextSibling;
    }
};

/**
 * Stores all password and group data as an encrypted object within the DOM and then writes it out to a file.
 * <p>
 * Encryption is performed asynchronously, and should not be assumed to be complete
 * when this function returns.
 */
SCA.encrypt = function() {
    var me = this;
    var eaedPromise = me.encryptAndEmbedData();

    eaedPromise.then(function() {
        me.saveDocument();
        me.doOnload();
    }).catch(function(reason) {        
        var errstr = "Encryption failed due to: " + reason;
        
        console.log(errstr);
    
        //dont need two alerts for weak or empty password
        if(!reason.endsWith("password"))
        {
            //something else
            alert(errstr);
        }
    });
};

/**
 * Encrypts all password and group data in the DOM and stores it as a JSON object within a script tag element.
 * <p>
 * This encryption is performed in an asynchronous manner via the returned Promise.
 * 
 * @return {Promise} when resolved, encryption is complete and data added to DOM.
 */
SCA.encryptAndEmbedData = function() {
    
    // Check for existing uncommitted password data.
    var newService = this.e("new-service").value;
    var newUser = this.e("new-username").value;
    var newPass = this.e("new-password").value;
    var newQuestion = this.e("new-question").value;
    var newAnswer = this.e("new-answer").value;

    // If there is any data there, then add the password.
    if (newService.length !== 0 ||
        newUser.length !== 0 ||
        newPass.length !== 0 ||
        newQuestion.length !== 0 ||
        newAnswer.length !== 0) {
        this.newPwd();
    }
    
    return this.encryptWith(function(cs, cryptoKey, iv, adata) {
        // Reset document specific elements
        SCA._currentDefaultGrpId = null;
        
        SCA._divGrps().innerHTML = "";
        SCA._divPwds().innerHTML = "";
        SCA.e("search").setAttribute("disabled", "");
        
        return Promise.resolve();
    });
};

/**
 * Gets the plaintext JSON passwords and groups payload to be encrypted.
 * @returns {string} - the passwords and groups to be encrypted in plaintext.
 */
SCA.getPayload = function() {
              
    var pwdsGrouped = this.getGrps();
    var pwdsNotGrouped = this.getPwds();   
     
    return pwdsNotGrouped.concat(pwdsGrouped);
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
 * <p>
 * Performs decryption in asynchronous manner, and it should not be assumed to
 * be complete when function returns.
 */
SCA.decrypt = function() {
    var decryptionPromise = this.decryptWith(function(v, prp, iv, adata, out) {
        // Handle decoding of versions older than 1.3 where options wasn't part of payload
        if (v === undefined || v <= 1.2) {
            out = JSON.parse(out);
        }
        
        //work out where the groups start in the JSON data array (if any)
        var grpIdx = out.length;
        for(var i = 0; i < out.length; i++)
        {
            //group start index found
            if('g' in out[i])
            {
                grpIdx = i;
                break;
            }                
        }
        
        //add non-grouped pwds if any 
        if(grpIdx > 0)
            SCA.addPwds(out.slice(0, grpIdx));
                
        //add groups if any
        if(grpIdx < out.length)            
            SCA.addGrps(out.slice(grpIdx));                  
                
        return Promise.resolve();
    });
    
    decryptionPromise.catch(function(reason) {
       console.log("Decryption failed due to: " + reason); 
    });
};

/**
 * Filters displayed passwords based on the search input field.
 * Passwords are displayed based on a string match of the JSON password object.
 * Matching is only done when the search term length is greater than two.
 * If there is a single match, that password's body is revealed.
 * If a matching password is within a hidden group, the group will be unhidden.
 * <p>
 * Triggered upon key release (onkeyup) 
 */
SCA.filterPwds = function(event) {
        
    var MIN_SEARCH_TERM_LENGTH = 2;
    var searchTerm = this.e("search").value.toLowerCase();
    var filtered = [];

    //seach each non-grouped password
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

    //search each group
    this.eachGrp(function(id, grp) {
        
        var grpPwdContainer = SCA.e(id+"-pwds");      
           
        //search each password in the group
        SCA.eachPwd(function(pid, pwd) {
        
            if (searchTerm.length < MIN_SEARCH_TERM_LENGTH) {
                SCA.setDisplay(pid, "inherit");
                filtered.push(pid);
            } else {
                var jsonString = JSON.stringify(pwd).toLowerCase();

                // Search the jsonString for the search term
                if (jsonString.indexOf(searchTerm) !== -1) {
                    //ensure password and parent group shown
                    SCA.showGrpBody(id, true);
                    SCA.setDisplay(pid, "inherit");
                    filtered.push(pid);
                } else {                    
                    SCA.setDisplay(pid, "none");
                }
            }
        
        },grpPwdContainer);   
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
 * Clears the search field upon pressing down ESC key (onkeydown).
 * <p>
 * Other keys may trigger this event but will do nothing until released
 * and calling the above filterPwds() handler for onkeyup.
 */
SCA.filterClear = function (event) {
    // Clear search field on ESC
    if (event && event.which === 27) {
        this.e("search").value = "";
    }
};

/**
 * Populates the password field for a new entry with a generated random base64 String.
 */
SCA.generatePwd = function() {
    var generated = this.convertUint8ArrayToBase64String(window.crypto.getRandomValues(new Uint8Array(16)));
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

    if (service.match(this.checkGoRegex) && panelBody.style.display === "inherit") {
        this.setDisplay(id + "-go", "inline");
    } else {
        this.setDisplay(id + "-go", "none");
    }
};

/**
 * Stores the current password or group being dragged - greyed out.
 */
SCA.currentDraggable = "";


/**
 * Handles ondragstart events for passwords and groups.
 */
SCA.dragStart = function(ev) {
  
    var id = ev.target.id;
    this.currentDraggable = id;
    var glowId = id.replace("-drag", "-glow");
    this.addClass(glowId, "dragged");
    // Required by Firefox to allow drag and drop events to fire
    ev.dataTransfer.setData("id", id);
    ev.dataTransfer.effectAllowed = 'move';
};

/**
 * Handles drag over events for passwords and groups.
 */
SCA.dragOver = function(ev) {
    
    if (ev.preventDefault) {
        ev.preventDefault(); // Necessary. Allows us to drop.
    }

    ev.dataTransfer.dropEffect = 'move';
    return false;
};


/**
 * Handles drag enter events for passwords and groups - highlights targets.
 */
SCA.dragEnter = function(ev) {
    
    var id = ev.currentTarget.id;
    var glowId = id.replace("-drag", "-glow");
    
    //prevent group onto password drag from triggering effect
    if(!(this.e(this.currentDraggable).classList.contains("grp-drag") && this.e(id).classList.contains("pwd-drag")))
    {
         //ok to highlight
         this.addClass(glowId, "drag-target");
    } 
};

/**
 * Handles drag leave events for passwords and groups - unhighlights targets.
 */
SCA.dragLeave = function(ev) {
  
    var id = ev.currentTarget.id;
    var glowId = id.replace("-drag", "-glow");
    this.removeClass(glowId, "drag-target");
};

/**
 * Handles drag end events for passwords and groups - resets state.
 */
SCA.dragEnd = function(ev) {
  
    this.currentDraggable = "";
  
    // Reset all passwords - to cater for Firefox case where multiple selections take place.
    // Also makes it more robust.
    this.eachPwd(function(id, pwd) {
        var form = id + "-glow";
        SCA.removeClass(form, "dragged");
        SCA.removeClass(form, "drag-target");
    });
    
    //clear highlight in groups
    this.eachGrp(function(id, grp) {
        var form = id + "-glow";
        SCA.removeClass(form, "dragged");
        SCA.removeClass(form, "drag-target");  
        
        var grpPwdContainer = SCA.e(id+"-pwds");       
        
        //clear highlight of passwords in group
        SCA.eachPwd(function(pid, pwd) {
            var form = pid + "-glow";
            SCA.removeClass(form, "dragged");
            SCA.removeClass(form, "drag-target");
        },grpPwdContainer);
    });       
};

    
/**
 * Handles drop events for passwords - performs the reshuffling if required.
 */
SCA.dragDropPwd = function(ev) { 

    // Stops some browsers from redirecting.
    if (ev.stopPropagation) {
        ev.stopPropagation(); 
    }
    if (ev.preventDefault) { 
        ev.preventDefault(); 
    }
    
    var srcIdForm = this.currentDraggable;
    var destIdForm = ev.currentTarget.id;
    var srcId = srcIdForm.replace("-drag", "");
    var destId = destIdForm.replace("-drag", "");

    if (srcId === destId) {
        //src and dest match, do nothing
        return false;
    }
    
    var src = this.e(srcId);
    var dest = this.e(destId);
    
    //password dragged onto password (only allowed case)
    if(this.e(this.currentDraggable).classList.contains("pwd-drag"))
    {          
        var srcParent = src.parentNode;
        var destParent = dest.parentNode;

        //pwds already in same group (simple rearrange)
        if(srcParent === destParent)
        {
            var pwds = srcParent;

            var pos = this.getPwdPositions(srcId, destId, pwds);

            // Swap src and dest (ensure src is before dest)
            pwds.removeChild(src);
            pwds.insertBefore(src, dest);

            // If Src was before dest, then swap src and dest position - make dest before src.
            if (pos[0] < pos[1]) { 
                pwds.removeChild(dest);
                pwds.insertBefore(dest, src);
            }          
        }
        else //pwds in different groups (src joins dest group)
        {
            //group order to detect higher password on page
            var pos = this.getGrpPositions(srcParent.id.replace("-pwds", ""), destParent.id.replace("-pwds", ""));

            // Swap src and dest (ensure src is before dest)
            destParent.insertBefore(src, dest);

            // If Src was before dest, then swap src and dest position - make dest before src.
            if (pos[0] < pos[1]) { 
                destParent.removeChild(dest);
                destParent.insertBefore(dest, src);
            }

        }
    }//else- dont do anything if group dropped onto password 
    
    return false;
};


/**
 * Handles drop events for groups- performs the reshuffling if required.
 */
SCA.dragDropGrp = function(ev) { 
            
    // Stops some browsers from redirecting.
    if (ev.stopPropagation) {
        ev.stopPropagation(); 
    }
    if (ev.preventDefault) { 
        ev.preventDefault(); 
    }

    //password onto group, password joins group
    if(this.e(this.currentDraggable).classList.contains("pwd-drag"))
    {
        var srcIdForm = this.currentDraggable;
        var destIdForm = ev.currentTarget.id;
        var srcId = srcIdForm.replace("-drag", "");
        var destId = destIdForm.replace("-drag", "");
       
        var src = this.e(srcId);                       
      
        this.e(destId+"-pwds").appendChild(src);           
    }
    else //group onto group, rearrange groups 
    {
        var srcIdForm = this.currentDraggable;
        var destIdForm = ev.currentTarget.id;
        var srcId = srcIdForm.replace("-drag", "");
        var destId = destIdForm.replace("-drag", "");

        if (srcId === destId) {
            //src and dest match, do nothing
            return false;
        }
   
        var src = this.e(srcId);
        var dest = this.e(destId);
        var grps = this._divGrps();

        var pos = this.getGrpPositions(srcId, destId);

        // Swap src and dest (ensure src is before dest)
        grps.removeChild(src);
        grps.insertBefore(src, dest);

        // If Src was before dest, then swap src and dest position - make dest before src.
        if (pos[0] < pos[1]) { 
            grps.removeChild(dest);
            grps.insertBefore(dest, src);
        }   
    }
    
    return false;    
};


/**
 * Obtains an array containing the src and dest positions of the passwords in the list.
 * @param {type} srcId the id of the src password
 * @param {type} destId the id of the dest password
 * @returns {Array} of the src and dest positions in the list, respectively.
 */
SCA.getPwdPositions = function(srcId, destId, container) {
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
    }, container);
    
    return [srcPos, destPos];
};

/**
 * Obtains an array containing the src and dest positions of the groups in the list.
 * @param {type} srcId the id of the src group
 * @param {type} destId the id of the dest group
 * @returns {Array} of the src and dest positions in the list, respectively.
 */
SCA.getGrpPositions = function(srcId, destId) {
    var srcPos = 0;
    var destPos = 0;
    var i = 0;
    this.eachGrp(function(searchId, pwd) {
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
 * @returns true if the confirm deletion of passwords and groups checkbox is checked, false otherwise
 */
SCA.isConfirmItemDelete = function() {
  return this.e("opt-confirm-del").checked;
};

/**
 * @returns true if the keep passwords of deleted groups checkbox is checked, false otherwise
 */
SCA.isKeepPwdsOfDeletedGrp = function() {
  return this.e("opt-keep-grp-pwds").checked;
};

/**
 * Get a set of default options for EveryPass.
 * @returns
 */
SCA.getDefaultOptions = function() {
    return {
        saveFileName: CONST.appName,
        timeoutPeriodMins: CONST.defaultTimeoutPeriodMins,
        confirmPwdDelete: true,
        keepPwdsOfDeletedGrp: true
    };
};

/**
 * @param {type} opts options to set
 */
SCA.setOptions = function(opts) {
    this.e("opt-save-filename").value = opts.saveFileName;
    this.e("opt-timeout").value = opts.timeoutPeriodMins;
    this.e("opt-confirm-del").checked = opts.confirmPwdDelete;
    
    if('keepPwdsOfDeletedGrp' in opts)
    {
        this.e("opt-keep-grp-pwds").checked = opts.keepPwdsOfDeletedGrp;
    }
    else
    {
        this.e("opt-keep-grp-pwds").checked = true;
    }
};

/**
* Reads options from the EveryPass User interface.
* @returns a JSON object containing the read options
*/
SCA.readOptions = function() {
    var sfn = this.getSaveFilename();
    var timeout = this.getTimeout();
    var itemDelete = this.isConfirmItemDelete();
    var keepGrpPwds = this.isKeepPwdsOfDeletedGrp();

    return {
        saveFileName: sfn,
        timeoutPeriodMins: timeout,
        confirmPwdDelete: itemDelete,
        keepPwdsOfDeletedGrp: keepGrpPwds
    };
};

