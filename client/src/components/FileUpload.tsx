import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';

type FileUploadProps = {
  onFileUploaded?: (fileData: any) => void;
  allowedTypes?: string[];
  maxSizeMB?: number;
  title?: string;
  description?: string;
}

export function FileUpload({
  onFileUploaded,
  allowedTypes = ['image/*', 'application/pdf'],
  maxSizeMB = 10,
  title = 'Upload File',
  description = 'Upload a file to the secure storage system'
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isPublic, setIsPublic] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    // Reset states
    setUploadSuccess(false);
    setUploadError(null);
    setUploadProgress(0);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxSizeBytes) {
      setUploadError(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
      setFile(null);
      return;
    }
    
    // Check file type if allowedTypes is provided
    if (allowedTypes.length > 0) {
      const fileType = selectedFile.type;
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          // Handle wildcard types like 'image/*'
          const typePrefix = type.substring(0, type.length - 2);
          return fileType.startsWith(typePrefix);
        }
        return type === fileType;
      });
      
      if (!isAllowed) {
        setUploadError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        setFile(null);
        return;
      }
    }
    
    setFile(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('public', isPublic.toString());
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 5;
          return next < 90 ? next : prev;
        });
      }, 100);
      
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      
      setUploadProgress(100);
      setUploadSuccess(true);
      
      toast({
        title: 'File uploaded successfully',
        description: `File "${file.name}" has been uploaded`,
        variant: 'default',
      });
      
      if (onFileUploaded) {
        onFileUploaded(data);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
      
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            accept={allowedTypes.join(',')}
          />
          {uploadError && (
            <div className="flex items-center text-destructive text-sm mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {uploadError}
            </div>
          )}
          {file && !uploadError && (
            <div className="flex items-center text-muted-foreground text-sm mt-1">
              <File className="h-4 w-4 mr-1" />
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="public"
            checked={isPublic}
            onCheckedChange={setIsPublic}
            disabled={isUploading}
          />
          <Label htmlFor="public">Make file publicly accessible</Label>
        </div>
        
        {(isUploading || uploadSuccess) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            
            {uploadSuccess && (
              <div className="flex items-center text-primary text-sm mt-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                Upload completed successfully
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleUpload} 
          disabled={!file || isUploading || !!uploadError}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}