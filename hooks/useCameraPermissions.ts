import { useState, useEffect } from 'react';
import { useCameraPermissions as useExpoCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export interface CameraPermissionsState {
  cameraGranted: boolean;
  mediaGranted: boolean;
  allGranted: boolean;
  isLoading: boolean;
  requestPermissions: () => Promise<void>;
}

export function useCameraPermissions(): CameraPermissionsState {
  const [cameraPermission, requestCameraPermission] = useExpoCameraPermissions();
  const [mediaStatus, requestMediaPermission] = MediaLibrary.usePermissions();
  const [isLoading, setIsLoading] = useState(false);

  const cameraGranted = cameraPermission?.granted ?? false;
  const mediaGranted = mediaStatus?.granted ?? false;

  const requestPermissions = async () => {
    setIsLoading(true);
    try {
      await Promise.all([requestCameraPermission(), requestMediaPermission()]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    cameraGranted,
    mediaGranted,
    allGranted: cameraGranted && mediaGranted,
    isLoading,
    requestPermissions,
  };
}
