"use client";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
type ApiResponse = {
  message: string;
  error?: string;
};

export default function CreateProfile() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { mutate, isPending } = useMutation<ApiResponse, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      return data as ApiResponse;
    },
    onSuccess: () => {
      router.push("/subscribe");
    },
    onError: (error: Error) => {
      console.log("Error creating profile:", error);
    },
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending) {
      mutate();
    }
  }, [isLoaded, isSignedIn]);
  return <div className="py-16">Processing sign in....</div>;
}
