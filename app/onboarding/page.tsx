"use client";

import { useOnboarding } from "@/hooks/useOnboarding";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import SportStep from "@/components/onboarding/SportStep";
import EventStep from "@/components/onboarding/EventStep";
import ProfileStep from "@/components/onboarding/ProfileStep";
import GoalStep from "@/components/onboarding/GoalStep";
import ReviewStep from "@/components/onboarding/ReviewStep";
import ErrorState from "@/components/ErrorState";

export default function OnboardingPage() {
  const {
    initializing,
    initError,
    retryInit,
    step,
    stepIndex,
    data,
    updateData,
    goNext,
    goBack,
    submit,
    submitting,
    submitError,
    submitSuccess,
  } = useOnboarding();

  if (initError) {
    return <ErrorState message={`Couldn't load your account: ${initError}`} onRetry={retryInit} />;
  }

  if (initializing) {
    return <div className="flex items-center justify-center py-24 text-slate-400">Loading...</div>;
  }

  return (
    <div>
      <p className="text-cyan-400 tracking-[0.3em] text-sm mb-6">SUB-60 PERFORMANCE LAB — SETUP</p>
      <OnboardingProgress stepIndex={stepIndex} />

      {step === "sport" && <SportStep data={data} updateData={updateData} onNext={goNext} />}
      {step === "event" && <EventStep data={data} updateData={updateData} onNext={goNext} onBack={goBack} />}
      {step === "profile" && <ProfileStep data={data} updateData={updateData} onNext={goNext} onBack={goBack} />}
      {step === "goal" && <GoalStep data={data} updateData={updateData} onNext={goNext} onBack={goBack} />}
      {step === "review" && (
        <ReviewStep
          data={data}
          onBack={goBack}
          onSubmit={submit}
          submitting={submitting}
          submitError={submitError}
          submitSuccess={submitSuccess}
        />
      )}
    </div>
  );
}
