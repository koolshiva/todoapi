const {SHA256} = require("crypto-js");

var msg = "I am user number 3";

var hash = SHA256(msg);
console.log(`Hash of ${msg} \n gives \n${hash}`);
