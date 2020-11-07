const okta = require("@okta/okta-sdk-nodejs");
const ExpressOIDC = require("@okta/oidc-middleware").ExpressOIDC;


// Define an Okta client so any user management tasks can be performed
const oktaClient = new okta.Client({
    orgUrl: 'https://dev-7698043.okta.com',
    token: '00QzhkFFYvKsZWwml4MJEzrX_SPIKj64tjW3mtTlcY'
});

// Define the OpenID Connect client
const oidc = new ExpressOIDC({
    appBaseUrl: "http://localhost:3000",
    issuer: "https://dev-7698043.okta.com/oauth2/default",
    client_id: "0oahudnthRGwlgvxb5d5",
    client_secret: "YsbVzMnx8g5N45Pn388rOXmxqgZ3fjPnlJtBFu_L",
    redirect_uri: 'http://localhost:3000/users/callback',
    scope: "openid profile",
    routes: {
        login: {
            path: "/users/login"
        },
        callback: {
            path: "/users/callback",
            defaultRedirect: "/play"
        }
    }
});


module.exports = { oidc, oktaClient };