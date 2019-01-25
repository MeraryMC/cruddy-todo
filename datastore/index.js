const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require ('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, counterString) => {

    if (err) {
      callback(err);
    } else {
      var path = exports.dataDir + '/' + counterString + '.txt';
      var id = counterString;
      fs.writeFile(path, text, (err) => {
        if (err) {
          console.log('There was a problem writing to file');
          callback(err);
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
};

exports.readAll = (callback) => {
  var readOneAsync = Promise.promisify(exports.readOne);
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {
      var promises = files.map((fileName) => {
        var id = fileName.split('.')[0];
        return readOneAsync(id)
          .then((todo) => todo);
      });

      Promise.all(promises).then((result) => {
        callback(null, result);
      });
      // var result = _.map(files, (fileName) => {
      //   var id = fileName.split('.')[0];
      //   var text = id;
      //   return {id, text};
      // });
      // return result;
    }
  });
};

exports.readOne = (id, callback) => {
  var path = exports.dataDir + '/' + id + '.txt';
  fs.readFile(path, (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      text = data.toString();
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  var path = exports.dataDir + '/' + id + '.txt';
  fs.access(path, (err) => {
    if (err) {
      callback(err);
    } else {
      fs.writeFile(path, text, (err) => {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, {id, text});
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  var path = exports.dataDir + '/' + id + '.txt';
  fs.unlink(path, (err) => callback(err));
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
