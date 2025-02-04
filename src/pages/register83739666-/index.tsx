import SignUpForm from "@/components/auth/signup-form";
import { RoleBasedAccess } from "@/components/RoleBasedAcces";

export default function SignUp() {
  return (
    <RoleBasedAccess allowedRoles={['Dueño']}>
      <SignUpForm />
    </RoleBasedAccess>
  );
}