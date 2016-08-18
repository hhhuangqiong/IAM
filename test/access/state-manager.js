import * as _ from 'lodash';
import Q from 'q';

export class StateManager {
  constructor(db) {
    this.db = db;
    this.driver = this.db.connection.db;
  }
  set(state = {}) {
    const keys = _.keys(state);
    const modelKeys = this.db.modelNames();
    const diff = _.difference(keys, modelKeys);

    if (diff.length > 0) {
      const undefinedModels = diff.join(', ');
      throw new Error(`Undefined models: ${undefinedModels}`);
    }
    return Q.all([
      state,
      this.clean(),
    ]).spread(resolvedState => {
      const inserts = keys.map(key => {
        const model = this.db.model(key);
        const data = _.isArray(resolvedState[key]) ? resolvedState[key] : [resolvedState[key]];
        return model.create(data);
      });
      return Q.all(inserts)
        .then(() => resolvedState);
    });
  }
  get(models = this.db.modelNames()) {
    const existingKeys = this.db.modelNames();
    const requestedKeys = _.isArray(models) ? models : _.clone(existingKeys);
    const diff = _.difference(requestedKeys, existingKeys);

    if (diff.length > 0) {
      const undefinedModels = diff.join(', ');
      throw new Error(`Undefined model(s): ${undefinedModels}`);
    }
    const promises = requestedKeys.map(key => {
      const model = this.db.model(key);
      return model.find().then(docs => ([key, docs]));
    });
    return Q.all(promises).then(_.fromPairs);
  }
  clean() {
    return Q.invoke(this.driver, 'dropDatabase')
      .then(() => {
        const modelNames = this.db.modelNames();
        const indexPromises = modelNames.map(name => {
          const model = this.db.model(name);
          return model.ensureIndexes();
        });
        return Q.all(indexPromises);
      });
  }
}
