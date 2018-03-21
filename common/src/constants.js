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
    version: 1.5,
    cypherSettings: {
        iter: 1000, // maintained for backwards compatibility
        ks: 256, // maintained for backwards compatibility
        ts: 128, // maintained for backwards compatibility
        mode: "ocb2", // maintained for backwards compatibility
        cipher: "aes", // maintained for backwards compatibility
        keyHashAlgorithm: "SHA-256",
        cipherAlgorithm: "AES-CBC"
    },
    variableCypherSettings: {
        v:  { desc: "<%= Version %>", type: "number", mandatory: true},
        iv: { desc: "<%= InitialisationVector %>", type: "string", mandatory: true},
        salt: { desc: "<%= Salt %>", type: "string", mandatory: false}, // maintained for backwards compatibility
        adata: { desc: "<%= Hint %>", type: "string", mandatory: false},
        ct: { desc: "<%= CypherText %>", type: "string", mandatory: false}
    },
    regexEncryptedData: /<script id="encrypted-data" type="text\/javascript">var encData=(.+);<\/script>/g,
    regexAppType: /<meta name="sca-app-type" content="(\w+)"/g,
    defaultTimeoutPeriodMins: 2
};