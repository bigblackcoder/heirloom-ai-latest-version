import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  FileIcon, 
  ImageIcon, 
  FileTextIcon, 
  Trash2, 
  Eye, 
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type FileInfo = {
  name: string;
  type?: string;
  size?: number;
  lastModified?: Date;
};

type FileGalleryProps = {
  onFileSelected?: (fileInfo: FileInfo) => void;
  onFileDeleted?: (fileInfo: FileInfo) => void;
  title?: string;
  description?: string;
};

export function FileGallery({
  onFileSelected,
  onFileDeleted,
  title = 'Files Gallery',
  description = 'View and manage your uploaded files'
}: FileGalleryProps) {
  const [privateFiles, setPrivateFiles] = useState<FileInfo[]>([]);
  const [publicFiles, setPublicFiles] = useState<FileInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>('private');
  const [fileToDelete, setFileToDelete] = useState<FileInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  const loadFiles = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/files');
      
      if (!response.ok) {
        throw new Error('Failed to load files');
      }
      
      const data = await response.json();
      
      // Transform file names to FileInfo objects
      const privateFileList: FileInfo[] = data.private.map((name: string) => ({
        name,
        type: getFileType(name),
      }));
      
      const publicFileList: FileInfo[] = data.public.map((name: string) => ({
        name,
        type: getFileType(name),
      }));
      
      setPrivateFiles(privateFileList);
      setPublicFiles(publicFileList);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load files');
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load files',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteFile = async (file: FileInfo) => {
    if (!file.name) return;
    
    setIsDeleting(true);
    
    try {
      const isPublic = selectedTab === 'public';
      const response = await fetch(`/api/files/${encodeURIComponent(file.name)}?public=${isPublic}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete file');
      }
      
      // Update file list
      if (isPublic) {
        setPublicFiles(publicFiles.filter(f => f.name !== file.name));
      } else {
        setPrivateFiles(privateFiles.filter(f => f.name !== file.name));
      }
      
      toast({
        title: 'File deleted',
        description: `${file.name} has been deleted`,
      });
      
      if (onFileDeleted) {
        onFileDeleted(file);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete file',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };
  
  const viewFile = (file: FileInfo) => {
    const isPublic = selectedTab === 'public';
    const fileUrl = `/api/files/${encodeURIComponent(file.name)}?public=${isPublic}`;
    
    // For images and PDFs, open in a new tab
    if (isImageFile(file.name) || isPdfFile(file.name)) {
      window.open(fileUrl, '_blank');
    } else {
      // For other files, trigger download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    if (onFileSelected) {
      onFileSelected(file);
    }
  };
  
  const downloadFile = (file: FileInfo) => {
    const isPublic = selectedTab === 'public';
    const fileUrl = `/api/files/${encodeURIComponent(file.name)}?public=${isPublic}`;
    
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getShareableLink = (file: FileInfo) => {
    if (selectedTab !== 'public') return null;
    
    // For public files only, generate a shareable link
    const fileUrl = `/api/files/${encodeURIComponent(file.name)}?public=true`;
    return window.location.origin + fileUrl;
  };
  
  const getFileType = (fileName: string): string => {
    if (isImageFile(fileName)) return 'image';
    if (isPdfFile(fileName)) return 'pdf';
    if (isTextFile(fileName)) return 'text';
    return 'file';
  };
  
  const isImageFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '');
  };
  
  const isPdfFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext === 'pdf';
  };
  
  const isTextFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['txt', 'md', 'json', 'csv', 'html', 'css', 'js', 'ts'].includes(ext || '');
  };
  
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'pdf':
        return <FileIcon className="h-5 w-5" />;
      case 'text':
        return <FileTextIcon className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };
  
  // Load files on component mount and tab change
  useEffect(() => {
    loadFiles();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          defaultValue="private" 
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="private">Private Files</TabsTrigger>
            <TabsTrigger value="public">Public Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="private">
            {renderFileTable(privateFiles, 'private')}
          </TabsContent>
          
          <TabsContent value="public">
            {renderFileTable(publicFiles, 'public')}
          </TabsContent>
        </Tabs>
        
        {error && (
          <div className="mt-4 p-4 border border-destructive rounded-md text-destructive text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={loadFiles}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardContent>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the file {fileToDelete?.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fileToDelete && deleteFile(fileToDelete)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
  
  function renderFileTable(files: FileInfo[], fileType: 'private' | 'public') {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    if (files.length === 0) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          No {fileType} files found. Upload some files to see them here.
        </div>
      );
    }
    
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.name}>
                <TableCell className="font-medium flex items-center">
                  {getFileIcon(file.type || 'file')}
                  <span className="ml-2 truncate max-w-[200px]">{file.name}</span>
                </TableCell>
                <TableCell>{file.type || 'Unknown'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewFile(file)}
                      title="View file"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    {fileType === 'public' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const link = getShareableLink(file);
                          if (link) {
                            navigator.clipboard.writeText(link);
                            toast({
                              title: 'Link copied',
                              description: 'Shareable link copied to clipboard',
                            });
                          }
                        }}
                        title="Copy shareable link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFileToDelete(file)}
                      className="text-destructive hover:text-destructive"
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}