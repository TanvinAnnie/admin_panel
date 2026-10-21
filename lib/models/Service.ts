
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IService extends Document {
  title: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      required: [true, "Service slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [180, "Slug cannot exceed 180 characters"],
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    image: {
      type: String,
      required: [true, "Service image is required"],
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Service: Model<IService> =
  mongoose.models.Service ||
  mongoose.model<IService>("Service", ServiceSchema);

export default Service;
