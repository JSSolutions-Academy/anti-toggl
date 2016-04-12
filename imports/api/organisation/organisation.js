import { Meteor } from 'meteor/meteor';

Organisation = new Mongo.Collection('organisation');

if (Meteor.isServer) {
  Meteor.methods({
    organisationInsert: function(organisationAttributes) {

      check(organisationAttributes, {
        name: String,
        descript: String
      });

      let organisationWithSameName = Organisation.findOne({ name: organisationAttributes.name });

      if (organisationWithSameName) {
        return {
          organisationExists: true,
          _id: organisationWithSameName._id
        }
      }

      let organisation = _.extend(organisationAttributes, {
          owners: [this.userId],
          createdAt: new Date()
      });

      let organisationId = Organisation.insert(organisation);

      if (organisationId) {
        Roles.setUserRoles(this.userId, ['owner'], organisationId);

        if( Roles.userIsInRole(this.userId, 'owner', 'general_group') && Roles.userIsInRole(this.userId, 'owner', organisationId) ) {
          Roles.removeUsersFromRoles(this.userId, ['owner'], 'general_group');
        }
      }

      return organisationId;
    }

  });

}