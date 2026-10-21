
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPhotoAlbum extends Document {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  photos: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoAlbumSchema = new Schema<IPhotoAlbum>(
  {
    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true,
      maxlength: [150, "Title cannot exceed 150 characters"],
    },

    slug: {
      type: String,
      required: [true, "Album slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [180, "Slug cannot exceed 180 characters"],
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [
        2000,
        "Description cannot exceed 2000 characters",
      ],
    },

    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
      trim: true,
    },

    photos: {
      type: [String],
      default: [],
      validate: {
        validator: (photos: string[]) =>
          photos.every((photo) => typeof photo === "string" && photo.trim().length > 0),
        message: "Every photo must have a valid image URL",
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

const PhotoAlbum: Model<IPhotoAlbum> =
  mongoose.models.PhotoAlbum ||
  mongoose.model<IPhotoAlbum>("PhotoAlbum", PhotoAlbumSchema);

export default PhotoAlbum;
