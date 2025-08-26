import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/contexts/PreferencesContext'
import { Separator } from '@/components/ui/separator'

interface PreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const colourOptions: Array<{ id: any; label: string; hslPreview: string }> = [
  { id: 'ruby', label: "Ruby Red", hslPreview: 'hsl(350 100% 25.5%)' },
  { id: 'indigo', label: "Indigo Blue", hslPreview: 'hsl(201 100% 9.4%)' },
  { id: 'britishGreen', label: "British Green", hslPreview: 'hsl(158 100% 7.5%)' },
  { id: 'emerald', label: "Emerald", hslPreview: 'hsl(152 76% 35%)' },
  { id: 'violet', label: "Violet", hslPreview: 'hsl(262 83% 58%)' },
  { id: 'amber', label: "Amber", hslPreview: 'hsl(38 92% 50%)' }
]

export const PreferencesDialog: React.FC<PreferencesDialogProps> = ({ open, onOpenChange }) => {
  const { theme, accent, font, setTheme, setAccent, setFont, reset } = usePreferences()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Theme */}
          <section>
            <h3 className="text-sm font-medium mb-2">Theme</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['system','light','dark'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={theme === mode ? 'default' : 'outline'}
                  onClick={() => setTheme(mode)}
                  className="w-full"
                >
                  {mode === 'system' ? 'System' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Accent colour */}
          <section>
            <h3 className="text-sm font-medium mb-2">Accent colour</h3>
            <div className="grid grid-cols-3 gap-3">
              {colourOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAccent(opt.id)}
                  className={`flex items-center gap-2 p-2 rounded-md border transition-colors ${accent === opt.id ? 'border-ring' : 'border-input hover:bg-muted/50'}`}
                >
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: opt.hslPreview }} />
                  <span className="text-sm">{opt.label}</span>
                </button>
              ))}
            </div>
          </section>

          <Separator />

          {/* Font */}
          <section>
            <h3 className="text-sm font-medium mb-2">Font</h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: 'system', label: 'System default' },
                { id: 'inter', label: 'Inter (sans-serif)' },
                { id: 'serif', label: 'Serif (Georgia)' },
                { id: 'mono', label: 'Monospace' }
              ] as const).map((f) => (
                <Button
                  key={f.id}
                  variant={font === f.id ? 'default' : 'outline'}
                  onClick={() => setFont(f.id as any)}
                  className="w-full"
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" onClick={reset}>Reset to defaults</Button>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PreferencesDialog


