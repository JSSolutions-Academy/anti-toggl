import './user-profile.html';

import { Template } from 'meteor/templating';
import { loadFilePicker } from 'meteor/natestrauser:filepicker-plus';

import '../../startup/client/config.js';
import '../components/gravatar/gravatar.js';
import { handleMethodResult } from '../../modules/handle-method-result.js';
import { outputHandler } from '../../modules/output-handler.js';
import { regExEmail } from '../../modules/regex.js';

Template.userProfile.onCreated(function () {
  // should be defined other way: meteor settings or env var, I guess
  loadFilePicker('AMxXlNUEKQ1OgRo47XtKSz');
  this.subscribe('organisation');


  this.updateUserProfile = (fieldName) => {
    return function (response, newValue) {
      let userId    = Meteor.userId();
      let options   = {};

      options[fieldName] = newValue;

      Meteor.call('users.update', userId, options, handleMethodResult());
    }
  };
});

Template.userProfile.onRendered(function () {
  let fieldsConfig = [{
    name: 'profile\\.firstName',
    title: 'Enter first name'
  }, {
    name: 'profile\\.lastName',
    title: 'Enter last name'
  }, {
    name: 'emails\\.0\\.address',
    title: 'Enter email'
  }];
  
  let trimSlashes = text => text.replace(/\\/g, '');
  let tmpl = Template.instance();

  fieldsConfig.forEach((field) => {
    let configObject = {
      pk: Meteor.userId(),
      title: field.title,
      success: tmpl.updateUserProfile(trimSlashes(field.name)),
      validate: function(value) {
        return validateOnRequire(value);
      }
    };

    if (field.name.includes('email')) {
      configObject.validate = function(value) {
        return validateOnRequire(value) || validateEmail(value);
      }
    }

    this.$('#' + field.name).editable(configObject);
  });
});

Template.userProfile.helpers({
  email: function () {
    let user = Meteor.user();
    return user && user.emails && user.emails[0].address;
  },
  isNotVerifiedEmail: function () {
    let user = Meteor.user();
    let isVerifiedEmail = user && user.emails && user.emails[0].verified;
    
    return !isVerifiedEmail;
  },
  organizations: function () {
    let userId = Meteor.userId();
    let organizationIds = Roles.getGroupsForUser(userId);
    
    //seems like we dont need this additional filtering. Just take whole Organization
    return Organisation.find({ _id: { $in: organizationIds } }).fetch();
  },
});

Template.userProfile.events({
  //'click #user-avatar': function () {
  //  filepicker.pick({
  //      mimetypes: ['image/gif','image/jpeg','image/png'],
  //      multiple: false
  //    },
  //    function(InkBlobs){
  //      updateUserProfile('profile.profileImage')('', InkBlobs.url);
  //    },
  //    function(FPError){
  //      outputHandler(FPError.toString());
  //  });
  //}
});

function updateUserProfile (fieldName) {
  return function (response, newValue) {
    let userId    = Meteor.userId();
    let options   = {};

    options[fieldName] = newValue;

    Meteor.call('users.update', userId, options, handleMethodResult());
  }
}

function validateEmail (email) {
  if (!regExEmail(email)) {
    return 'Enter valid email';
  }
}

function validateOnRequire (value) {
  if ($.trim(value) == '') {
    return 'This field is required';
  }
}