"use client";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "@/components/spinner";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-100">
        <Spinner />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-emerald-100">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }
  return (
    <div>
      <Toaster position="top-center" />
      <div>
        <div>
          <div>
            <Image
              src={user?.imageUrl}
              alt="User Avatar"
              width={100}
              height={100}
              className="rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className="mb-4">{user.primaryEmailAddress?.emailAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
