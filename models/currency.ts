import mongoose, { Schema, Document } from 'mongoose';

export interface ICurrency extends Document {
  _id: string;
  symbol: string;
  name: string;
  rates: Map<string, number>;
}

const currencySchema: Schema = new Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  rates: {
    type: Map,
    of: Number,
  },
});

export default mongoose.model<ICurrency>('Currency', currencySchema);
