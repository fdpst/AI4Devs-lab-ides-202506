import { validateEmail } from './validation';

export interface UserValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateUserData = (data: {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
}): UserValidationResult => {
  // Validar email
  if (!data.email || !data.email.trim()) {
    return { isValid: false, error: 'El correo electrónico es obligatorio' };
  }

  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // Validar nombre (opcional pero si se proporciona debe tener al menos 2 caracteres)
  if (data.name && data.name.trim().length < 2) {
    return { isValid: false, error: 'El nombre debe tener al menos 2 caracteres' };
  }

  // Validar password (si se proporciona)
  if (data.password !== undefined) {
    if (!data.password || data.password.trim().length === 0) {
      return { isValid: false, error: 'La contraseña es obligatoria' };
    }
  }

  // Validar role
  if (data.role && !['recruiter', 'admin'].includes(data.role)) {
    return { isValid: false, error: 'El rol debe ser "recruiter" o "admin"' };
  }

  return { isValid: true };
};

