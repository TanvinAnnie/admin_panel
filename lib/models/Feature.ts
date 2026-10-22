
import { Schema, model, models } from "mongoose";

const FeatureSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Feature title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Feature description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    icon: {
      type: String,
      default: "",
      trim: true,
      maxlength: [50, "Icon cannot exceed 50 characters"],
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
      min: [0, "Display order cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Display order must be an integer",
      },
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

const Feature =
  models.Feature || model("Feature", FeatureSchema);

export default Feature;
