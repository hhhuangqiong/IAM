/**
 * Override the mongoose ToJSON, it will show the virtuals field and transform the model
 * into expected JSON object format. It will hide the empty array, hide the _id key and __v
 * where _id is duplicated with id and __v is a internal mongo key for the version
 * @method mongooseToJSON
 */
const mongooseToJSON = {
  virtuals: true,
  transform: (doc, ret) => {
    /* eslint no-param-reassign: ["error", { "props": false }]*/
    // delete empty arrays, key _id which is duplicated with id,
    // __v which is internal mongo version object
    Object.keys(ret).forEach(key => {
      // delete _id as it is diplayed in form of id.
      if (Array.isArray(ret[key]) && !ret[key].length || key === '_id' || key === '__v') {
        delete ret[key];
      }
    });
  },
};

export default mongooseToJSON;
