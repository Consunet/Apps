/**
 * @file externalised constants relating to WhisperNote
 */ 

/**
 * @namespace CONST
 * @type {object}
 * @description
 * <p>
 * Externalised constants relating to WhisperNote
 * </p>
 */
CONST.appName = 'WhisperNote';

CONST.about = {
    general: "WhisperNote allows you to safely save and restore a hidden message and/or attachment in a single encrypted HTML file.\n\n",
    unlocked: "Add a message and file via the main form, and then save an encrypted copy of the data by specifying a password and clicking Encrypt.",
    locked: "This file contains secure data which may be accessed when the correct password (used to encrypt it) is entered.",
};
    
CONST.variableCypherSettings.cattname = { desc: "Attachment filename", type: "string", mandatory: false};
CONST.variableCypherSettings.catt = { desc: "Attachment data", type: "object", mandatory: false};

CONST.attSliceSize = 1024;