/**
 * Google Drive API v3 helper for appDataFolder backup & restore.
 * Uses scope: https://www.googleapis.com/auth/drive.appdata
 */

export interface CloudBackupFile {
  id: string
  name: string
  createdTime: string
  size: number
}

interface GoogleTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
}

interface DriveFile {
  id: string
  name: string
  createdTime: string
  size: string
}

const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const GOOGLE_GIS_SCRIPT_ID = 'google-gis-sdk'

/**
 * Dynamically loads the Google Identity Services (GIS) client script.
 */
export function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(GOOGLE_GIS_SCRIPT_ID)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.id = GOOGLE_GIS_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = (err) => reject(err)
    document.body.appendChild(script)
  })
}

/**
 * Requests an OAuth 2.0 access token using Google Identity Services tokenClient.
 */
export async function requestGoogleAccessToken(
  clientId: string,
  onSuccess: (token: string) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    await loadGisScript()

    if (!window.google?.accounts?.oauth2) {
      onError('Google Identity Services library failed to initialize.')
      return
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_APPDATA_SCOPE,
      callback: (response: GoogleTokenResponse) => {
        if (response.error) {
          onError(response.error_description || response.error || 'Google Authorization failed')
          return
        }
        if (response.access_token) {
          onSuccess(response.access_token)
        }
      },
    })

    client.requestAccessToken()
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Failed to initialize Google login.')
  }
}

/**
 * Uploads a JSON backup payload to Google Drive appDataFolder.
 */
export async function uploadToAppDataFolder(
  accessToken: string,
  jsonContent: string,
  filename?: string
): Promise<{ id: string; name: string }> {
  const name = filename || `invoicekitz_backup_${new Date().toISOString().slice(0, 10)}.json`

  const metadata = {
    name,
    mimeType: 'application/json',
    parents: ['appDataFolder'],
  }

  const file = new Blob([jsonContent], { type: 'application/json' })
  const formData = new FormData()
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  formData.append('file', file)

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Google Drive upload failed (${response.status}): ${errText}`)
  }

  return await response.json()
}

/**
 * Lists all backups saved in Google Drive appDataFolder.
 */
export async function listAppDataBackups(accessToken: string): Promise<CloudBackupFile[]> {
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id, name, createdTime, size)',
    orderBy: 'createdTime desc',
    pageSize: '50',
  })

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Failed to list Google Drive backups (${response.status}): ${errText}`)
  }

  const data = await response.json()
  return (data.files || []).map((f: DriveFile) => ({
    id: f.id,
    name: f.name,
    createdTime: f.createdTime,
    size: parseInt(f.size || '0', 10),
  }))
}

/**
 * Downloads a backup file from Google Drive appDataFolder by file ID.
 */
export async function downloadAppDataFile(accessToken: string, fileId: string): Promise<string> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`Failed to download backup file (${response.status}): ${errText}`)
  }

  return await response.text()
}

/**
 * Deletes a backup file from Google Drive appDataFolder.
 */
export async function deleteAppDataFile(accessToken: string, fileId: string): Promise<void> {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok && response.status !== 404) {
    const errText = await response.text()
    throw new Error(`Failed to delete cloud backup file (${response.status}): ${errText}`)
  }
}

// Global declaration for Google GIS client SDK
declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
          }) => {
            requestAccessToken: () => void
          }
        }
      }
    }
  }
}
