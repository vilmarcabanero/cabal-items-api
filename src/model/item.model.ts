// src/item.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IItem extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  price: number;
  date: Date;
  details: string;
}

const itemSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: Date, required: false, default: new Date() },
  details: { type: String, required: false },
});

const Item = mongoose.model<IItem>('Item', itemSchema);

export default Item;
