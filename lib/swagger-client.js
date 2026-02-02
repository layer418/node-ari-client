/**
 *  Custom Swagger 1.1 client for Asterisk ARI.
 *
 *  Asterisk serves its API documentation in Swagger 1.1 format,
 *  which is incompatible with swagger-client v3+ (OpenAPI 2.0/3.0 only).
 *  This module provides a minimal Swagger 1.1 client compatible with
 *  the ari-client's expected internal API.
 *
 *  @module swagger-client
 *
 *  @copyright 2014, Digium, Inc.
 *  @license Apache License, Version 2.0
 */

'use strict';

var url = require('url');
var http = require('./http.js');

/**
 *  Swagger 1.1 API client.
 *
 *  @class SwaggerApi
 *  @constructor
 *  @param {Object} options - Configuration options
 *  @param {string} options.url - URL to resources.json
 *  @param {Function} options.success - Success callback
 *  @param {Function} options.failure - Failure callback
 *  @param {Object} options.auth - Auth credentials {user, pass}
 */
function SwaggerApi(options) {
  var self = this;

  self.url = options.url;
  self.success = options.success;
  self.failure = options.failure;
  self.auth = options.auth || {};
  self.ready = false;
  self.apis = {};

  self._load();
}

/**
 *  Load the API specification from the server.
 *
 *  @method _load
 *  @private
 */
SwaggerApi.prototype._load = function() {
  var self = this;
  var parsedUrl = url.parse(self.url);
  // Base URL for loading resource files (e.g., http://localhost:8088/ari/api-docs)
  var resourcesBaseUrl = self.url.replace(/\/resources\.json$/, '');

  http.get(self.url, {user: self.auth.user, pass: self.auth.pass})
    .then(function(response) {
      if (response.statusCode !== 200) {
        var err = new Error('Failed to load resources.json: ' + response.statusCode);
        return self.failure(err);
      }

      var resourcesDoc;
      try {
        resourcesDoc = JSON.parse(response.data.toString('utf-8'));
      } catch (e) {
        return self.failure(e);
      }

      var apis = resourcesDoc.apis || [];
      var pending = apis.length;

      if (pending === 0) {
        self.ready = true;
        return self.success();
      }

      apis.forEach(function(api) {
        // The api.path is like "/api-docs/asterisk.{format}"
        // We need to convert it to the actual URL by:
        // 1. Removing the "/api-docs" prefix (since resourcesBaseUrl already ends with /api-docs)
        // 2. Replacing "{format}" with "json"
        var resourcePath = api.path
          .replace(/^\/api-docs/, '')
          .replace(/\.\{format\}$/, '.json');
        var resourceUrl = resourcesBaseUrl + resourcePath;

        http.get(resourceUrl, {user: self.auth.user, pass: self.auth.pass})
          .then(function(res) {
            if (res.statusCode !== 200) {
              return checkComplete(new Error('Failed to load ' + api.path));
            }

            var resourceDoc;
            try {
              resourceDoc = JSON.parse(res.data.toString('utf-8'));
            } catch (e) {
              return checkComplete(e);
            }

            self._processResource(resourceDoc, parsedUrl);
            checkComplete();
          })
          .catch(function(err) {
            checkComplete(err);
          });
      });

      function checkComplete(err) {
        if (err) {
          return self.failure(err);
        }
        pending--;
        if (pending === 0) {
          self.ready = true;
          self.success();
        }
      }
    })
    .catch(function(err) {
      self.failure(err);
    });
};

/**
 *  Process a resource document and add it to the apis object.
 *
 *  @method _processResource
 *  @private
 *  @param {Object} resourceDoc - The resource JSON document
 *  @param {Object} parsedUrl - Parsed URL object
 */
