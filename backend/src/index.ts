import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { validateCandidateData } from './utils/validation';
import { deleteFile } from './utils/fileHandler';
import { authenticate, requireAdmin } from './middleware/auth';
import { hashPassword, verifyPassword, generateToken, validatePasswordStrength } from './utils/auth';
import { validateUserData } from './utils/userValidation';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Crear directorio para CVs si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cv-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF, DOC o DOCX'));
    }
  }
});

// ==================== RUTAS PÚBLICAS ====================

// Ruta raíz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hola LTI!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      candidates: '/api/candidates (requiere autenticación)',
      users: '/api/users (requiere autenticación y rol admin)'
    }
  });
});

// ==================== AUTENTICACIÓN ====================

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({ error: 'Usuario inactivo. Contacte al administrador' });
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    // No enviar la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// POST /api/auth/register - Registrar nuevo usuario (solo admin)
app.post('/api/auth/register', authenticate, requireAdmin, async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Validar datos
    const validation = validateUserData({ email, name, password, role: role || 'recruiter' });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Validar fortaleza de contraseña
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico' });
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name || null,
        role: role || 'recruiter',
        isActive: true
      }
    });

    // No enviar la contraseña en la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Ya existe un usuario con este correo electrónico' });
    } else {
      res.status(500).json({ error: 'Error al registrar usuario: ' + error.message });
    }
  }
});

// GET /api/auth/me - Obtener información del usuario actual
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

// ==================== CRUD USUARIOS (Solo Admin) ====================

// GET /api/users - Obtener todos los usuarios
app.get('/api/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET /api/users/:id - Obtener un usuario por ID
app.get('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// PUT /api/users/:id - Actualizar un usuario
app.put('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const { email, name, role, isActive, password } = req.body;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Validar datos (password es opcional en actualización)
    const validation = validateUserData({ 
      email, 
      name, 
      password: password ? password : undefined, 
      role 
    });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Si se proporciona una nueva contraseña, validar fortaleza
    let hashedPassword = existingUser.password;
    if (password) {
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({ error: passwordValidation.error });
      }
      hashedPassword = await hashPassword(password);
    }

    // Si el email cambió, verificar que no exista otro usuario con ese email
    if (email && email.toLowerCase().trim() !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() }
      });

      if (emailExists) {
        return res.status(400).json({ 
          error: 'Ya existe otro usuario con este correo electrónico' 
        });
      }
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: email ? email.toLowerCase().trim() : existingUser.email,
        name: name !== undefined ? name : existingUser.name,
        role: role || existingUser.role,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);

    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Ya existe otro usuario con este correo electrónico' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar usuario: ' + error.message });
    }
  }
});

// DELETE /api/users/:id - Eliminar un usuario
app.delete('/api/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // No permitir eliminar el propio usuario
    if (id === req.user!.userId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Eliminar usuario
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);

    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      res.status(500).json({ error: 'Error al eliminar usuario: ' + error.message });
    }
  }
});

// ==================== CRUD CANDIDATOS (Requiere Autenticación) ====================

// GET /api/candidates - Obtener todos los candidatos
app.get('/api/candidates', authenticate, async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(candidates);
  } catch (error) {
    console.error('Error al obtener candidatos:', error);
    res.status(500).json({ error: 'Error al obtener candidatos' });
  }
});

// GET /api/candidates/:id - Obtener un candidato por ID
app.get('/api/candidates/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de candidato inválido' });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }

    res.json(candidate);
  } catch (error) {
    console.error('Error al obtener candidato:', error);
    res.status(500).json({ error: 'Error al obtener candidato' });
  }
});

