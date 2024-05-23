import { Schema, model, Document } from "mongoose";

interface IUserLogin {
  messageId: string;
  otp: string;
  email: string;
}

type IUserLoginDocument = IUserLogin & Document;

const userLoginSchema: Schema = new Schema(
  {
    messageId: { type: String, required: true },
    otp: { type: String, required: true },
    email: { type: String, unique: true },
  },
  { timestamps: true },
);

const UserLogin = model<IUserLoginDocument>("UserLogin", userLoginSchema);

export default UserLogin;
