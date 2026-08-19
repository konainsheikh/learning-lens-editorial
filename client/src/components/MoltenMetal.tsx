/* Learning Lenz section 05: React Bits-inspired molten-metal surface for consistent testimonial cards. */
export default function MoltenMetal({ className = "" }: { className?: string }) {
  return <span className={`molten-metal ${className}`.trim()} aria-hidden="true"><i /><i /><i /></span>;
}
