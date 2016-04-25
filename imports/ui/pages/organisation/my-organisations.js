import './my-organisations.html';
import { getOrganisationIcon } from '../../../modules/images.js';
import { getFullName } from '../../../modules/users.js';
import { Template } from 'meteor/templating';

Template.myOrganisations.helpers({
  isOwner: function(){
    return this.owners.indexOf(Meteor.userId()) !== -1;
  },
  getUsername: function(userId){
    return getFullName(userId);
  },
  iconUrl: function(){
    return getOrganisationIcon(this._id);
  }
});