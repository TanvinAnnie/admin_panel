
import { Schema, model, models } from "mongoose";

const PolicySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Policy title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Policy description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    icon: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "Icon cannot exceed 100 characters"],
    },

    order: {
      type: Number,
      default: 0,
      min: [0, "Order cannot be negative"],
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

const Policy = models.Policy || model("Policy", PolicySchema);

export default Policy;
