import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container py-10 flex justify-center">
      <SignUp signInUrl="/sign-in" />
    </div>
  );
}
