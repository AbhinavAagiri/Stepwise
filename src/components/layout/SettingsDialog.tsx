import { useState } from 'react'
import { Monitor, Moon, Sun, Trash2 } from 'lucide-react'
import { Dialog } from '../ui/Dialog'
import { Segmented } from '../ui/Segmented'
import { Button } from '../ui/Button'
import { useAppState, type ThemeChoice } from '../../state/AppState'
import { LEARN_TOPICS } from '../../content/learn'

interface SettingsDialogProps {
  open: boolean
  onClose: () => void
}

export function SettingsDialog({ open, onClose }: SettingsDialogProps) {
  const {
    settings,
    updateSettings,
    recents,
    clearRecents,
    explored,
    quizzes,
    resetLocalData,
    reduceMotion,
  } = useAppState()
  const [confirmReset, setConfirmReset] = useState(false)
  const [cleared, setCleared] = useState(false)

  const quizCount = Object.keys(quizzes).length
  const exploredCount = explored.filter((slug) => LEARN_TOPICS.some((topic) => topic.slug === slug)).length

  const onReset = () => {
    resetLocalData()
    setConfirmReset(false)
    setCleared(true)
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        setConfirmReset(false)
        setCleared(false)
        onClose()
      }}
      title="Settings"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="settings-section">
        <p className="info-kicker">Appearance</p>
        <div className="setting-row">
          <div className="setting-copy">
            <div className="setting-name">Theme</div>
            <p className="setting-desc">Light is the default. System follows your operating system.</p>
          </div>
          <Segmented<ThemeChoice>
            label="Theme"
            value={settings.theme}
            onChange={(theme) => updateSettings({ theme })}
            options={[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Monitor },
            ]}
          />
        </div>

        <div className="setting-row">
          <div className="setting-copy">
            <div className="setting-name">Reduce motion</div>
            <p className="setting-desc">
              Minimise page, panel, and interface transitions. Algorithm stepping is never disabled.
              {reduceMotion && settings.reduceMotion ? ' Your system also prefers reduced motion.' : ''}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            className="switch"
            aria-checked={settings.reduceMotion}
            aria-label="Reduce motion"
            onClick={() => updateSettings({ reduceMotion: !settings.reduceMotion })}
          >
            <span className="switch-thumb" />
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-copy">
            <div className="setting-name">Dot grid</div>
            <p className="setting-desc">Show the drafting grid behind algorithm visualisations.</p>
          </div>
          <button
            type="button"
            role="switch"
            className="switch"
            aria-checked={settings.showGrid}
            aria-label="Show dot grid"
            onClick={() => updateSettings({ showGrid: !settings.showGrid })}
          >
            <span className="switch-thumb" />
          </button>
        </div>

        <div className="setting-row">
          <div className="setting-copy">
            <div className="setting-name">Default playback speed</div>
            <p className="setting-desc">Starting speed for every lab. You can change it during playback.</p>
          </div>
          <div className="select-wrap" style={{ width: 104 }}>
            <select
              className="select"
              aria-label="Default playback speed"
              value={settings.defaultSpeed}
              onChange={(event) => updateSettings({ defaultSpeed: Number(event.target.value) })}
            >
              {[0.5, 1, 2, 4, 8].map((speed) => (
                <option key={speed} value={speed}>
                  {speed}×
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <p className="info-kicker">Stored in this browser</p>
        <div className="storage-summary">
          <div>
            <span className="storage-number">{recents.length}</span>
            <span className="storage-label">recent topics</span>
          </div>
          <div>
            <span className="storage-number">{exploredCount}</span>
            <span className="storage-label">of {LEARN_TOPICS.length} learned</span>
          </div>
          <div>
            <span className="storage-number">{quizCount}</span>
            <span className="storage-label">quizzes saved</span>
          </div>
        </div>
        <p className="dialog-note" style={{ marginTop: 10 }}>
          Settings, recent activity, and quiz answers use <span className="mono">localStorage</span>. There is
          no account and nothing is uploaded.
        </p>
        <div className="settings-actions">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearRecents()
              setCleared(true)
            }}
            disabled={recents.length === 0}
          >
            Clear recents
          </Button>
          {!confirmReset ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmReset(true)}>
              <Trash2 aria-hidden="true" />
              Reset local data
            </Button>
          ) : (
            <div className="confirm-reset">
              <span>Remove recents, progress, and quiz results?</span>
              <Button variant="danger" size="sm" onClick={onReset} data-autofocus>
                Remove
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </div>
          )}
        </div>
        {cleared && <p className="settings-feedback">Local data updated.</p>}
      </div>
    </Dialog>
  )
}
