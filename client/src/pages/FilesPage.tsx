import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileGallery } from '@/components/FileGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const { toast } = useToast();
  
  const handleFileUploaded = () => {
    // Switch to gallery tab after upload
    setActiveTab('gallery');
    
    // Force refresh the gallery
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">File Storage</h1>
          <p className="text-muted-foreground">
            Securely upload, store, and manage your files
          </p>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="gallery">My Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-6">
            <FileUpload 
              onFileUploaded={data => {
                // Show success toast with more details
                toast({
                  title: 'File uploaded successfully',
                  description: `File saved to ${data.isPublic ? 'public' : 'private'} storage`,
                });
                
                // Switch to gallery and refresh
                handleFileUploaded();
              }}
              title="Upload New File"
              description="Upload files to secure storage. Files can be private or public."
            />
          </TabsContent>
          
          <TabsContent value="gallery" className="pt-6">
            <FileGallery 
              key={refreshKey}
              title="Your Files"
              description="View and manage all your uploaded files"
              onFileSelected={fileInfo => {
                toast({
                  title: 'File selected',
                  description: `Selected file: ${fileInfo.name}`,
                });
              }}
              onFileDeleted={() => {
                // Force refresh the gallery
                setRefreshKey(prev => prev + 1);
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}