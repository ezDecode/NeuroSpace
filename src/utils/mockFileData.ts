// Mock file data for testing FileSelector when backend is not available

export interface FileData {
  id: string;
  file_name: string;
  file_size: number;
  status: 'pending' | 'processing' | 'processed' | 'error';
  created_at: string;
  file_type?: string;
  file_key?: string;
}

export const mockFiles: FileData[] = [
  {
    id: '1',
    file_name: 'Research Paper - AI Ethics.pdf',
    file_size: 2048000, // 2MB
    status: 'processed',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    file_type: 'application/pdf',
    file_key: 'uploads/user1/ai-ethics.pdf'
  },
  {
    id: '2',
    file_name: 'Meeting Notes.docx',
    file_size: 512000, // 512KB
    status: 'processed',
    created_at: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    file_key: 'uploads/user1/meeting-notes.docx'
  },
  {
    id: '3',
    file_name: 'Project Proposal.txt',
    file_size: 128000, // 128KB
    status: 'processing',
    created_at: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
    file_type: 'text/plain',
    file_key: 'uploads/user1/project-proposal.txt'
  },
  {
    id: '4',
    file_name: 'User Manual.md',
    file_size: 256000, // 256KB
    status: 'processed',
    created_at: new Date(Date.now() - 10800000).toISOString(), // 3 hours ago
    file_type: 'text/markdown',
    file_key: 'uploads/user1/user-manual.md'
  },
  {
    id: '5',
    file_name: 'Failed Upload.pdf',
    file_size: 0,
    status: 'error',
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    file_type: 'application/pdf',
    file_key: 'uploads/user1/failed-upload.pdf'
  },
  {
    id: '6',
    file_name: 'Large Dataset.csv',
    file_size: 10485760, // 10MB
    status: 'processed',
    created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    file_type: 'text/csv',
    file_key: 'uploads/user1/large-dataset.csv'
  },
  {
    id: '7',
    file_name: 'Technical Specs.doc',
    file_size: 768000, // 768KB
    status: 'pending',
    created_at: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    file_type: 'application/msword',
    file_key: 'uploads/user1/technical-specs.doc'
  },
  {
    id: '8',
    file_name: 'Financial Report Q4.pdf',
    file_size: 3145728, // 3MB
    status: 'processed',
    created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    file_type: 'application/pdf',
    file_key: 'uploads/user1/financial-report-q4.pdf'
  },
  {
    id: '9',
    file_name: 'Code Review Notes.txt',
    file_size: 64000, // 64KB
    status: 'processed',
    created_at: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    file_type: 'text/plain',
    file_key: 'uploads/user1/code-review-notes.txt'
  },
  {
    id: '10',
    file_name: 'Architecture Diagram.png',
    file_size: 1024000, // 1MB
    status: 'processed',
    created_at: new Date().toISOString(), // Now
    file_type: 'image/png',
    file_key: 'uploads/user1/architecture-diagram.png'
  }
];

export const createMockFileFetcher = (delay: number = 500) => {
  return async (url: string) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate different responses based on URL
    if (url.includes('/api/files')) {
      return {
        files: mockFiles,
        success: true
      };
    }
    
    throw new Error('Unknown endpoint');
  };
};