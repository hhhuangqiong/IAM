import * as _ from 'lodash';

export class StateManager {
  constructor(connection) {
    this.db = connection;
    this.driver = this.db;
  }
  async set(state = {}) {
    const keys = _.keys(state);
    const modelKeys = this.db.modelNames();
    const diff = _.difference(keys, modelKeys);

    if (diff.length > 0) {
      const undefinedModels = diff.join(', ');
      throw new Error(`Undefined models: ${undefinedModels}`);
    }

    await this.clean();
    for (const key of keys) {
      const model = this.db.model(key);
      const data = _.isArray(state[key]) ? state[key] : [state[key]];
      await model.create(data);
    }
    return state;
  }
  async get(models = this.db.modelNames()) {
    const existingKeys = this.db.modelNames();
    const requestedKeys = _.isArray(models) ? models : _.clone(existingKeys);
    const diff = _.difference(requestedKeys, existingKeys);

    if (diff.length > 0) {
      const undefinedModels = diff.join(', ');
      throw new Error(`Undefined model(s): ${undefinedModels}`);
    }
    const pairs = [];
    for (const key of requestedKeys) {
      const model = this.db.model(key);
      pairs.push(await model.find().then(docs => ([key, docs])));
    }
    return _.fromPairs(pairs);
  }
  async clean() {
    await this.driver.dropDatabase();
    const modelNames = this.db.modelNames();
    for (const name of modelNames) {
      const model = this.db.model(name);
      await model.ensureIndexes();
    }
  }
}
