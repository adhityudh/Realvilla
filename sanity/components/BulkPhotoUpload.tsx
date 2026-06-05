'use client'

import React, { useRef, useState } from 'react'
import { ArrayOfObjectsInputProps, useClient, useFormValue } from 'sanity'
import { set } from 'sanity'

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error'

interface GroupOption {
  _key: string
  title: string
}

export function BulkPhotoUpload(props: ArrayOfObjectsInputProps) {
  const { renderDefault, onChange, value } = props
  const client = useClient({ apiVersion: '2024-05-02' })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [status, setStatus] = useState<UploadStatus>('idle')
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [showGroupPicker, setShowGroupPicker] = useState(false)
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>('__new__')
  const [newGroupTitle, setNewGroupTitle] = useState('Photos')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // Collect existing regular-media groups for the picker
  const existingGroups: GroupOption[] = ((value as any[]) || [])
    .filter((g: any) => g._type === 'galleryGroup' && g.mediaType !== 'virtualTour' && g.title)
    .map((g: any) => ({ _key: g._key, title: g.title }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setPendingFiles(files)
    setShowGroupPicker(true)
    // Reset input so same files can be re-selected if needed
    e.target.value = ''
  }

  const handleConfirm = async () => {
    if (pendingFiles.length === 0) return
    setShowGroupPicker(false)
    setStatus('uploading')
    setProgress({ done: 0, total: pendingFiles.length })

    try {
      // Upload all files concurrently, track progress sequentially
      const uploaded: any[] = []
      for (const file of pendingFiles) {
        const asset = await client.assets.upload('image', file, {
          filename: file.name,
        })
        uploaded.push({
          _type: 'image',
          _key: Math.random().toString(36).slice(2),
          asset: { _type: 'reference', _ref: asset._id },
        })
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }))
      }

      // Build updated gallery array
      const currentGallery: any[] = Array.isArray(value) ? [...(value as any[])] : []

      if (selectedGroupKey === '__new__') {
        // Create a brand new gallery group
        const newGroup = {
          _type: 'galleryGroup',
          _key: Math.random().toString(36).slice(2),
          title: newGroupTitle || 'Photos',
          mediaType: 'regular',
          items: uploaded,
        }
        onChange(set([...currentGallery, newGroup]))
      } else {
        // Append to existing group
        const updatedGallery = currentGallery.map((group: any) => {
          if (group._key !== selectedGroupKey) return group
          return {
            ...group,
            items: [...(group.items || []), ...uploaded],
          }
        })
        onChange(set(updatedGallery))
      }

      setStatus('done')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      console.error('Bulk upload failed:', err)
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    } finally {
      setPendingFiles([])
    }
  }

  const handleCancel = () => {
    setShowGroupPicker(false)
    setPendingFiles([])
  }

  return (
    <div>
      {/* ── Bulk Upload Button ── */}
      <div style={styles.toolbar}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === 'uploading'}
          style={status === 'uploading' ? { ...styles.btn, ...styles.btnDisabled } : styles.btn}
        >
          {status === 'uploading' ? (
            <>
              <span style={styles.spinner} />
              Uploading {progress.done}/{progress.total}…
            </>
          ) : (
            <>
              <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Bulk Add Photos
            </>
          )}
        </button>

        {status === 'done' && (
          <span style={styles.successBadge}>✓ Photos added successfully</span>
        )}
        {status === 'error' && (
          <span style={styles.errorBadge}>⚠ Upload failed. Please try again.</span>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* ── Group Picker Modal ── */}
      {showGroupPicker && (
        <div style={styles.backdrop}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              Add {pendingFiles.length} photo{pendingFiles.length !== 1 ? 's' : ''} to…
            </h3>

            <div style={styles.optionGroup}>
              {/* New group option */}
              <label style={styles.optionRow}>
                <input
                  type="radio"
                  name="groupTarget"
                  value="__new__"
                  checked={selectedGroupKey === '__new__'}
                  onChange={() => setSelectedGroupKey('__new__')}
                  style={styles.radio}
                />
                <span>Create new group</span>
              </label>
              {selectedGroupKey === '__new__' && (
                <input
                  type="text"
                  value={newGroupTitle}
                  onChange={(e) => setNewGroupTitle(e.target.value)}
                  placeholder="Group title (e.g. Photos)"
                  style={styles.textInput}
                />
              )}

              {/* Existing groups */}
              {existingGroups.map((g) => (
                <label key={g._key} style={styles.optionRow}>
                  <input
                    type="radio"
                    name="groupTarget"
                    value={g._key}
                    checked={selectedGroupKey === g._key}
                    onChange={() => setSelectedGroupKey(g._key)}
                    style={styles.radio}
                  />
                  <span>{g.title}</span>
                </label>
              ))}
            </div>

            <div style={styles.modalActions}>
              <button type="button" onClick={handleCancel} style={styles.cancelBtn}>
                Cancel
              </button>
              <button type="button" onClick={handleConfirm} style={styles.confirmBtn}>
                Upload {pendingFiles.length} photo{pendingFiles.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Default Gallery Array Input ── */}
      {renderDefault(props)}
    </div>
  )
}

// ── Inline styles (no external CSS dependency) ──────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.9rem',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#fff',
    background: '#2563EB',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  btnDisabled: {
    background: '#6B7280',
    cursor: 'not-allowed',
  },
  icon: {
    width: '1rem',
    height: '1rem',
    flexShrink: 0,
  },
  spinner: {
    display: 'inline-block',
    width: '0.9rem',
    height: '0.9rem',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  successBadge: {
    fontSize: '0.78rem',
    color: '#16A34A',
    fontWeight: 500,
  },
  errorBadge: {
    fontSize: '0.78rem',
    color: '#DC2626',
    fontWeight: 500,
  },
  // Modal
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    background: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    minWidth: '320px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  modalTitle: {
    margin: '0 0 1rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#111',
  },
  optionGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    color: '#374151',
  },
  radio: {
    cursor: 'pointer',
  },
  textInput: {
    marginLeft: '1.5rem',
    padding: '0.35rem 0.6rem',
    fontSize: '0.82rem',
    border: '1px solid #D1D5DB',
    borderRadius: '4px',
    outline: 'none',
    width: 'calc(100% - 1.5rem)',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
  },
  cancelBtn: {
    padding: '0.45rem 0.9rem',
    fontSize: '0.82rem',
    fontWeight: 500,
    color: '#374151',
    background: '#F3F4F6',
    border: '1px solid #E5E7EB',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  confirmBtn: {
    padding: '0.45rem 1rem',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#fff',
    background: '#2563EB',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
}
