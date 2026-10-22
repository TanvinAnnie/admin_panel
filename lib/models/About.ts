
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAbout extends Document {
  title: string;
  subtitle: string;
  story: string;
  image: string;
  mission: string;
  vision: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AboutSchema = new Schema<IAbout>(
  {
    title: {
      type: String,
      required: [true, "About title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    subtitle: {
      type: String,
      trim: true,
      maxlength: [250, "Subtitle cannot exceed 250 characters"],
      default: "",
    },

    story: {
      type: String,
      required: [true, "About story is required"],
      trim: true,
      maxlength: [5000, "Story cannot exceed 5000 characters"],
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    mission: {
      type: String,
      trim: true,
      maxlength: [2000, "Mission cannot exceed 2000 characters"],
      default: "",
    },

    vision: {
      type: String,
      trim: true,
      maxlength: [2000, "Vision cannot exceed 2000 characters"],
      default: "",
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

const About: Model<IAbout> =
  (mongoose.models.About as Model<IAbout>) ||
  mongoose.model<IAbout>("About", AboutSchema);

export default About;
