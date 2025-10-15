"use client";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "@/components/spinner";
import Image from "next/image";
import { Toaster } from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { availablePlans } from "@/lib/plan";
import { useState } from "react";
import toast from "react-hot-toast/headless";
import { useRouter } from "next/navigation";
import Stripe from "stripe";
type ChangePlanResponse = {
  subscriptions: Stripe.Subscription;
};
export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const router = useRouter();
  const queryClient = useQueryClient();

  const unSubscribe = useMutation<any, Error, void>({
    mutationFn: async () => {
      const response = await fetch("/api/profile/unSubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "failed to Unsubacribe");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.push("/subscribe");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const handleCancelSubscribe = () => {
    if (
      confirm(
        "Are you sure you want to unsubscribe? You will lose access to premium features."
      )
    ) {
      unSubscribe.mutate();
    }
  };

  //change Plan type part
  const changePlanMutation = useMutation<ChangePlanResponse, Error, string>({
    mutationFn: async (newPlan: string) => {
      const response = await fetch("/api/profile/change-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPlan }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to change subscription plan."
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      router.push("/subscribe");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleConfirmChangePlan = () => {
    changePlanMutation.mutate(selectedPlan);
    setSelectedPlan("");
  };

  const handleChangePlan = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedPlan = e.target.value;
    setSelectedPlan(newSelectedPlan);
  };

  //fetch subscribing from current users part
  const {
    data: subscription,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/profile/subscription-status");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch Subscription");
      }
      const data = response.json();
      return data;
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const currentPlan = availablePlans.find(
    (plan) => plan.interval == subscription?.subscription.subscriptionTier
  );

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
    <div className="min-h-screen flex items-center justify-center bg-emerald-100 p-4">
      <Toaster position="top-center" />
      <div className="w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* User General Information */}
          <div className="w-full md:w-1/3 p-6 bg-emerald-500 text-white flex flex-col items-center">
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
          <div className="w-full md:w-2/3 p-6 bg-gray-50">
            <h2 className="text-2xl font-bold mb-6 text-emerald-700">
              Subscription Details
            </h2>
            {isLoading ? (
              <div>
                <Spinner />
              </div>
            ) : isError ? (
              <p className="text-red-500">{error?.message}</p>
            ) : subscription ? (
              <div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-emerald-600">
                    Current Plan
                  </h3>
                  {currentPlan ? (
                    <>
                      <p>
                        <strong>Plan:</strong> {currentPlan.name}
                      </p>
                      <p>
                        <strong>Amount:</strong> ${currentPlan.amount}{" "}
                        {currentPlan.currency}
                      </p>
                      <p>
                        <strong>Status:</strong>{" "}
                        {subscription.subscription.subscription_active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </p>
                    </>
                  ) : (
                    <p className="text-red-500">Current plan not found.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-red-500">Current plan not found.</p>
            )}
          </div>
          <div className="bg-white shadow-md rounded-lg p-4 border border-emerald-200">
            <h3 className="text-xl font-semibold mb-2 text-emerald-600">
              Change Subscription Plan
            </h3>
            <select
              onChange={(e) => handleChangePlan(e)}
              disabled={changePlanMutation.isPending}
              name="selectPlan"
              defaultValue={currentPlan?.interval}
              className="w-full px-3 py-2 border border-emerald-300 rounded-md
               text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="" disabled>
                Select a new paln
              </option>
              {availablePlans.map((plan, key) => (
                <option key={key}>
                  {plan.name} - {plan.amount} / {plan.interval}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                handleConfirmChangePlan();
              }}
              className="mt-3 p-2 bg-emerald-500 rounded-lg text-white"
            >
              Save Change
            </button>
            {changePlanMutation.isPending && (
              <div className="flex items-center mt-2">
                <Spinner />
                <span className="ml-2">Updating Plan...</span>
              </div>
            )}
            <div className="bg-white shadow-md rounded-lg p-4 border border-emerald-200 mt-4">
              <h3 className="text-xl font-semibold mb-2 text-emerald-600">
                Unsubscribe
              </h3>
              <button
                onClick={() => handleCancelSubscribe()}
                className={`w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors`}
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
