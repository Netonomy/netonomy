import { File, FileSpreadsheet, FolderIcon, ImageIcon, VideoIcon } from 'lucide-react'

export default function FileIcon({ type }: { type: string }) {
  const style =
    'min-h-[38px] min-w-[38px] md:min-h-[48px] md:min-w-[48px] rounded-lg flex items-center justify-center'
  switch (type) {
    case 'application/pdf':
      return (
        <div className={`${style} bg-red-600`}>
          <div className="text-lg font-semibold text-white">pdf</div>
        </div>
      )
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return (
        <div className={`${style} bg-green-600`}>
          <FileSpreadsheet className="text-white" />
        </div>
      )
    case 'video/quicktime':
    case 'video/mp4':
    case 'application/x-mpegURL':
    case 'video/x-flv':
    case 'video/MP2T':
    case 'video/x-msvideo':
    case 'video/x-ms-wmv':
      return (
        <div className={`${style} bg-purple-600`}>
          <VideoIcon className="text-white" />
        </div>
      )
    case 'image/jpeg':
    case 'image/png':
    case 'image/gif':
    case 'image/webp':
    case 'image/svg+xml':
    case 'image/bmp':
    case 'image/tiff':
    case 'image/x-icon':
      return (
        <div className={`${style} bg-blue-600`}>
          <ImageIcon className="text-white" />
        </div>
      )
    case 'folder':
      return (
        <div className={`${style} bg-blue-600`}>
          <FolderIcon className="text-white" />
        </div>
      )
    default:
      return (
        <div className={`${style} bg-blue-600`}>
          <File className="text-white" />
        </div>
      )
  }
}
