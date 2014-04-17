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
 * 
 * @param {ArrayBuffer} arrayBuffer - the file data to encrypt, if provided.
 * @param {string} filename - the name of the file, if provided.
 */
SCA.encryptWithFile = function(arrayBuffer, filename) {
    if (this.encryptAndEmbedData(arrayBuffer, filename)) {
        this.saveDocument();
        this.doOnload();
    }
};

/**
 * Stores the payload text and attachment data (if provided) as an encrypted
 * object within the DOM.
 * 
 * @param {ArrayBuffer} arrayBuffer - the file data to encrypt, if provided.
 * @param {string} filename - the name of the file, if provided.
 */
SCA.encryptAndEmbedData = function(arrayBuffer, filename) {
    return this.encryptWith(function(cs, prp, iv, adata) {
        cs.cattname = "";
        cs.catt = "";

        if (arrayBuffer) {
            var sliceSize = CONST.attSliceSize;
            var encryptedBase64Slices = [];
            for (var offset = 0; offset < arrayBuffer.byteLength; offset += sliceSize) {
                var slice = arrayBuffer.slice(offset, offset + sliceSize);
                var byteSlice = new Uint8Array(slice);
                var bitsSlice = sjcl.codec.bytes.toBits(byteSlice);
                var encryptedSlice = sjcl.mode[cs.mode].encrypt(prp, bitsSlice, iv, adata, cs.ts);
                var encryptedBase64Slice = sjcl.codec.base64.fromBits(encryptedSlice);
                encryptedBase64Slices.push(encryptedBase64Slice);
            }

            var filenameBits = sjcl.codec.utf8String.toBits(filename);
            var encryptedFilename = sjcl.mode[cs.mode].encrypt(prp, filenameBits, iv, adata, cs.ts);
            cs.cattname = sjcl.codec.base64.fromBits(encryptedFilename);
            cs.catt = encryptedBase64Slices;
        }
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
    this.decryptWith(function(prp, iv, adata, out) {
        // Populate the message payload
        SCA.e("payload").value = out.pl;
        
        // Check for an attachment, and decrypt it if present
        if (encData.cattname) {
            var encryptedFilenameBits = sjcl.codec.base64.toBits(encData.cattname);
            var decryptedFilenameBits = sjcl.mode[encData.mode].decrypt(prp, encryptedFilenameBits, iv, adata, encData.ts);
            var decryptedFilename = sjcl.codec.utf8String.fromBits(decryptedFilenameBits);
            SCA.e("download-label").innerHTML = decryptedFilename;
            SCA.setDisplay("att-download", "inline");

            var byteArrays = [];
            for (var i = 0; i < encData.catt.length; i++) {
                var sliceBits = sjcl.codec.base64.toBits(encData.catt[i]);
                var decryptedSlice = sjcl.mode[encData.mode].decrypt(prp, sliceBits, iv, adata, encData.ts);
                var byteNumbersSlice = sjcl.codec.bytes.fromBits(decryptedSlice);
                var byteArraySlice = new Uint8Array(byteNumbersSlice);
                byteArrays.push(byteArraySlice);
            }

            SCA.attBlob = new Blob(byteArrays, {type: "application/octet-stream"});
            SCA.attName = decryptedFilename;
        }   
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