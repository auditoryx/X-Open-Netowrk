'use client';

export default function OnboardingStepHeader({
  step,
  total,
  title,
  subtitle,
}: {
  step: number;
  total: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-sm text-gray-400 mb-1">
        Step {step} of {total}
      </p>
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
    </div>
  );
}
