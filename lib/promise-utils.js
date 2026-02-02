/**
 *  Promise utility functions to replace Bluebird.
 *
 *  @module promise-utils
 *
 *  @copyright 2014, Digium, Inc.
 *  @license Apache License, Version 2.0
 */

'use strict';

/**
 *  Converts a Promise to a callback-style function.
 *  Mimics Bluebird's .asCallback() method.
 *
 *  @param {Promise} promise - The promise to convert
 *  @param {Function} [callback] - Optional callback function
 *  @returns {Promise} The original promise
 */
function asCallback(promise, callback) {
  if (typeof callback === 'function') {
    promise.then(
      function(result) {
        callback(null, result);
      },
      function(err) {
        callback(err);
      }
    );
  }
  return promise;
}

/**
 *  Creates a function that can only be called once.
 *  Subsequent calls return the result of the first call.
 *
 *  @param {Function} fn - The function to wrap
 *  @returns {Function} A function that only executes once
 */
function once(fn) {
  var called = false;
  var result;
  return function() {
    if (!called) {
      called = true;
      result = fn.apply(this, arguments);
    }
    return result;
  };
}

module.exports.asCallback = asCallback;
module.exports.once = once;
