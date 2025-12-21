import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { useDispatch } from "react-redux";
import { setError, setSuccess } from "../store/actions";
import { ErrorMessages, SuccessMessages } from "../constants/Messages";

const resetPassword = async (email: string) => {
  const dispatch = useDispatch();

  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error: any) {
    if (error.code === 'auth/missing-email') {
      dispatch(setError({message: ErrorMessages.ENTER_VALID_EMAIL}))
    }
    console.error("Error while resetting password:", error.message);
    return { success: false, error: error.message };
  }
};

export const handleResetPassword = async (email: string) => {
  const result = await resetPassword(email);
  const dispatch = useDispatch();

  if (result.success) {
    dispatch(setSuccess({message: SuccessMessages.CHECK_EMAIL_FOR_RESET_LINK}));
  } else {
    dispatch(setError({message: ErrorMessages.UNKNOWN_ERROR}));
  }
};
