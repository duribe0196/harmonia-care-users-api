import  UserLogin from '../db/models/userLogin'

export const saveUserLogin = async (email: string, otpCode: string, messageId: string) => {
  try {
    const userLogin = new UserLogin({email, messageId, otp: otpCode})
    await userLogin.save()
  } catch (error) {
    const errorMessage = `saveEmailOTP - Error saving OTP for email ${email}: ${(error as any).message}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}
