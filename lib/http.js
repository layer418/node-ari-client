/**
 *  HTTP utility using native http/https modules.
 *
 *  @module http
 *
 *  @copyright 2014, Digium, Inc.
 *  @license Apache License, Version 2.0
 */

'use strict';

var http = require('http');
var https = require('https');
var url = require('url');

/**
 *  Makes an HTTP request using native Node.js modules.
 *
 *  @param {string} method - HTTP method (GET, POST, PUT, DELETE, etc.)
 *  @param {string} requestUrl - The URL to request
 *  @param {Object} options - Request options
 *  @param {string} [options.user] - Username for Basic Auth
 *  @param {string} [options.pass] - Password for Basic Auth
 *  @param {string} [options.body] - Request body (for POST/PUT)
 *  @param {Object} [options.headers] - Additional headers
 *  @returns {Promise} Resolves with {statusCode, headers, data}
 */
function request(method, requestUrl, options) {
  options = options || {};

  return new Promise(function(resolve, reject) {
    var parsedUrl = url.parse(requestUrl);
    var isHttps = parsedUrl.protocol === 'https:';
    var transport = isHttps ? https : http;

    var reqOptions = {
      method: method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      headers: options.headers || {}
    };

    // Add Basic Auth if provided
    if (options.user && options.pass) {
      var auth = Buffer.from(options.user + ':' + options.pass).toString('base64');
      reqOptions.headers['Authorization'] = 'Basic ' + auth;
    }

    // Add Content-Type for JSON body
    if (options.body) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    var req = transport.request(reqOptions, function(res) {
      var chunks = [];

      res.on('data', function(chunk) {
        chunks.push(chunk);
      });

      res.on('end', function() {
        var data = Buffer.concat(chunks);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', function(err) {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

/**
 *  Makes a GET request.
 *
 *  @param {string} requestUrl - The URL to request
 *  @param {Object} options - Request options
 *  @returns {Promise} Resolves with {statusCode, headers, data}
 */
function get(requestUrl, options) {
  return request('GET', requestUrl, options);
}

/**
 *  Makes a POST request.
 *
 *  @param {string} requestUrl - The URL to request
 *  @param {Object} options - Request options
 *  @returns {Promise} Resolves with {statusCode, headers, data}
 */
function post(requestUrl, options) {
  return request('POST', requestUrl, options);
}

/**
 *  Makes a PUT request.
 *
 *  @param {string} requestUrl - The URL to request
 *  @param {Object} options - Request options
 *  @returns {Promise} Resolves with {statusCode, headers, data}
 */
function put(requestUrl, options) {
  return request('PUT', requestUrl, options);
}

/**
 *  Makes a DELETE request.
 *
 *  @param {string} requestUrl - The URL to request
 *  @param {Object} options - Request options
 *  @returns {Promise} Resolves with {statusCode, headers, data}
 */
function del(requestUrl, options) {
  return request('DELETE', requestUrl, options);
}

module.exports.request = request;
module.exports.get = get;
module.exports.post = post;
module.exports.put = put;
module.exports.del = del;
