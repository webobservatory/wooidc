Template.checkSessionIframe.helpers({
    checkSession: function() {

        var user = Meteor.user();

        if (user && user.services && user.services.wooidc && user.services.wooidc.sessionState) {

            var config = ServiceConfiguration.configurations.findOne({ service: 'wooidc' });

            if (config && config.checkSessionIframe) {
                return true;
            }

        }

        return false;
    },
    rpPath: function() {
        var url = '',
            user = Meteor.user(),
            config = ServiceConfiguration.configurations.findOne({ service: 'wooidc' });

        url = Meteor.absoluteUrl('packages/wooidc/wooidc_rpframe.html?');

        var parser = document.createElement('a');
        parser.href = config.checkSessionIframe;

        url += 'session_state=' + encodeURIComponent(user.services.wooidc.sessionState);
        url += '&client_id=' + encodeURIComponent(config.clientId);
        url += '&target=' + encodeURIComponent(parser.protocol + '//' + parser.host);


        return url;
    },
    opPath: function() {
        var config = ServiceConfiguration.configurations.findOne({ service: 'wooidc' });

        if (!config) {
            return;
        }

        return config.checkSessionIframe;
    },
    setOrder: function() {
        Meteor.defer(function() {
           $('iframe.wooidc').appendTo('body');
        });
    }
});

var wooidcLogout = function() {

    Meteor.logout();
};

window.wooidcLogout = wooidcLogout;
