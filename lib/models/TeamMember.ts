
import { model, models, Schema } from "mongoose";

const TeamMemberSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Team member name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"],
    },

    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
      maxlength: [150, "Position cannot exceed 150 characters"],
    },

    image: {
      type: String,
      required: [true, "Profile image is required"],
      trim: true,
    },

    imagePublicId: {
      type: String,
      default: "",
      trim: true,
    },

    facebook: {
      type: String,
      default: "",
      trim: true,
    },

    instagram: {
      type: String,
      default: "",
      trim: true,
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
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

const TeamMember =
  models.TeamMember ||
  model("TeamMember", TeamMemberSchema);

export default TeamMember;
