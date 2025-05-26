const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Mock user data
const users = [
  {
    id: '1',
    email: 'test@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Test User'
  }
];

// Mock data storage
const documents = [];
const folders = [];
const tags = [];

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:6969',
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Auth middleware
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid token',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by ID
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Please log in again',
    });
  }
};

// Auth routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required',
      });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login',
    });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Email, password, and name are required',
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User exists',
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password: hashedPassword,
      name,
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during registration',
    });
  }
});

app.get('/auth/me', requireAuth, (req, res) => {
  res.json(req.user);
});

app.post('/auth/logout', requireAuth, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

app.get('/auth/check', (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user || null,
  });
});

// Document routes
app.get('/documents', requireAuth, (req, res) => {
  const userDocuments = documents.filter(doc => doc.userId === req.user.id);
  res.json({
    success: true,
    documents: userDocuments,
    pagination: {
      page: 1,
      limit: 20,
      total: userDocuments.length,
      totalPages: Math.ceil(userDocuments.length / 20),
    },
  });
});

app.post('/documents', requireAuth, (req, res) => {
  const { title, folderId } = req.body;
  
  if (!title) {
    return res.status(400).json({
      error: 'Title required',
      message: 'Please provide a title for the document',
    });
  }

  const document = {
    id: (documents.length + 1).toString(),
    title,
    fileName: 'sample.pdf',
    fileSize: 1024,
    userId: req.user.id,
    folderId: folderId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  documents.push(document);

  res.status(201).json({
    success: true,
    message: 'Document uploaded successfully',
    document,
  });
});

app.get('/documents/:id', requireAuth, (req, res) => {
  const document = documents.find(doc => doc.id === req.params.id && doc.userId === req.user.id);
  
  if (!document) {
    return res.status(404).json({
      error: 'Document not found',
      message: 'Document not found',
    });
  }

  res.json({
    success: true,
    document,
  });
});

app.patch('/documents/:id', requireAuth, (req, res) => {
  const documentIndex = documents.findIndex(doc => doc.id === req.params.id && doc.userId === req.user.id);
  
  if (documentIndex === -1) {
    return res.status(404).json({
      error: 'Document not found',
      message: 'Document not found',
    });
  }

  const { title, folderId } = req.body;
  
  if (title) documents[documentIndex].title = title;
  if (folderId !== undefined) documents[documentIndex].folderId = folderId;
  documents[documentIndex].updatedAt = new Date();

  res.json({
    success: true,
    message: 'Document updated successfully',
    document: documents[documentIndex],
  });
});

app.delete('/documents/:id', requireAuth, (req, res) => {
  const documentIndex = documents.findIndex(doc => doc.id === req.params.id && doc.userId === req.user.id);
  
  if (documentIndex === -1) {
    return res.status(404).json({
      error: 'Document not found',
      message: 'Document not found',
    });
  }

  documents.splice(documentIndex, 1);

  res.json({
    success: true,
    message: 'Document deleted successfully',
  });
});

// Folder routes
app.get('/folders', requireAuth, (req, res) => {
  const userFolders = folders.filter(folder => folder.userId === req.user.id);
  res.json({
    success: true,
    folders: userFolders,
  });
});

app.post('/folders', requireAuth, (req, res) => {
  const { name, description, color, parentId } = req.body;
  
  if (!name) {
    return res.status(400).json({
      error: 'Name required',
      message: 'Please provide a name for the folder',
    });
  }

  const folder = {
    id: (folders.length + 1).toString(),
    name,
    description: description || null,
    color: color || '#3B82F6',
    parentId: parentId || null,
    userId: req.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  folders.push(folder);

  res.status(201).json({
    success: true,
    message: 'Folder created successfully',
    folder,
  });
});

// Tag routes
app.get('/tags', requireAuth, (req, res) => {
  const userTags = tags.filter(tag => tag.userId === req.user.id);
  res.json({
    success: true,
    tags: userTags,
  });
});

app.post('/tags', requireAuth, (req, res) => {
  const { name, color } = req.body;
  
  if (!name) {
    return res.status(400).json({
      error: 'Name required',
      message: 'Please provide a name for the tag',
    });
  }

  const tag = {
    id: (tags.length + 1).toString(),
    name: name.toLowerCase(),
    color: color || '#10B981',
    userId: req.user.id,
    createdAt: new Date(),
  };

  tags.push(tag);

  res.status(201).json({
    success: true,
    message: 'Tag created successfully',
    tag,
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'File size exceeds the 10MB limit',
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 