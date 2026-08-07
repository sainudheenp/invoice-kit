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
  layout?: 'stack' | 'bar'
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
  layout = 'stack',
}: ExportActionsProps) {
  if (layout === 'bar') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onSave} size="md" className="shadow-md">
          <Svg name="save" />
          {saveLabel}
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="md" onClick={onPreview}>
            <Svg name="eye" className="w-4 h-4" />
            Preview
          </Button>
          <Button variant="outline" size="md" onClick={onPrint}>
            <Svg name="print" className="w-4 h-4" />
            Print
          </Button>
          <Button variant="outline" size="md" onClick={onDownload}>
            <Svg name="download" className="w-4 h-4" />
            PDF
          </Button>
          <Button variant="outline" size="md" onClick={onText}>
            <Svg name="file" className="w-4 h-4" />
            Text
          </Button>
        </div>
        <Button variant="ghost" size="md" onClick={onNew} className="ml-auto">
          <Svg name="plus" className="w-4 h-4" />
          {newLabel}
        </Button>
      </div>
    )
  }

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