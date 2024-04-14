
import { Document, Schema, model } from 'mongoose';

interface UserInterface extends Document {
  username: string;
  password: string;
}

const userSchema = new Schema<UserInterface>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export const superAdmin = model<UserInterface>('superAdmin', userSchema);


