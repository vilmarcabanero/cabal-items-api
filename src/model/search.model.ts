import mongoose, { Document, Schema } from "mongoose";

interface ISearch extends Document {
  term: string;
  itemIds: mongoose.Schema.Types.ObjectId[]; // Store only item IDs
  createdAt: Date;
}

const searchSchema = new mongoose.Schema({
  term: { type: String, required: true },
  itemIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  createdAt: { type: Date, default: Date.now },
});

const Search = mongoose.model<ISearch>('Search', searchSchema);

export default Search;