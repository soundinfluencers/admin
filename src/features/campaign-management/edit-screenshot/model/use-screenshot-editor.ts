import { useState } from "react";
import { useUploadImageMutation } from "@/entities/file";

interface UseScreenshotEditor {
  value: string;
}

export const useScreenshotEditor = ({
  value,
}: UseScreenshotEditor) => {
  const [screenshotUrl, setScreenshotUrl] = useState(value);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { mutate, isPending } = useUploadImageMutation();
  
  const uploadFile = (file: File) => {
    if (isPending) return;
    
    if (!file.type.startsWith("image/")) {
      setSelectedFile(null);
      setError("Please choose an image");
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    mutate(file, {
      onSuccess: (response) => {
        const url = 
          typeof response.data === "string"
            ? response.data.trim()
            : "";
        
        if (!url) {
          setError("The server did not return an image URL. Please try again.");
          return;
        }
        
        setScreenshotUrl(url);
        setSelectedFile(null);
        setError(null);
      },
      onError: () => {
        setError("Upload failed. Please try again.");
      },
    });
  };
  
  const retryUpload = () => {
    if (!selectedFile || isPending) return;
    
    uploadFile(selectedFile);
  };
  
  const removeScreenshot = () => {
    if (isPending) return;
    
    setScreenshotUrl("");
    setSelectedFile(null);
    setError(null);
  };
  
  const isRemoved = value !== "" && screenshotUrl === "";
  
  const canApply = 
    !isPending &&
    error === null &&
    screenshotUrl !== value;
  
  const canRetry = 
    !isPending &&
    error !== null &&
    selectedFile !== null;
  
  return {
    screenshotUrl,
    fileName: selectedFile?.name ?? "",
    error,
    isUploading: isPending,
    isRemoved,
    canApply,
    canRetry,
    uploadFile,
    retryUpload,
    removeScreenshot,
  }
}
