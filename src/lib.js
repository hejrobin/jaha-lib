import 'whatwg-fetch';

const API_ENDPOINT_URI = 'https://jaha-api.herokuapp.com';
const API_ENDPOINT_VER = 'v1';

export default class JahaApiLib {

	authExpiresAt = null

	authToken = null

	defaultHeaders = {
		'Accept': 'application/json',
		'Content-Type': 'application/json'
	}

	get authExpired() {
		if (this.authExpiresAt === null) {
			return true;
		}
		
		let currentTimestamp = Math.floor(Date.now() / 1000);
		return currentTimestamp > this.authExpiresAt;
	}

	constructor() {
		this.requestUrl = [API_ENDPOINT_URI, API_ENDPOINT_VER].join('/');
	}

	toEndpoint(relativeUriPath) {
		return [this.requestUrl, relativeUriPath].join('/');
	}

	toHeaders(additionalHeaders = {}) {
		if (this.authToken) {
			additionalHeaders["Authorization"] = 'Bearer ' + this.authToken
		}

		return {...this.defaultHeaders, ...additionalHeaders}
	}

	toPayload(objectLiteral) {
		return JSON.stringify(objectLiteral);
	}

	authenticate(username = null, password = null) {
		if (this.authToken && !this.authExpired) {
			return Promise.resolve(true);
		}
		
		let endpoint = this.toEndpoint('auth');
		let request = { headers: this.toHeaders() };

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

		return fetch(endpoint, request).then((response) => {
			return response.json();
		}).then((json) => {
			if(json.token) {
				this.authToken = json.token;
				this.authExpiresAt = Date.parse(json.expire) / 1000;
				return true;
			}
			return false;
		});
	}

	get(endpoint, additionalHeaders = {}) {
		return this.authenticate().then(() => {
			return fetch(this.toEndpoint(endpoint), {
				headers: this.toHeaders(additionalHeaders)
			})
		});
	}

	post(endpoint, payload, additionalHeaders = {}) {
		return this.authenticate().then(() => {
			return fetch(this.toEndpoint(endpoint), {
				method: 'POST',
				headers: this.toHeaders(additionalHeaders),
				body: this.toPayload(payload)
			})
		});
	}

	patch(endpoint, payload, additionalHeaders = {}) {
		return this.authenticate().then(() => {
			return fetch(this.toEndpoint(endpoint), {
				method: 'PATCH',
				headers: this.toHeaders(additionalHeaders),
				body: this.toPayload(payload)
			})
		});
	}

}
