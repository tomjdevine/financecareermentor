import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="container py-10 flex justify-center">
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
}
