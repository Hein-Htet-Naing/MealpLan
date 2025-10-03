import { SignUp } from "@clerk/nextjs";

const page = () => {
  return (
    <div className="px-4 py-8 sm:py-12 lg:py-16 flex justify-center items-center max-w-7xl mx-auto">
      <SignUp signInFallbackRedirectUrl="/create-profile" />
    </div>
  );
};

export default page;
