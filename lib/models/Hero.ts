
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHero extends Document {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema<IHero>(
  {
    title: {
      type: String,
      required: [true, "Hero title is required"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: [true, "Hero image is required"],
      trim: true,
    },
    buttonText: {
      type: String,
      default: "Explore Now",
      trim: true,
    },
    buttonLink: {
      type: String,
      default: "#",
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

const Hero: Model<IHero> =
  mongoose.models.Hero ||
  mongoose.model<IHero>("Hero", HeroSchema);

export default Hero;
