import UserLogin from "../db/models/userLogin";

export const saveUserLogin = async (
  email: string,
  otpCode: string,
  messageId: string,
) => {
  try {
    console.log(`saveUserLogin - saving user login for email ${email}`);
    const userLogin = new UserLogin({ email, messageId, otp: otpCode });
    await userLogin.save();
  } catch (error) {
    const errorMessage = `saveUserLogin - Error saving user login ${email}: ${(error as any).message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};
