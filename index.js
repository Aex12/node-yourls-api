"use strict";

var request = require('request');
var md5 = require('md5');

class YOURLS {

	constructor (API_URL) {
		if (API_URL && /^https?:\/\//.test(API_URL))
			this.API_URL = API_URL;
		else
			throw new Error('You must initialize YOURLS API with an url to your yourls-api.php.');
	}

	login (secret_signature, YOURLS_NONCE_LIFE) {
		this.YOURLS_NONCE_LIFE = YOURLS_NONCE_LIFE || 3600*12;

		if (secret_signature)
			this.secret_signature = secret_signature;
		else
			throw new Error('You must provide a valid signature for YOURLS API');
		
		this.login_time = (Date.now() / 1000 | 0);
		this.signature = md5( this.login_time + this.secret_signature);
	}

	checkNonceLife () {
		var current_time = (Date.now() / 1000 | 0);
		if (current_time > (this.login_time + this.YOURLS_NONCE_LIFE - 150)) {
			this.signature = md5( current_time + this.secret_signature);
			this.login_time = current_time;
		}
	}

	request (action, parameters={}) {
		return new Promise((resolve, reject) => {
			this.checkNonceLife();
			parameters = Object.assign(parameters, {timestamp: this.login_time, signature: this.signature, action, format: "json"});
			request.post(this.API_URL, {form: parameters}, function(err,httpResponse,body){
				if (!err && httpResponse.statusCode == 200) {
					try {
						resolve(JSON.parse(body));
					} catch (e) {
						reject("Can't decode JSON response");
					}
				} else {
					if(err)
						reject(err);
					else {
						try {
							reject(JSON.parse(body));
						} catch (e) {
							reject(body);
						}
					}
				}
			});
		});
	}

	shorturl (url, parameters={}) {
		return this.request("shorturl", Object.assign(parameters, {url}));
	}

	expand (shorturl) {
		return this.request("expand", {shorturl});
	}

	urlstats (shorturl) {
		return this.request("url-stats", {shorturl});
	}

	stats (filter, limit) {
		return this.request("stats", {filter, limit});
	}

	dbstats () {
		return this.request("db-stats");
	}
}

module.exports = YOURLS;