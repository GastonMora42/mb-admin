import { redirect } from "next/navigation";
import { 
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  resendSignUpCode,
  getCurrentUser,
  fetchUserAttributes
} from "aws-amplify/auth";
import { Amplify } from 'aws-amplify';
import { getErrorMessage } from "@/utils/get-error-message";

// Interfaces
interface AuthResponse {
  [x: string]: any;
  success: boolean;
  redirectTo: string;
  error?: string;
  user?: any;
}

interface VerificationResponse {
  message: string;
  errorMessage: string;
}

interface SignUpFormData {
  email: string;
  password: string;
  name: string;
  role: string;
}

// Verificar estado de autenticación
export async function checkAuthStatus(_context?: any): Promise<AuthResponse> {
  try {
    const currentUser = await getCurrentUser();
    const userAttributes = await fetchUserAttributes();
    
    return {
      success: true,
      redirectTo: "/dashboard",
      user: {
        ...currentUser,
        attributes: userAttributes
      }
    };
  } catch (error) {
    return {
      success: false,
      redirectTo: "/login"
    };
  }
}

// Registro de usuario
export async function handleSignUp(_undefined: undefined, _p0: FormData, formData: SignUpFormData): Promise<AuthResponse> {
  console.log('Amplify Config:', Amplify.getConfig());
  
  try {
    const { email, password, name, role } = formData;

    // Validaciones
    if (!email || !password || !name || !role) {
      throw new Error("Todos los campos son requeridos");
    }

    if (password.length < 8) {
      throw new Error("La contraseña debe tener al menos 8 caracteres");
    }

    const { isSignUpComplete, userId, nextStep } = await signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name,
          'custom:role': role,
        },
        autoSignIn: true,
      }
    });

    return { 
      success: true, 
      redirectTo: "/confirm-register",
      user: { userId, email }
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      success: false, 
      redirectTo: "/signup",
      error: getErrorMessage(error)
    };
  }
}

// Reenvío de código de verificación
export async function handleSendEmailVerificationCode(email: string): Promise<VerificationResponse> {
  if (!email) {
    return {
      message: "",
      errorMessage: "El correo electrónico es requerido"
    };
  }

  try {
    await resendSignUpCode({ username: email });
    
    return {
      message: "Código enviado con éxito. Por favor revisa tu correo.",
      errorMessage: ""
    };
  } catch (error) {
    console.error('Error resending code:', error);
    return {
      message: "",
      errorMessage: getErrorMessage(error)
    };
  }
}

// Confirmación de registro
export async function handleConfirmSignUp(email: string, code: string): Promise<AuthResponse> {
  if (!email || !code) {
    return {
      success: false,
      redirectTo: "/confirm-register",
      error: "El correo y el código son requeridos"
    };
  }

  try {
    const { isSignUpComplete, nextStep } = await confirmSignUp({
      username: email,
      confirmationCode: code
    });

    return { 
      success: true, 
      redirectTo: "/login"
    };
  } catch (error) {
    console.error('Confirmation error:', error);
    return { 
      success: false, 
      error: getErrorMessage(error),
      redirectTo: "/confirm-register"
    };
  }
}

// Inicio de sesión
export async function handleSignIn(email: string, password: string): Promise<AuthResponse> {
  if (!email || !password) {
    throw new Error("El correo y la contraseña son requeridos");
  }

  try {
    // Cerrar sesión existente si la hay
    try {
      await handleSignOut();
    } catch (error) {
      console.log("No había sesión activa");
    }

    const { isSignedIn, nextStep } = await signIn({
      username: email,
      password
    });

    if (isSignedIn) {
      const userAttributes = await fetchUserAttributes();
      
      return { 
        success: true, 
        redirectTo: "/dashboard",
        user: userAttributes
      };
    }

    if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
      return { 
        success: false, 
        redirectTo: "/confirm-register",
        error: "Por favor confirma tu correo electrónico"
      };
    }

    throw new Error("No se pudo iniciar sesión. Verifica tus credenciales.");
  } catch (error) {
    console.error("Error durante el inicio de sesión:", error);
    return {
      success: false,
      redirectTo: "/login",
      error: getErrorMessage(error)
    };
  }
}

// Cierre de sesión
export async function handleSignOut(): Promise<AuthResponse> {
  try {
    await signOut({ global: true });
    
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    return { 
      success: true, 
      redirectTo: "/login" 
    };
  } catch (error) {
    console.error("Error durante el cierre de sesión:", error);
    return { 
      success: false, 
      redirectTo: "/dashboard",
      error: getErrorMessage(error)
    };
  }
}

// Función auxiliar para verificar sesión en rutas protegidas
export async function requireAuth() {
  try {
    const authStatus = await checkAuthStatus();
    if (!authStatus.success) {
      redirect('/login');
    }
    return authStatus.user;
  } catch (error) {
    redirect('/login');
  }
}

export { confirmSignUp, signOut };