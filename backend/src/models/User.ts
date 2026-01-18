import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  clerkId: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      // Note: unique indexes are automatically created for clerkId
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      // Note: unique indexes are automatically created for email
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

// Note: Do not add explicit UserSchema.index(...) calls for clerkId/email.
// Mongoose will create unique indexes automatically based on `unique: true`.

export const User = mongoose.model("User", UserSchema);
export default User;
