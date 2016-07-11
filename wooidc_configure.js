Template.configureLoginServiceDialogForWooidc.helpers({
    siteUrl: function () {
        return Meteor.absoluteUrl();
    }
});

Template.configureLoginServiceDialogForWooidc.fields = function () {
    return [
        { property: 'domain', label: 'Domain'},
        { property: 'clientId', label: 'Client ID'},
        { property: 'clientSecret', label: 'Client Secret'}
        //Commenting below properties as they are the pre-defined endpoint routes.
        //{ property: 'authorizationEndpoint', label: 'Authorization Endpoint'},
        //{ property: 'tokenEndpoint', label: 'Token Endpoint'},
        //{ property: 'userinfoEndpoint', label: 'Userinfo Endpoint'}
   ];
};
