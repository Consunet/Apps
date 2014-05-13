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
    version: 1.3,
    cypherSettings: {
        iter: 1000,
        ks: 256,
        ts: 128,
        mode: "ocb2",
        cipher: "aes"
    },
    variableCypherSettings: {
        v:  { desc: "_('Version')", type: "number", mandatory: true},
        iv: { desc: "_('Initialisation Vector')", type: "string", mandatory: true},
        salt: { desc: "_('Salt')", type: "string", mandatory: true},
        adata: { desc: "_('Hint')", type: "string", mandatory: false},
        ct: { desc: "_('Cypher text')", type: "string", mandatory: false}
    },
    regexEncryptedData: /<script id="encrypted-data" type="text\/javascript">var encData=(.+);<\/script>/g,
    regexAppType: /<meta name="sca-app-type" content="(\w+)"/g,
    defaultTimeoutPeriodMins: 2
};