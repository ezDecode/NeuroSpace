'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Add as AddIcon, 
  UploadFile as UploadFileIcon, 
  Description as DescriptionIcon, 
  PictureAsPdf as PictureAsPdfIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Link as LinkIcon,
  Folder as FolderIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { 
  IconButton, 
  Tooltip, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Menu,
  MenuItem,
  Typography,
  Chip
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import useSWR from 'swr';

interface SourcesPanelProps {
  selectedSources: string[];
  onSourceSelect: (sources: string[]) => void;
}

interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
  created_at: string;
  file_type?: string;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return <PictureAsPdfIcon className="text-red-500" />;
    case 'doc':
    case 'docx':
      return <DescriptionIcon className="text-blue-500" />;
    case 'txt':
    case 'md':
      return <InsertDriveFileIcon className="text-gray-500" />;
    default:
      return <InsertDriveFileIcon className="text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'processed':
      return 'success';
    case 'processing':
      return 'warning';
    case 'error':
      return 'error';
    default:
      return 'default';
  }
};

export default function SourcesPanel({ selectedSources, onSourceSelect }: SourcesPanelProps) {
  const [uploadDialog, setUploadDialog] = useState(false);
  const [linkDialog, setLinkDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);

  const { data: filesData, mutate } = useSWR<{files: FileData[]}>('/api/files', fetcher);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload-direct', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          mutate(); // Refresh the files list
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
    setUploadDialog(false);
  }, [mutate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    multiple: true
  });

  const filteredFiles = filesData?.files?.filter(file =>
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleSourceToggle = (fileId: string) => {
    const newSelected = selectedSources.includes(fileId)
      ? selectedSources.filter(id => id !== fileId)
      : [...selectedSources, fileId];
    onSourceSelect(newSelected);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, file: FileData) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFile(null);
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        mutate(); // Refresh the files list
        onSourceSelect(selectedSources.filter(id => id !== fileId));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
    handleMenuClose();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Sources</h2>
          <Tooltip title="Discover sources">
            <IconButton size="small" className="text-gray-600">
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Sources let NeuroSpace base its responses on the information that matters most to you.
        </p>

        {/* Add Button */}
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => setUploadDialog(true)}
          className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
          size="small"
        >
          Add
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <TextField
          fullWidth
          size="small"
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon className="text-gray-400 mr-2" fontSize="small" />,
          }}
          className="bg-white"
        />
      </div>

      {/* Sources List */}
      <div className="flex-1 overflow-y-auto">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <FolderIcon className="text-gray-300 mb-4" style={{ fontSize: 48 }} />
            <Typography variant="body2" color="textSecondary">
              Saved sources will appear here
            </Typography>
            <Typography variant="caption" color="textSecondary" className="block mt-2">
              Click Add above to add PDFs, websites, text, videos, or audio files. Or import a file directly from Google Drive.
            </Typography>
          </div>
        ) : (
          <List dense>
            {filteredFiles.map((file) => (
              <ListItem
                key={file.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleSourceToggle(file.id)}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedSources.includes(file.id)}
                    size="small"
                  />
                </ListItemIcon>
                
                <ListItemIcon>
                  {getFileIcon(file.file_name)}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {file.file_name}
                      </span>
                      <Chip
                        label={file.status}
                        size="small"
                        color={getStatusColor(file.status) as any}
                        variant="outlined"
                      />
                    </div>
                  }
                  secondary={
                    <span className="text-xs text-gray-500">
                      {(file.file_size / (1024 * 1024)).toFixed(1)} MB • {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton 
                    size="small" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, file);
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </div>

      {/* Source Count */}
      {selectedSources.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <Typography variant="caption" color="primary">
            {selectedSources.length} source{selectedSources.length !== 1 ? 's' : ''} selected
          </Typography>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add sources</DialogTitle>
        <DialogContent>
          <div className="space-y-4 pt-2">
            {/* Upload Section */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <UploadFileIcon className="text-gray-400 mb-4" style={{ fontSize: 48 }} />
              <Typography variant="h6" className="mb-2">
                Upload sources
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Drag & drop or choose file to upload
              </Typography>
              <Typography variant="caption" color="textSecondary" className="block mt-2">
                Supported file types: PDF, txt, Markdown, Audio (e.g. mp3)
              </Typography>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outlined"
                startIcon={<LinkIcon />}
                onClick={() => setLinkDialog(true)}
                className="justify-start"
              >
                Link
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderIcon />}
                className="justify-start"
                disabled
              >
                Google Drive
              </Button>
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <EditIcon className="mr-2" fontSize="small" />
          Rename
        </MenuItem>
        <MenuItem 
          onClick={() => selectedFile && handleDeleteFile(selectedFile.id)}
          className="text-red-600"
        >
          <DeleteIcon className="mr-2" fontSize="small" />
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
}
