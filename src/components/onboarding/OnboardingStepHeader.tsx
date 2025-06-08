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
  const progress = Math.min(100, Math.round((step / total) * 100));
  return (
    <div className="mb-8">
      <p className="text-sm text-gray-400 mb-1">
        Step {step} of {total}
      </p>
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-gray-500">{subtitle}</p>
      <div className="mt-4 h-2 bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="bg-green-500 h-2"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