// POST /api/candidates - Crear un nuevo candidato
app.post('/api/candidates', authenticate, upload.single('cv'), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, education, experience } = req.body;

    // Validar datos
    const validation = validateCandidateData({ firstName, lastName, email, phone });
    if (!validation.isValid) {
      // Si hay un archivo subido, eliminarlo
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({ error: validation.error });
    }

    // Verificar si el email ya existe
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email }
    });

    if (existingCandidate) {
      // Si hay un archivo subido, eliminarlo
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({ 
        error: 'Ya existe un candidato con este correo electrónico' 
      });
    }

    const cvPath = req.file ? req.file.path : null;

    const candidate = await prisma.candidate.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        education: education || null,
        experience: experience || null,
        cvPath
      }
    });

    res.status(201).json({ 
      message: 'Candidato añadido exitosamente',
      candidate 
    });
  } catch (error: any) {
    console.error('Error al crear candidato:', error);
    
    // Si hay un error y se subió un archivo, eliminarlo
    if (req.file) {
      deleteFile(req.file.path);
    }

    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Ya existe un candidato con este correo electrónico' });
    } else {
      res.status(500).json({ error: 'Error al crear candidato: ' + error.message });
    }
  }
});

// PUT /api/candidates/:id - Actualizar un candidato
app.put('/api/candidates/:id', authenticate, upload.single('cv'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      // Si hay un archivo subido, eliminarlo
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({ error: 'ID de candidato inválido' });
    }

    // Verificar que el candidato existe
    const existingCandidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!existingCandidate) {
      // Si hay un archivo subido, eliminarlo
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }

    const { firstName, lastName, email, phone, address, education, experience } = req.body;

    // Validar datos
    const validation = validateCandidateData({ firstName, lastName, email, phone });
    if (!validation.isValid) {
      // Si hay un archivo subido, eliminarlo
      if (req.file) {
        deleteFile(req.file.path);
      }
      return res.status(400).json({ error: validation.error });
    }

    // Si el email cambió, verificar que no exista otro candidato con ese email
    if (email !== existingCandidate.email) {
      const emailExists = await prisma.candidate.findUnique({
        where: { email }
      });

      if (emailExists) {
        // Si hay un archivo subido, eliminarlo
        if (req.file) {
          deleteFile(req.file.path);
        }
        return res.status(400).json({ 
          error: 'Ya existe otro candidato con este correo electrónico' 
        });
      }
    }

    // Manejar el CV: si se sube uno nuevo, eliminar el anterior
    let cvPath = existingCandidate.cvPath;
    if (req.file) {
      // Eliminar el CV anterior si existe
      if (existingCandidate.cvPath) {
        deleteFile(existingCandidate.cvPath);
      }
      cvPath = req.file.path;
    }

    // Actualizar candidato
    const updatedCandidate = await prisma.candidate.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        education: education || null,
        experience: experience || null,
        cvPath
      }
    });

    res.json({ 
      message: 'Candidato actualizado exitosamente',
      candidate: updatedCandidate 
    });
  } catch (error: any) {
    console.error('Error al actualizar candidato:', error);
    
    // Si hay un error y se subió un archivo, eliminarlo
    if (req.file) {
      deleteFile(req.file.path);
    }

    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Ya existe otro candidato con este correo electrónico' });
    } else if (error.code === 'P2025') {
      res.status(404).json({ error: 'Candidato no encontrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar candidato: ' + error.message });
    }
  }
});

// DELETE /api/candidates/:id - Eliminar un candidato
app.delete('/api/candidates/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de candidato inválido' });
    }

    // Verificar que el candidato existe
    const candidate = await prisma.candidate.findUnique({
      where: { id }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidato no encontrado' });
    }

    // Eliminar el CV si existe
    if (candidate.cvPath) {
      deleteFile(candidate.cvPath);
    }

    // Eliminar el candidato de la base de datos
    await prisma.candidate.delete({
      where: { id }
    });

    res.json({ 
      message: 'Candidato eliminado exitosamente' 
    });
  } catch (error: any) {
    console.error('Error al eliminar candidato:', error);

    if (error.code === 'P2025') {
      res.status(404).json({ error: 'Candidato no encontrado' });
    } else {
      res.status(500).json({ error: 'Error al eliminar candidato: ' + error.message });
    }
  }
});

// ==================== MANEJO DE ERRORES ====================

// Manejo de errores de multer
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB' });
    }
    return res.status(400).json({ error: 'Error al subir archivo: ' + err.message });
  }
  
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
