/**
 * @file functions to encapsulate interface logic for the WhisperNote app
 */

/**
 * @namespace SCA
 * @type {object}
 * @description
 * <p>
 * These functions build upon the SCA namespace to provide an interface for the WhisperNote app.
 * </p>
 */

/**
 * Reads the chosen file to encrypt and performs the encryption once 
 * the data has been loaded.
 * If there is no file chosen, the encryption is performed without the file.
 */
SCA.encrypt = function() {
    var fileInput = this.e('file').files;

    var file = fileInput[0];
    if (file) {
        var arrayBuffer;
        var fileReader = new FileReader();
        fileReader.onload = function() {
            arrayBuffer = this.result;
            SCA.encryptWithFile(arrayBuffer, file.name);
        };

        fileReader.readAsArrayBuffer(file);
    } else {
        SCA.encryptWithFile(false, false);
    }
};

/**
 * Stores the payload text and attachment data (if provided) as an encrypted
 * object within the DOM, saves the file and then resets the document.
 * <p>
 * This encryption is performed in an asynchronous manner, and it is an error
 * to assume that the encryption and persistence has occurred as soon as this
 * function returns.
 * 
 * @param {ArrayBuffer} arrayBuffer - the file data to encrypt, if provided.
 * @param {string} filename - the name of the file, if provided.
 */
SCA.encryptWithFile = function(arrayBuffer, filename) {
    var me = this;
    var eaedPromise = this.encryptAndEmbedData(arrayBuffer, filename);
    eaedPromise.then(function() {
        me.saveDocument();
        me.doOnload();
    }).catch(function (reason) {
        var errstr = "Encryption failed due to: " + reason;
        console.log(errstr);
        alert(errstr);
    });
};

/**
 * Stores the payload text and attachment data (if provided) as an encrypted
 * object within the DOM. 
 * <p>
 * This is performed in an asynchronous manner, via the returned Promise.
 * 
 * @param {ArrayBuffer} arrayBuffer - the file data to encrypt, if provided.
 * @param {string} filename - the name of the file, if provided.
 * @return {Promise} when retruned promise is resolved, page data will be 
 *      encrypted and embedded, ready for persistence.
 */
SCA.encryptAndEmbedData = function(arrayBuffer, filename) {
    
    var me = this;
    
    return this.encryptWith(function(cs, cryptoKey, iv, adata) {
        cs.cattname = "";
        cs.catt = "";
        
        var retval = Promise.resolve();
        
        if (arrayBuffer) {
            var cryptoObj = window.crypto || window.msCrypto; // for IE 11
            var sc = cryptoObj.subtle;
            
            var sliceSize = CONST.attSliceSize;
            var encryptionPromisesArray = [];
            
            for (var offset = 0; offset < arrayBuffer.byteLength; offset += sliceSize) {
                var slice = arrayBuffer.slice(offset, offset + sliceSize);
                var byteSlice = new Uint8Array(slice);
                var encryptPromise = sc.encrypt({'name': cs.cipherAlgorithm, 'iv': iv.buffer}, cryptoKey, byteSlice.buffer);
                encryptionPromisesArray.push(encryptPromise);
            }
            
            retval = new Promise(function (resolve, reject) {
                Promise.all(encryptionPromisesArray).then(function (encryptedArray) {
                    var encryptedBase64Slices = [];
                    encryptedArray.forEach(function (val) {
                        var byteArray = new Uint8Array(val);
                        var encryptedBase64Slice = me.convertUint8ArrayToString(byteArray);
                        encryptedBase64Slices.push(encryptedBase64Slice);
                    });
                    cs.catt = encryptedBase64Slices;
                }).then(function () {
                    var filenameBuffer = new TextEncoder("utf-8").encode(filename);
                    var encryptionPromise = sc.encrypt({'name': cs.cipherAlgorithm, 'iv': iv.buffer}, cryptoKey, filenameBuffer);
                    encryptionPromise.then(function (val) {
                        var byteArray = new Uint8Array(val);
                        var encryptedBase64Filename = me.convertUint8ArrayToString(byteArray);
                        cs.cattname = encryptedBase64Filename;
                        resolve(); // retval
                    }).catch(function (reason) {
                        reject(reason); // retval
                    });
                }).catch(function (reason) {
                    reject(reason); // retval
                });
            });
        }
        
        return retval;
    });
};

/**
 * Gets the plaintext message payload to be encrypted.
 * @returns {string} - the message to be encrypted in plaintext.
 */
SCA.getPayload = function() {
    return this.getAndClear("payload");
};

/**
 * Decrypts the payload and file attachment data (if provided).
 * The attachment blob and file name are stored in memory, ready to be downloaded.
 */
SCA.decrypt = function() {
    
    var me = this;
    
    var decryptionPromise = this.decryptWith(function(v, cryptoKey, iv, adata, out) {
        
        // Populate the message payload
        SCA.e("payload").value = out;
        
        var retval = Promise.resolve();
        
        // Check for an attachment, and decrypt it if present
        if (encData.cattname) {
            var cryptoObj = window.crypto || window.msCrypto; // for IE 11
            var sc = cryptoObj.subtle;
            
            var promiseArray = [];
            
            var filenameBuffer = me.convertStringToUint8Array(encData.cattname);
            var filenameDecryptionPromise = sc.decrypt({'name': "AES-CBC", 'iv': iv.buffer}, cryptoKey, filenameBuffer);
            promiseArray.push(filenameDecryptionPromise);
            
            for (var i = 0; i < encData.catt.length; i++) {
                var sliceBuffer = me.convertStringToUint8Array(encData.catt[i]).buffer;
                var sliceDecryptionPromise = sc.decrypt({'name': "AES-CBC", 'iv': iv.buffer}, cryptoKey, sliceBuffer);
                promiseArray.push(sliceDecryptionPromise);
            }
            
            retval = new Promise(function(resolve, reject) {
                Promise.all(promiseArray).then(function(decryptedArray) {
                    var filename = new TextDecoder("utf-8").decode(decryptedArray[0]);
                    SCA.e("download-label").innerHTML = filename;
                    SCA.setDisplay("att-download", "inline");
                    
                    var bytesArray = [];
                    for (var i = 1; i < decryptedArray.length; i++) {
                        var slice = new Uint8Array(decryptedArray[i]);
                        bytesArray.push(slice);
                    }
                    
                    SCA.attBlob = new Blob(bytesArray, {type: "application/octet-stream"});
                    SCA.attName = filename;
                    
                    resolve();
                }).catch(function(reason) {
                    reject(reason);
                });
            });
        }        

        return retval;
    });
    
    decryptionPromise.catch(function(reason) {
       console.log("Decryption failed due to: " + reason); 
    });
};

/**
 * Downloads the stores attachment blob and filename.
 */
SCA.downloadDecrypted = function() {
    saveAs(this.attBlob, this.attName);
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
};