SwaggerApi.prototype._processResource = function(resourceDoc, parsedUrl) {
  var self = this;
  // resourcePath is like "/api-docs/channels.{format}" - we need to extract "channels"
  var resourceName = resourceDoc.resourcePath
    .replace(/^\/api-docs\//, '')
    .replace(/\.\{format\}$/, '');

  // basePath in the resource doc can be a full URL (http://localhost:8088/ari)
  // or a relative path (/ari). Handle both cases.
  // Always use the protocol from the user-provided URL to handle reverse proxy scenarios
  // where Asterisk might return http:// but the client connects via https://
  var basePath = resourceDoc.basePath || '/ari';
  var baseApiUrl;
  if (basePath.startsWith('http://') || basePath.startsWith('https://')) {
    // Extract just the path from the basePath and use the user-provided protocol/host
    var basePathUrl = url.parse(basePath);
    baseApiUrl = parsedUrl.protocol + '//' + parsedUrl.host + (basePathUrl.pathname || '/ari').replace(/\/$/, '');
  } else {
    baseApiUrl = parsedUrl.protocol + '//' + parsedUrl.host + basePath.replace(/\/$/, '');
  }

  console.log('base api url', baseApiUrl);
  

  // Transform models to the format expected by the client
  // The client expects models[EventName].properties to be an object where each
  // property has a 'name' and 'dataType' field
  var rawModels = resourceDoc.models || {};
  var transformedModels = {};

  Object.keys(rawModels).forEach(function(modelName) {
    var rawModel = rawModels[modelName];
    var transformedProps = {};

    if (rawModel.properties) {
      Object.keys(rawModel.properties).forEach(function(propName) {
        var rawProp = rawModel.properties[propName];
        transformedProps[propName] = {
          name: propName,
          dataType: rawProp.type || rawProp.dataType,
          description: rawProp.description,
          descr: rawProp.description,
          required: rawProp.required
        };
      });
    }

    transformedModels[modelName] = {
      id: rawModel.id,
      description: rawModel.description,
      properties: transformedProps
    };
  });

  self.apis[resourceName] = {
    operations: {},
    models: transformedModels,
    rawModels: rawModels
  };

  var apis = resourceDoc.apis || [];
  apis.forEach(function(api) {
    var operations = api.operations || [];
    operations.forEach(function(op) {
      var operationName = op.nickname;

      self.apis[resourceName].operations[operationName] = {
        type: op.responseClass || op.type || null,
        summary: op.summary || '',
        parameters: op.parameters || [],
        resourceName: resourceName
      };

      // Create callable operation
      self.apis[resourceName][operationName] = self._createOperation(
        baseApiUrl,
        api.path,
        op
      );
    });
  });
};

/**
 *  Create a callable operation function.
 *
 *  @method _createOperation
 *  @private
 *  @param {string} baseUrl - Base API URL
 *  @param {string} path - API path with parameter placeholders
 *  @param {Object} operation - Operation definition
 *  @returns {Function} Callable operation function
 */
SwaggerApi.prototype._createOperation = function(baseUrl, path, operation) {
  var self = this;
  var method = operation.httpMethod || operation.method || 'GET';
  var params = operation.parameters || [];

  return function(options, successCallback, errorCallback) {
    options = options || {};

    // Build the URL with path parameters
    var requestPath = path;
    var queryParams = [];
    var bodyContent = null;

    params.forEach(function(param) {
      var value = options[param.name];

      if (value !== undefined && value !== null) {
        if (param.paramType === 'path') {
          requestPath = requestPath.replace('{' + param.name + '}', encodeURIComponent(value));
        } else if (param.paramType === 'query') {
          if (Array.isArray(value)) {
            value.forEach(function(v) {
              queryParams.push(encodeURIComponent(param.name) + '=' + encodeURIComponent(v));
            });
          } else {
            queryParams.push(encodeURIComponent(param.name) + '=' + encodeURIComponent(value));
          }
        } else if (param.paramType === 'body') {
          bodyContent = options.body || value;
        }
      }
    });

    // Handle body parameter if passed directly
    if (options.body && !bodyContent) {
      bodyContent = options.body;
    }

    var requestUrl = baseUrl + requestPath;
    if (queryParams.length > 0) {
      requestUrl += '?' + queryParams.join('&');
    }

    var reqOptions = {
      user: self.auth.user,
      pass: self.auth.pass
    };

    if (bodyContent) {
      reqOptions.body = typeof bodyContent === 'string' ? bodyContent : JSON.stringify(bodyContent);
    }

    http.request(method, requestUrl, reqOptions)
      .then(function(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          successCallback(response);
        } else {
          errorCallback(response);
        }
      })
      .catch(function(err) {
        errorCallback(err);
      });
  };
};

module.exports.SwaggerApi = SwaggerApi;
