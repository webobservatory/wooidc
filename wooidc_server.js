Wooidc = {};
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

OAuth.registerService('wooidc', 2, null, function (query) {

    //var sslRootCAs = require('ssl-root-cas/latest');
    //sslRootCAs.inject();

    var response = getTokens(query);
    var expiresAt = (+new Date) + (1000 * parseInt(response.expires_in, 10));
    var accessToken = response.access_token;
    var identity = getUserProfile(accessToken);

    var username = identity.name || identity.email;
    var serviceData = {
        id:           identity.sub,
        accessToken:  OAuth.sealSecret(accessToken),
        refreshToken: response.refresh_token,
        scope:        response.scope,
        id_token:     response.id_token,
        expiresAt:    expiresAt,
        sessionState: response.session_state,
        name:         username
    };

    _.extend(serviceData, identity);

    var profile = {
        name: username
    };

    if (identity.address) {
        identity.address = JSON.parse(identity.address);
    }

    _.extend(profile, identity);

    return {
        serviceData: serviceData,
        options: {
            profile: profile
        }
    };
});

var userAgent = 'Meteor';
if (Meteor.release) {
    userAgent += '/' + Meteor.release;
}

var getTokens = function (query) {
    var config = ServiceConfiguration.configurations.findOne({service: 'wooidc'});
    if (!config)
      throw new ServiceConfiguration.ConfigError();

    //getConfiguration();
    var response;
    console.log(config);
    console.log(config.domain);
    console.log(config.clientId);
    console.log(OAuth.openSecret(config.clientSecret));
    console.log(OAuth._redirectUri('wooidc',config));

    try {

        var options = _.extend(Wooidc.httpOptions(), {
                headers: {
                    Accept: 'application/json',
                    'User-Agent': userAgent
                },
               params: {
                    code:           query.code,
                    //state:          query.state,
                    client_id:      config.clientId,
                    client_secret:  OAuth.openSecret(config.clientSecret),
                    grant_type:     'authorization_code',
                    redirect_uri:   OAuth._redirectUri('wooidc',config)
                    //Meteor.absoluteUrl('_oauth/wooidc?close')
                }
       });

        response = HTTP.post(
            'https://' + config.domain +'/oauth/token', options
            );

        if(response.error) // if the http response was an error
        {
            throw response.error;
        }
        if(typeof response.content === 'string') {
            response.content = JSON.parse(response.content);
        }
        if(response.content.error) {
            throw response.content;
        }
    }

    catch (err) {
        console.log(query);
        console.log(response);
        throw _.extend(new Error('Failed to complete OAuth handshake with WO OIDCP. ' + err.message),
                      { response: err.response });
    }

    if (response.data.error) { // if the http response was a json object with an error attribute
        throw new Error('Failed to complete OAuth handshake with WO OIDCP. ' + response.data.error);
    }
    else{
        return response.data;
    }
};

var getUserProfile = function (accessToken) {
    var config = getConfiguration();
    var response = {rejectUnauthorized: false};;
    try {
        response = HTTP.get(
            'https://'+config.domain+'/api/userInfo', {
                headers: {
                    'User-Agent': userAgent
                },
                params: {
                    access_token: accessToken
                }
            });
    }
    catch (err) {
        throw _.extend(
            new Error('Failed to fetch user profile from WO OIDCP. ' + err.message), { response: err.response });
    }

    return response.data;
};

var getConfiguration = function () {
    var config = ServiceConfiguration.configurations.findOne({ service: 'wooidc' });
    if (!config) {
        throw new ServiceConfiguration.ConfigError('Service not configured.');
    }

    return config;
};

Wooidc.retrieveCredential = function(credentialToken, credentialSecret) {
    var cred = OAuth.retrieveCredential(credentialToken, credentialSecret);
    console.log(cred);
    return cred;
};

Wooidc.httpOptions = function() {
    if(Meteor.settings.wp_oauth_accept_invalid_certs) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        return { npmRequestOptions: { rejectUnauthorized: false } };
    }
    return {};

};

Meteor.publish('wooidcSessionState', function(){
    return Meteor.users.find(
        {
            _id: this.userId
        },
        {
            fields: {
                'services.wooidc.sessionState': 1
            }
        }
    );
});
