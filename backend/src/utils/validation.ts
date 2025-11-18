export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'El correo electrónico es obligatorio' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'El formato del correo electrónico no es válido' };
  }

  return { isValid: true };
};

export const validatePhone = (phone: string | undefined): ValidationResult => {
  if (!phone || !phone.trim()) {
    return { isValid: true }; // Teléfono es opcional
  }

  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'El formato del teléfono no es válido' };
  }

  return { isValid: true };
};

export const validateRequired = (value: string | undefined, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, error: `El campo ${fieldName} es obligatorio` };
  }
  return { isValid: true };
};

export const validateCandidateData = (data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}): ValidationResult => {
  // Validar nombre
  const firstNameValidation = validateRequired(data.firstName, 'nombre');
  if (!firstNameValidation.isValid) {
    return firstNameValidation;
  }

  // Validar apellido
  const lastNameValidation = validateRequired(data.lastName, 'apellido');
  if (!lastNameValidation.isValid) {
    return lastNameValidation;
  }

  // Validar email
  const emailValidation = validateEmail(data.email || '');
  if (!emailValidation.isValid) {
    return emailValidation;
  }

  // Validar teléfono (opcional)
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }

  return { isValid: true };
};

