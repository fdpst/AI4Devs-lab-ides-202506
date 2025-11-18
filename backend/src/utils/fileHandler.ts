import fs from 'fs';
import path from 'path';

export const deleteFile = (filePath: string | null | undefined): boolean => {
  if (!filePath) {
    return false;
  }

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

export const isValidCvFile = (filename: string): boolean => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = getFileExtension(filename);
  return allowedExtensions.includes(ext);
};

