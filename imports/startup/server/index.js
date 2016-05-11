import './api.js';

import { outputHandler } from '../../modules/output-handler.js';
import { noImage } from '../../modules/images.js';

// some weird hook that rejects sign up attempt and notifies user if no data was passed
// also sets default userpic
Accounts.onCreateUser((options, user) => {
  if(!options || !user) {
    outputHandler('error creating user');
    return;
  }

  if (options.profile) {
    options.profile.profileImage = noImage;
    user.profile = options.profile;
  }

  return user;
});