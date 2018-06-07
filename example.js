var YOURLS = require("node-yourls-api");
var yourls = new YOURLS("https://short.ly/yourls-api.php"); // You must supply an URL to your yourls-api.php
yourls.login("123456789a"); // Your secret signature token to use the API.

yourls.shorturl("https://github.com/Aex12/node-yourls") //  Url to be shortened
.then(res => {
	console.log(res.shorturl); // Log shortened url.
})
.catch(console.error); // Log possible errors
