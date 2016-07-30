import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import Auth0Lock from 'auth0-lock';

import './auth0-lock-common';

const { AUTH0_CLIENT_ID, AUTH0_DOMAIN, options } = Meteor.settings.public.auth0;

let Lock = null;

if (AUTH0_CLIENT_ID && AUTH0_DOMAIN) {
  Lock = new Auth0Lock(
    AUTH0_CLIENT_ID, AUTH0_DOMAIN, _.extend({
      auth: { redirect: false },
      autoclose: true,
    }, options), (err, res) => {
      if (err) {
        // TODO: handle error
      } else {
        const { accessToken, profile } = res;
        Accounts.callLoginMethod({
          methodArguments: [{
            auth0: { profile, token: accessToken },
          }],
        });
      }
    }
  );

  Lock.on("authenticated", function(authResult) {
    Lock.getProfile(authResult.idToken, function(err, profile) {
      if (err) {
        // TODO: handle error
        // console.log('Cannot get user :(', err);
      }
      const auth0 = { profile, token : authResult.idToken };
      Accounts.callLoginMethod({ methodArguments: [{auth0}]});
    });
  });

  Lock.logout = () => {
    Meteor.logout();
  };

  Meteor.lock = Lock;
}

export { Lock };
