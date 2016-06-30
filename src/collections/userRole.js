import mongoose from 'mongoose';

// @TODO Sample collection
const collectionName = 'userRole';
const schema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
    required: true,
  },
});

export const userRole = mongoose.model(collectionName, schema);
