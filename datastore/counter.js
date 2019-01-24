const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = (num) => {
  return sprintf('%05d', num);
};

const readCounter = (callback) => {
  fs.readFile(exports.counterFile, (err, fileData) => {
    if (err) {
      callback(null, 0); //if 1st argument in error case is null, then how does getNextUniqueId recognize the error?
    } else {
      callback(null, Number(fileData));
    }
  });
};

const writeCounter = (count, callback) => {
  var counterString = zeroPaddedNumber(count);
  fs.writeFile(exports.counterFile, counterString, (err) => {
    if (err) {
      throw ('error writing counter');
    } else {
      callback(null, counterString);
    }
  });
};

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = (callback) => {
  readCounter((err, currId) => {
    if (err) {
      callback(err); //error handling at line 21?
    } else {
      var newId = currId + 1;
      writeCounter(newId, (err, counterString) => {
        if (err) {
          callback(err);
        } else {
          callback(null, counterString);
        }
      });
    }
  });
};



// Configuration -- DO NOT MODIFY //////////////////////////////////////////////

exports.counterFile = path.join(__dirname, 'counter.txt');
