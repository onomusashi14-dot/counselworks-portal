import { useState, useCallback } from 'react';
import { filesApi, FileRecord } from '../api/files';
import { api } from '../api/client';

interface UploadState {
  progress: number;
  status: 'idle' | 'requesting' | 'uploading' | 'confirming' | 'done' | 'error';
  error: string | null;
}

export function useFileUpload(firmId: string | null) {
  const [state, setState] = useState<UploadState>({ progress: 0, status: 'idle', error: null });

  const upload = useCallback(async (
    file: File,
    entityType: 'case' | 'request' | 'message',
    entityId: string,
    documentType = 'other'
  ): Promise<FileRecord | null> => {
    if (!firmId) return null;

    setState({ progress: 0, status: 'requesting', error: null });

    try {
      // Step 1: get presigned URL
      const { fileId, uploadUrl } = await filesApi.getUploadUrl({
        firmId, entityType, entityId,
        originalName: file.name,
        mimeType:     file.type,
        sizeBytes:    file.size,
        documentType,
      });

      // Step 2: upload directly to S3
      setState(s => ({ ...s, status: 'uploading' }));
      await api.uploadToS3(uploadUrl, file, (pct) => {
        setState(s => ({ ...s, progress: pct }));
      });

      // Step 3: confirm
      setState(s => ({ ...s, status: 'confirming', progress: 100 }));
      const { file: confirmed } = await filesApi.confirm(fileId, entityType, entityId);

      setState({ progress: 100, status: 'done', error: null });
      return confirmed;
    } catch (err: any) {
      setState({ progress: 0, status: 'error', error: err.message ?? 'Upload failed.' });
      return null;
    }
  }, [firmId]);

  const reset = useCallback(() => {
    setState({ progress: 0, status: 'idle', error: null });
  }, []);

  return { ...state, upload, reset };
}

export function useFiles(firmId: string | null, entityType: string, entityId: string | null) {
  const [files, setFiles]   = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!firmId || !entityId) return;
    setLoading(true);
    filesApi.list(firmId, entityType, entityId)
      .then(({ files }) => { setFiles(files); setLoading(false); })
      .catch(() => setLoading(false));
  }, [firmId, entityType, entityId]);

  return { files, loading, refresh };
}
