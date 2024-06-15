import UserLogin from "../db/models/userLogin";

export const saveUserLogin = async (
  email: string,
  otpCode: string,
  messageId: string,
) => {
  try {
    console.log(`saveUserLogin - saving user login for email ${email}`);
    await UserLogin.findOneAndUpdate(
      { email },
      { messageId, otp: otpCode },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log(`saveUserLogin - saved user login for email ${email}`);
  } catch (error) {
    const errorMessage = `saveUserLogin - Error saving user login ${email}: ${(error as any).message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};
