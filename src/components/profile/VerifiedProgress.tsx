export function VerifiedProgress({ points, verificationStatus, proTier }: { points?: number; verificationStatus?: string; proTier?: string }) {
  if (proTier === 'verified') return null

  const progress = Math.min(points || 0, 500)

  return (
    <p className="text-sm text-gray-400" title="XP progress toward Verified tier">
      {progress}/{500} XP {verificationStatus === 'verified' ? '(awaiting promotion)' : ''}
    </p>
  )
}
