import { ONBOARDING_STEPS, OnboardingStep } from "@/hooks/useOnboarding";

const STEP_LABELS: Record<OnboardingStep, string> = {
  sport: "Sport",
  event: "Event",
  profile: "Profile",
  equipment: "Equipment",
  baseline: "Baseline",
  goal: "Goal",
  review: "Review",
};

export default function OnboardingProgress({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="mb-10">
      <div className="flex justify-between text-xs text-slate-400 mb-2">
        {ONBOARDING_STEPS.map((step, index) => (
          <span key={step} className={index <= stepIndex ? "text-cyan-400" : ""}>
            {STEP_LABELS[step]}
          </span>
        ))}
      </div>
      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-cyan-500 transition-all"
          style={{ width: `${((stepIndex + 1) / ONBOARDING_STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
