/**
 * @file externalised constants relating to SCA Apps
 */ 

/**
 * @namespace SCA_CONSTANTS
 * @type {object}
 * @description
 * <p>
 * Externalised constants relating to SCA Apps
 * </p>
 */
var CONST = {
    errorImportFileFormat: "File format incorrect.",
    errorDecrypt: "Incorrect password, or data has been corrupted",
    errorInvalidCypherSettings: "Invalid cypher settings",
    errorImportFailed: "Import failed: ",
    errorApplicationTypeNotFound: "Could not determine application type.",
    errorWrongApplicationType: "Incorrect application type",
    cypherSettings: {
        v: 1,
        iter: 1000,
        ks: 256,
        ts: 128,
        mode: "ocb2",
        cipher: "aes"
    },
    variableCypherSettings: {
        iv: { desc: "Initialisation Vector", type: "string", mandatory: true},
        salt: { desc: "Salt", type: "string", mandatory: true},
        adata: { desc: "Hint", type: "string", mandatory: false},
        ct: { desc: "Cypher text", type: "string", mandatory: false}
    },
    regexEncryptedData: /<script id="encrypted-data" type="text\/javascript">var encData=(.+);<\/script>/g,
    regexAppType: /<meta name="sca-app-type" content="(\w+)"/g
};