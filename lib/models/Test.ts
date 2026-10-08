import mongoose, { Schema, Model } from "mongoose";

export interface ITest {
  name: string;
}

const TestSchema = new Schema<ITest>(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Test: Model<ITest> =
  mongoose.models.Test ||
  mongoose.model<ITest>("Test", TestSchema);

export default Test;