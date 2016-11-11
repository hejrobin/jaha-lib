'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('whatwg-fetch');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var API_ENDPOINT_URI = 'https://jaha-api.herokuapp.com';
var API_ENDPOINT_VER = 'v1';

var JahaApiLib = function () {
	_createClass(JahaApiLib, [{
		key: 'authExpired',
		get: function get() {
			if (this.authExpiresAt === null) {
				return true;
			}

			var currentTimestamp = Math.floor(Date.now() / 1000);
			return currentTimestamp > this.authExpiresAt;
		}
	}]);

	function JahaApiLib() {
		_classCallCheck(this, JahaApiLib);

		this.authExpiresAt = null;
		this.authToken = null;
		this.defaultHeaders = {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		};

		this.requestUrl = [API_ENDPOINT_URI, API_ENDPOINT_VER].join('/');
	}

	_createClass(JahaApiLib, [{
		key: 'toEndpoint',
		value: function toEndpoint(relativeUriPath) {
			return [this.requestUrl, relativeUriPath].join('/');
		}
	}, {
		key: 'toHeaders',
		value: function toHeaders() {
			var additionalHeaders = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			if (this.authToken) {
				additionalHeaders["Authorization"] = 'Bearer ' + this.authToken;
			}

			return _extends({}, this.defaultHeaders, additionalHeaders);
		}
	}, {
		key: 'toPayload',
		value: function toPayload(objectLiteral) {
			return JSON.stringify(objectLiteral);
		}
	}, {
		key: 'authenticate',
		value: function authenticate() {
			var _this = this;

			var username = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
			var password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

			if (this.authToken && !this.authExpired) {
				return Promise.resolve(true);
			}

			var endpoint = this.toEndpoint('auth');
			var request = { headers: this.toHeaders() };

			if (this.authToken === null) {
				request.method = 'POST';
				request.body = this.toPayload({
					"username": username,
					"password": password
				});
			}

			if (this.authToken && this.authExpired) {
				endpoint = this.toEndpoint('auth/refresh');
			}

			return fetch(endpoint, request).then(function (response) {
				return response.json();
			}).then(function (json) {
				if (json.token) {
					_this.authToken = json.token;
					_this.authExpiresAt = Date.parse(json.expire) / 1000;
					return true;
				}
				return false;
			});
		}
	}, {
		key: 'get',
		value: function get(endpoint) {
			var _this2 = this;

			var additionalHeaders = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			return this.authenticate().then(function () {
				return fetch(_this2.toEndpoint(endpoint), {
					headers: _this2.toHeaders(additionalHeaders),
					type: 'cors'
				}).then(function (response) {
					return response.json();
				});
			});
		}
	}, {
		key: 'post',
		value: function post(endpoint, payload) {
			var _this3 = this;

			var additionalHeaders = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			return this.authenticate().then(function () {
				return fetch(_this3.toEndpoint(endpoint), {
					method: 'POST',
					headers: _this3.toHeaders(additionalHeaders),
					body: _this3.toPayload(payload),
					type: 'cors'
				}).then(function (response) {
					return response.json();
				});
			});
		}
	}, {
		key: 'patch',
		value: function patch(endpoint, payload) {
			var _this4 = this;

			var additionalHeaders = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			return this.authenticate().then(function () {
				return fetch(_this4.toEndpoint(endpoint), {
					method: 'PATCH',
					headers: _this4.toHeaders(additionalHeaders),
					body: _this4.toPayload(payload),
					type: 'cors'
				}).then(function (response) {
					return response.json();
				});
			});
		}
	}, {
		key: 'put',
		value: function put(endpoint, payload) {
			var _this5 = this;

			var additionalHeaders = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			return this.authenticate().then(function () {
				return fetch(_this5.toEndpoint(endpoint), {
					method: 'PUT',
					headers: _this5.toHeaders(additionalHeaders),
					body: _this5.toPayload(payload),
					type: 'cors'
				}).then(function (response) {
					return response.json();
				});
			});
		}
	}, {
		key: 'delete',
		value: function _delete(endpoint, payload) {
			var _this6 = this;

			var additionalHeaders = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

			return this.authenticate().then(function () {
				return fetch(_this6.toEndpoint(endpoint), {
					method: 'DELETE',
					headers: _this6.toHeaders(additionalHeaders),
					body: _this6.toPayload(payload),
					type: 'cors'
				}).then(function (response) {
					return response.json();
				});
			});
		}
	}]);

	return JahaApiLib;
}();

exports.default = JahaApiLib;