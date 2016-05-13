Package.describe({
  name: 'devasena:wooidc',
  version: '0.0.2',
  // Brief, one-line summary of the package.
  summary: 'Southampton web observatory OpenID Connect Login flow',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Southampton-RSG/wooidc.git',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.2.1');
  api.use('ecmascript');

  api.use('oauth2', ['client','server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use('underscore', ['client']);
  api.use('templating', ['client']);
  api.use('random', ['client']);

  api.use('service-configuration', ['client','server']);  

  api.export('Wooidc');

  api.addFiles(['wooidc_configure.html', 'wooidc_configure.js', 'wooidc_check_session.html', 'wooidc_check_session.js', 'wooidc_client.js'], 'client');

  api.addFiles('wooidc_server.js', 'server');
  api.addAssets('wooidc_rpframe.html', 'client'); 
  
});

Package.onTest(function(api) {
  api.use('ecmascript');
  api.use('tinytest');
  api.use('devasena:wooidc');
  api.addFiles('wooidc-tests.js');
});
