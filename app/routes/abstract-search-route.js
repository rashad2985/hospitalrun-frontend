import { isEmpty } from '@ember/utils';
import { Promise as EmberPromise } from 'rsvp';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import DS from 'ember-data';
import Ember from 'ember';

export default Route.extend(AuthenticatedRouteMixin, {
  searchKeys: null,
  searchModel: null,
  searchText: null,

  _findByContains(searchText) {
    let searchKeys = this.get('searchKeys');
    let searchModel = this.get('searchModel');
    let queryParams = {
      containsValue: {
        value: searchText,
        keys: searchKeys
      }
    };
    return this.store.query(searchModel, queryParams);
  },

  model(params) {
    return new EmberPromise(function(resolve) {
      let searchText = params.search_text;
      this.controllerFor('application').set('currentSearchText', searchText);
      this.set('searchText', searchText);
      this._findByContains(searchText).then(resolve, function(err) {
        resolve(new DS.AdapterPopulatedRecordArray());
        throw new Error(err);
      }.bind(this));
    }.bind(this));
  },

  setupController(controller, model) {
    this._super(controller, model);
    if (!isEmpty(model)) {
      controller.set('hasRecords', (model.get('length') > 0));
    } else {
      controller.set('hasRecords', false);
    }
    controller.set('searchText', this.get('searchText'));
    this.controllerFor('application').closeProgressModal();
    let parentController = this.controllerFor(this.get('moduleName'));
    let searchTitle = `Search Results for <i>${Ember.Handlebars.Utils.escapeExpression(this.get('searchText'))}</i>`;
    parentController.set('currentScreenTitle', searchTitle.htmlSafe());
  }

});
