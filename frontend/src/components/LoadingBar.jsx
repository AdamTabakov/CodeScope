// Thin, static progress bar shown at the very top while the app boots.
export default function LoadingBar({ active }) {
  if (!active) return null

  return <div className="loading-bar" role="status" aria-label="Loading" aria-live="polite" />
}