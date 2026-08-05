import { Button } from './Button'
import { Svg } from '@/icons'

interface ExportActionsProps {
  saveLabel: string
  onSave: () => void
  onPreview: () => void
  onPrint: () => void
  onDownload: () => void
  onText: () => void
  onNew: () => void
  newLabel: string
}

export function ExportActions({
  saveLabel,
  onSave,
  onPreview,
  onPrint,
  onDownload,
  onText,
  onNew,
  newLabel,
}: ExportActionsProps) {
  return (
    <div className="space-y-3">
      <Button onClick={onSave} size="lg" className="w-full shadow-md">
        <Svg name="save" />
        {saveLabel}
      </Button>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Button variant="outline" onClick={onPreview} className="w-full">
          <Svg name="eye" className="w-4 h-4" />
          Preview
        </Button>
        <Button variant="outline" onClick={onPrint} className="w-full">
          <Svg name="print" className="w-4 h-4" />
          Print
        </Button>
        <Button variant="outline" onClick={onDownload} className="w-full">
          <Svg name="download" className="w-4 h-4" />
          PDF
        </Button>
        <Button variant="outline" onClick={onText} className="w-full">
          <Svg name="file" className="w-4 h-4" />
          Text
        </Button>
      </div>

      <Button variant="ghost" onClick={onNew} className="w-full">
        <Svg name="plus" className="w-4 h-4" />
        {newLabel}
      </Button>
    </div>
  )
}