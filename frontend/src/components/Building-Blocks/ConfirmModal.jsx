import { useEffect } from 'react'

export function ConfirmModal({ title, message, confirmLabel = 'Remove', onConfirm, onCancel }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onCancel()
    }}>
      <div className="modal confirmation-modal" role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
        <button type="button" className="modal-close" onClick={onCancel} aria-label="Close confirmation">X</button>
        <p className="eyebrow">Confirm action</p>
        <h2 id="confirmation-title">{title}</h2>
        <p>{message}</p>
        <div className="confirmation-actions">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="button" className="danger-button" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
