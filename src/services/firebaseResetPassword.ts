import { sendPasswordResetEmail } from "firebase/auth";
import { Alert } from "react-native";
import { auth } from "./firebaseConfig";

const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log("The password reset link has been sent!");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/missing-email') {
      error.message = 'Please enter e-mail';
    }
    console.error("Error while resetting password:", error.message);
    return { success: false, error: error.message };
  }
};

export const handleResetPassword = async (email: string) => {
  const result = await resetPassword(email);
  if (result.success) {
    Alert.alert(
      'Success',
      'Check your email – we’ve sent a link to reset your password!'
    );
  } else {
    Alert.alert(
      'Error',
      result.error || 'Something went wrong.'
    );
  }
};
