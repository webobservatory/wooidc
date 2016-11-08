Wooidc = {};

//var selectedWONode;

// Request Web Observatory (Southampton) credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on error.

Wooidc.requestCredential = function (options, wonode, credentialRequestCompleteCallback) {

    // support both (options, callback) and (callback).
    if (!credentialRequestCompleteCallback && typeof options === 'function') {
        credentialRequestCompleteCallback = options;
        options = {};
    } else if (!options){
      options = {};
    }

    var config = ServiceConfiguration.configurations.findOne({ service: 'wooidc' });

    if (!config) {
        credentialRequestCompleteCallback(new ServiceConfiguration.ConfigError(new ServiceConfiguration.ConfigError()));
        return;
    }
    //console.log("WO Configured domains: ",config);
   
    var configDomains = config.config;

    //console.log("Configured Domains and credentials are as below: ", configDomains);

    //Reading the array of configured WO domains and comparing with the clicked domain for login.

    var nodesList = ServiceConfiguration.configurations;

    configDomains.forEach(function(doc) {

      console.log("Printing each configured domain: ",doc.domain);

      if(doc.domain == wonode){

         //Aggregating Meteor login accounts data to get separate WO configured nodes with their respective domain names and credential details
         /*var nodesList = ServiceConfiguration.configurations;
         var pipeline = [
                    {$match :{service: "wooidc"}}, {$unwind: "$config"}, {$project: {_id: "$_id", service: "$service", domain: "$doc.domain",clientId: "$doc.clientId",secret: "$doc.secret"}}
                   ]; 
         nodesList.aggregate(pipeline, function(err, result) {
              if(err) console.log(err);
              
              console.log("Clicked configuration after aggregation is: ", result);

         });*/
       
         //Creating config again based on clicked web observatory node. 
         console.log("Clicked domain is: ", doc.domain);
         config.domain = doc.domain;
         config.clientId = doc.clientId;
         config.secret = doc.secret;
         config.loginStyle = true;
         config = {_id: config._id, service: config.service, domain: doc.domain, clientId: doc.clientId, secret: doc.secret, loginStyle: config.loginStyle};
        }

    });

    //console.log("Selected wo node configuration: ", config);

    var credentialToken = Random.secret();
    var loginStyle = OAuth._loginStyle('wooidc', config, options);

    options = options || {};
    options.response_type = options.response_type || 'code';
    options.client_id = config.clientId;
    options.redirect_uri = OAuth._redirectUri('wooidc', config);
    
    //Checking the redirect URL
    console.log("Redirect URI is: ", options.redirect_uri);

    options.state = OAuth._stateParam(loginStyle, credentialToken, options && options.redirectUrl);

    var scope = config.requestPermissions || ['openid', 'email'];

    options.scope = scope.join(' ');

    if (config.loginStyle && config.loginStyle == 'popup') {
        options.display = 'popup';
    }

    var loginUrl = 'https://' + config.domain + '/oauth/authorise/'+ '?';

    for (var k in options) {
        loginUrl += '&' + encodeURIComponent(k) + '=' + encodeURIComponent(options[k]);
    }

    options.popupOptions = options.popupOptions || {};
    var popupOptions = {
        width:  options.popupOptions.width || 900,
        height: options.popupOptions.height || 450
    };


    Oauth.launchLogin({
        loginService: 'wooidc',
        loginStyle: loginStyle,
        loginUrl: loginUrl,
        credentialRequestCompleteCallback: credentialRequestCompleteCallback,
        credentialToken: credentialToken,
        popupOptions: popupOptions
    });

    selectedWONode = Meteor.call('selectedWOnode',wonode);
    console.log("WO Node to be logged into is: ", selectedWONode);
   
    /* Exports */
    //if (typeof Package === "undefined") Package = {};
    
   Package.wooidc = {
      selectedWONode: selectedWONode
    };

   
};


Meteor.subscribe('wooidcSessionState');
