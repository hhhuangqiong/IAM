import Q from 'q';
import _ from 'lodash';

import { getContainer } from '../../../utils/ioc';

const collections = {};

function getCollection(name) {
  if (collections[name]) {
    return Q.resolve(collections[name]);
  }
  const { mongoose } = getContainer();
  return Q.ninvoke(mongoose.connection.db, 'collection', `OPENID_${name}`)
    .then(collection => {
      collections[name] = collection;
      collection.createIndexes([
        { key: { grantId: 1 } },
        { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
      ]);
      return collections[name];
    });
}

export default class MongoAdapter {
  /**
   *
   * Creates an instance of MyAdapter for an oidc-provider model.
   *
   * @constructor
   * @param {string} name Name of the oidc-provider model. One of "Session", "AccessToken",
   * "AuthorizationCode", "RefreshToken", "ClientCredentials" or "Client".
   *
   */
  constructor(name) {
    this.name = name;
  }

  /**
   *
   * Update or Create an instance of an oidc-provider model.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier that oidc-provider will use to reference this token for future
   * operations.
   * @param {object} payload Object with all properties intended for storage.
   * @param {expiresIn} integer Number of seconds intended for this model to be stored.
   *
   */
  upsert(id, payload, expiresIn) {
    let expiresAt;

    if (expiresIn) {
      const now = new Date();
      expiresAt = new Date(now.getTime() + expiresIn * 1000);
    }
    const document = Object.assign({ _id: id }, payload, { expiresAt });
    return getCollection(this.name)
      .then(collection => collection.findOneAndUpdate({ _id: id }, document, { upsert: true }));
  }

  /**
   *
   * Return previously stored instance of an oidc-provider model.
   *
   * @return {Promise} Promise fulfilled with either Object (when found and not dropped yet due to
   * expiration) or falsy value when not found anymore. Rejected with error when encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  find(id) {
    return getCollection(this.name)
      .then(collection => collection.find({ _id: id }).limit(1).next());
  }

  /**
   *
   * Mark a stored oidc-provider model as consumed (not yet expired though!). Future finds for this
   * id should be fulfilled with an object containing additional property named "consumed".
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  consume(id) {
    return getCollection(this.name)
      .then(collection => collection.findOneAndUpdate({ _id: id },
        { $set: { consumed: new Date() } }));
  }

  /**
   *
   * Destroy/Drop/Remove a stored oidc-provider model and other grant related models. Future finds
   * for this id should be fulfilled with falsy values.
   *
   * @return {Promise} Promise fulfilled when the operation succeeded. Rejected with error when
   * encountered.
   * @param {string} id Identifier of oidc-provider model
   *
   */
  destroy(id) {
    return getCollection(this.name)
      .then(collection => collection.findOneAndDelete({ _id: id }))
      .then(found => {
        if (found.value && found.value.grantId) {
          const promises = _.map(collections, collection =>
            collection.findOneAndDelete({ grantId: found.value.grantId }));
          return Promise.all(promises);
        }
        return undefined;
      });
  }
}
