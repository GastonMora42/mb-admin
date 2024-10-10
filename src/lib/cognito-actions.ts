import { redirect } from "next/navigation";
import { 
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  resendSignUpCode,
 } from "aws-amplify/auth";
 import { getErrorMessage } from "@/utils/get-error-message";

 import { Amplify } from 'aws-amplify';

 export async function handleSignUp(
  _prevState: string | undefined,
  formData: FormData
) {
  console.log('Amplify Config:', Amplify.getConfig());
  try {
    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: String(formData.get("email")),
      password: String(formData.get("password")),
      options: {
        userAttributes: {
          email: String(formData.get("email")),
          name: String(formData.get("name")),
        },
        autoSignIn: true,
      }
    });
    console.log("Sign up complete:", isSignUpComplete, "User ID:", userId, "Next step:", nextStep);
    return { success: true, redirectTo: "/confirm-register" as const };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: getErrorMessage(error), redirectTo: "/signup" as const };
  }
}
  
export async function handleSendEmailVerificationCode(
  prevState: { message: string; errorMessage: string },
  formData: FormData
) {
  try {
    console.log('Attempting to resend code to:', String(formData.get("email")));
    await resendSignUpCode({
      username: String(formData.get("email")),
    });
    console.log('Resend code successful');
    return {
      ...prevState,
      message: "Código enviado con éxito",
      errorMessage: "",
    };
  } catch (error) {
    console.error('Error resending code:', error);
    return {
      ...prevState,
      message: "",
      errorMessage: getErrorMessage(error),
    };
  }
}
  
export async function handleConfirmSignUp(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username: String(formData.get("email")),
      confirmationCode: String(formData.get("code")),
    });
    console.log("Confirmation complete:", isSignUpComplete, "Next step:", nextStep);
    return { success: true, redirectTo: "/login" as const };
  } catch (error) {
    console.error('Confirmation error:', error);
    return { 
      success: false, 
      error: getErrorMessage(error), 
      redirectTo: "/confirm-register" as const 
    };
  }
}

export async function handleSignIn(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    const { isSignedIn, nextStep } = await signIn({
      username: String(formData.get("email")),
      password: String(formData.get("password")),
    });

    if (isSignedIn) {
      return { success: true, redirectTo: "/dashboard" };
    } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
      return { success: false, redirectTo: "/confirm-register" };
    }
    throw new Error("No se pudo iniciar sesión. Por favor, verifica tus credenciales.");
  } catch (error) {
    console.error("Ocurrió un error durante el inicio de sesión:", error);
    throw error;
  }
}

export async function handleSignOut() {
  try {
    await signOut({ global: true });
    return { success: true, redirectTo: "/login" };
  } catch (error) {
    console.error("Error durante el cierre de sesión:", getErrorMessage(error));
    return { success: false, error: getErrorMessage(error) };
  }
}

export { confirmSignUp };