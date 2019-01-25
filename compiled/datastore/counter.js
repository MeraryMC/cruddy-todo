const fs = require('fs');
const path = require('path');
const sprintf = require('sprintf-js').sprintf;

var counter = 0;

// Private helper functions ////////////////////////////////////////////////////

// Zero padded numbers can only be represented as strings.
// If you don't know what a zero-padded number is, read the
// Wikipedia entry on Leading Zeros and check out some of code links:
// https://www.google.com/search?q=what+is+a+zero+padded+number%3F

const zeroPaddedNumber = num => {
  return sprintf('%05d', num);
};

const readCounter = callback => {
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
  fs.writeFile(exports.counterFile, counterString, err => {
    if (err) {
      throw 'error writing counter';
    } else {
      callback(null, counterString);
    }
  });
};

// Public API - Fix this function //////////////////////////////////////////////

exports.getNextUniqueId = callback => {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2RhdGFzdG9yZS9jb3VudGVyLmpzIl0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsInBhdGgiLCJzcHJpbnRmIiwiY291bnRlciIsInplcm9QYWRkZWROdW1iZXIiLCJudW0iLCJyZWFkQ291bnRlciIsImNhbGxiYWNrIiwicmVhZEZpbGUiLCJleHBvcnRzIiwiY291bnRlckZpbGUiLCJlcnIiLCJmaWxlRGF0YSIsIk51bWJlciIsIndyaXRlQ291bnRlciIsImNvdW50IiwiY291bnRlclN0cmluZyIsIndyaXRlRmlsZSIsImdldE5leHRVbmlxdWVJZCIsImN1cnJJZCIsIm5ld0lkIiwiam9pbiIsIl9fZGlybmFtZSJdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTUEsS0FBS0MsUUFBUSxJQUFSLENBQVg7QUFDQSxNQUFNQyxPQUFPRCxRQUFRLE1BQVIsQ0FBYjtBQUNBLE1BQU1FLFVBQVVGLFFBQVEsWUFBUixFQUFzQkUsT0FBdEM7O0FBRUEsSUFBSUMsVUFBVSxDQUFkOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU1DLG1CQUFvQkMsR0FBRCxJQUFTO0FBQ2hDLFNBQU9ILFFBQVEsTUFBUixFQUFnQkcsR0FBaEIsQ0FBUDtBQUNELENBRkQ7O0FBSUEsTUFBTUMsY0FBZUMsUUFBRCxJQUFjO0FBQ2hDUixLQUFHUyxRQUFILENBQVlDLFFBQVFDLFdBQXBCLEVBQWlDLENBQUNDLEdBQUQsRUFBTUMsUUFBTixLQUFtQjtBQUNsRCxRQUFJRCxHQUFKLEVBQVM7QUFDUEosZUFBUyxJQUFULEVBQWUsQ0FBZixFQURPLENBQ1k7QUFDcEIsS0FGRCxNQUVPO0FBQ0xBLGVBQVMsSUFBVCxFQUFlTSxPQUFPRCxRQUFQLENBQWY7QUFDRDtBQUNGLEdBTkQ7QUFPRCxDQVJEOztBQVVBLE1BQU1FLGVBQWUsQ0FBQ0MsS0FBRCxFQUFRUixRQUFSLEtBQXFCO0FBQ3hDLE1BQUlTLGdCQUFnQlosaUJBQWlCVyxLQUFqQixDQUFwQjtBQUNBaEIsS0FBR2tCLFNBQUgsQ0FBYVIsUUFBUUMsV0FBckIsRUFBa0NNLGFBQWxDLEVBQWtETCxHQUFELElBQVM7QUFDeEQsUUFBSUEsR0FBSixFQUFTO0FBQ1AsWUFBTyx1QkFBUDtBQUNELEtBRkQsTUFFTztBQUNMSixlQUFTLElBQVQsRUFBZVMsYUFBZjtBQUNEO0FBQ0YsR0FORDtBQU9ELENBVEQ7O0FBV0E7O0FBRUFQLFFBQVFTLGVBQVIsR0FBMkJYLFFBQUQsSUFBYztBQUN0Q0QsY0FBWSxDQUFDSyxHQUFELEVBQU1RLE1BQU4sS0FBaUI7QUFDM0IsUUFBSVIsR0FBSixFQUFTO0FBQ1BKLGVBQVNJLEdBQVQsRUFETyxDQUNRO0FBQ2hCLEtBRkQsTUFFTztBQUNMLFVBQUlTLFFBQVFELFNBQVMsQ0FBckI7QUFDQUwsbUJBQWFNLEtBQWIsRUFBb0IsQ0FBQ1QsR0FBRCxFQUFNSyxhQUFOLEtBQXdCO0FBQzFDLFlBQUlMLEdBQUosRUFBUztBQUNQSixtQkFBU0ksR0FBVDtBQUNELFNBRkQsTUFFTztBQUNMSixtQkFBUyxJQUFULEVBQWVTLGFBQWY7QUFDRDtBQUNGLE9BTkQ7QUFPRDtBQUNGLEdBYkQ7QUFjRCxDQWZEOztBQW1CQTs7QUFFQVAsUUFBUUMsV0FBUixHQUFzQlQsS0FBS29CLElBQUwsQ0FBVUMsU0FBVixFQUFxQixhQUFyQixDQUF0QiIsImZpbGUiOiJjb3VudGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IHNwcmludGYgPSByZXF1aXJlKCdzcHJpbnRmLWpzJykuc3ByaW50ZjtcblxudmFyIGNvdW50ZXIgPSAwO1xuXG4vLyBQcml2YXRlIGhlbHBlciBmdW5jdGlvbnMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyBaZXJvIHBhZGRlZCBudW1iZXJzIGNhbiBvbmx5IGJlIHJlcHJlc2VudGVkIGFzIHN0cmluZ3MuXG4vLyBJZiB5b3UgZG9uJ3Qga25vdyB3aGF0IGEgemVyby1wYWRkZWQgbnVtYmVyIGlzLCByZWFkIHRoZVxuLy8gV2lraXBlZGlhIGVudHJ5IG9uIExlYWRpbmcgWmVyb3MgYW5kIGNoZWNrIG91dCBzb21lIG9mIGNvZGUgbGlua3M6XG4vLyBodHRwczovL3d3dy5nb29nbGUuY29tL3NlYXJjaD9xPXdoYXQraXMrYSt6ZXJvK3BhZGRlZCtudW1iZXIlM0ZcblxuY29uc3QgemVyb1BhZGRlZE51bWJlciA9IChudW0pID0+IHtcbiAgcmV0dXJuIHNwcmludGYoJyUwNWQnLCBudW0pO1xufTtcblxuY29uc3QgcmVhZENvdW50ZXIgPSAoY2FsbGJhY2spID0+IHtcbiAgZnMucmVhZEZpbGUoZXhwb3J0cy5jb3VudGVyRmlsZSwgKGVyciwgZmlsZURhdGEpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhudWxsLCAwKTsgLy9pZiAxc3QgYXJndW1lbnQgaW4gZXJyb3IgY2FzZSBpcyBudWxsLCB0aGVuIGhvdyBkb2VzIGdldE5leHRVbmlxdWVJZCByZWNvZ25pemUgdGhlIGVycm9yP1xuICAgIH0gZWxzZSB7XG4gICAgICBjYWxsYmFjayhudWxsLCBOdW1iZXIoZmlsZURhdGEpKTtcbiAgICB9XG4gIH0pO1xufTtcblxuY29uc3Qgd3JpdGVDb3VudGVyID0gKGNvdW50LCBjYWxsYmFjaykgPT4ge1xuICB2YXIgY291bnRlclN0cmluZyA9IHplcm9QYWRkZWROdW1iZXIoY291bnQpO1xuICBmcy53cml0ZUZpbGUoZXhwb3J0cy5jb3VudGVyRmlsZSwgY291bnRlclN0cmluZywgKGVycikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIHRocm93ICgnZXJyb3Igd3JpdGluZyBjb3VudGVyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhbGxiYWNrKG51bGwsIGNvdW50ZXJTdHJpbmcpO1xuICAgIH1cbiAgfSk7XG59O1xuXG4vLyBQdWJsaWMgQVBJIC0gRml4IHRoaXMgZnVuY3Rpb24gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5leHBvcnRzLmdldE5leHRVbmlxdWVJZCA9IChjYWxsYmFjaykgPT4ge1xuICByZWFkQ291bnRlcigoZXJyLCBjdXJySWQpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjYWxsYmFjayhlcnIpOyAvL2Vycm9yIGhhbmRsaW5nIGF0IGxpbmUgMjE/XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBuZXdJZCA9IGN1cnJJZCArIDE7XG4gICAgICB3cml0ZUNvdW50ZXIobmV3SWQsIChlcnIsIGNvdW50ZXJTdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2sobnVsbCwgY291bnRlclN0cmluZyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59O1xuXG5cblxuLy8gQ29uZmlndXJhdGlvbiAtLSBETyBOT1QgTU9ESUZZIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZXhwb3J0cy5jb3VudGVyRmlsZSA9IHBhdGguam9pbihfX2Rpcm5hbWUsICdjb3VudGVyLnR4dCcpO1xuIl19