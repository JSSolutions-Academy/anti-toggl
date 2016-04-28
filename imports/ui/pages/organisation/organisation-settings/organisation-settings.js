import './organisation-settings.html';
import './modal.html';

import './modal.js';
import '../../../../lib/organisation.js';

import { getFullName } from '../../../../modules/users.js';
import { handleMethodResult } from '../../../../modules/handle-method-result.js';
import { Mongo } from 'meteor/mongo';
import { outputHandler } from '../../../../modules/output-handler.js';
import { ReactiveVar } from 'meteor/reactive-var';

Template.organisationSettings.onCreated(function () {
  loadFilePicker('AMxXlNUEKQ1OgRo47XtKSz');
  this.iconUrl = new ReactiveVar(this.data.profile.iconUrl);
  this.organisationUsers = new ReactiveVar(this.data.users);
  this.organisationOwners = new ReactiveArray();
  this.organisationOwners.set(0, this.data.owners);

  this.usersAndRolesInOrganisation = function (userId, eventPressed) {
    let owners = this.organisationOwners.get(0);
    let ownerWithoutUserId = _.without(owners, userId);
    if (eventPressed === 'add-user-to-owner') {

      owners.push(userId);
      this.organisationOwners.set(0, owners);
      console.log(this)
      console.log(this.organisationOwners.get(0))
    } else if (eventPressed === 'remove-user-from-owners') {

      this.organisationOwners.set(ownerWithoutUserId);

    } else if (eventPressed === 'remove-from-organisation-users'){

      let usersInOrganisation = _.without(this.organisationUsers.get(), userId);
      this.organisationOwners.set(ownerWithoutUserId);
      this.organisationUsers.set(usersInOrganisation);

    }
  };
});
Template.organisationSettings.helpers({
  iconUrl(){
    let tmpl = Template.instance();
    return tmpl.iconUrl.get();
  },
  users () {
    let tmpl = Template.instance();
    return Meteor.users.find({_id: {$in: tmpl.organisationUsers.get()}});
  },
  isUserInRoleOwner () {
    let tmpl = Template.instance();
    console.log(tmpl.organisationOwners.get(0))
    if (_.contains(tmpl.organisationOwners.get(0), this._id)) {
      return true;
    }
  },
  getName () {
    return getFullName(this);
  },
  changeOrganisationUsers () {
    let tmpl = Template.instance();
    return function(value) {
      tmpl.organisationUsers.set(value);
    }
  },
  reactiveVar () {
    let tmpl = Template.instance();
    return tmpl.organisationUsers.get();
  }
});
Template.organisationSettings.events({
  'click #organisation-icon': function (event, tmpl) {
    filepicker.pick({
          mimetypes: ['image/gif','image/jpeg','image/png'],
          multiple: false
        },
        function(InkBlobs){
          tmpl.iconUrl.set(InkBlobs.url);
        },
        function(FPError){
          outputHandler(FPError.toString());
        });
  },
  'submit .edit-organisation-form': function(event, tmpl) {
    event.preventDefault();
    let data =  {
      _id: tmpl.data._id,
      name:  tmpl.$('[name=organisation-name]').val().trim(),
      description:  tmpl.$('[name=organisation-description]').val().trim(),
      profile: {
        companySite:  tmpl.$('[name=company-site]').val().trim(),
        iconUrl: tmpl.iconUrl.get()
      },
      users: tmpl.organisationUsers.get(),
      owners: tmpl.organisationOwners.get()
    };

    Meteor.call('editOrganisation', data, handleMethodResult(() => {
       Router.go('myorganisations');
    }));
  },
  'click .remove-from-organisation-users': function(event, tmpl){
    event.preventDefault();
    tmpl.usersAndRolesInOrganisation(event.target.value, 'remove-from-organisation-users');
  },
  'click .add-user-to-owners': function(event, tmpl) {
    event.preventDefault();
    tmpl.usersAndRolesInOrganisation(event.target.value, 'add-user-to-owner');
  },
  'click .remove-user-from-owners': function(event, tmpl) {
    event.preventDefault();
    tmpl.usersAndRolesInOrganisation(event.target.value, 'remove-user-from-owners');
  }
});