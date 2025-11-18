import React, { useState } from 'react';
import { api, CreateCandidateData } from '../services/api';
import './FormularioCandidato.css';

interface FormularioCandidatoProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  cv?: string;
}

const FormularioCandidato: React.FC<FormularioCandidatoProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<CreateCandidateData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    education: '',
    experience: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'El formato del teléfono no es válido';
      }
    }

    if (cvFile) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(cvFile.type)) {
        newErrors.cv = 'Solo se permiten archivos PDF, DOC o DOCX';
      } else if (cvFile.size > maxSize) {
        newErrors.cv = 'El archivo no debe exceder 10MB';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file);
      // Limpiar error del archivo
      if (errors.cv) {
        setErrors(prev => ({
          ...prev,
          cv: undefined
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const candidateData: CreateCandidateData = {
        ...formData,
        cv: cvFile || undefined,
      };

      const response = await api.createCandidate(candidateData);
      
      setSuccessMessage(response.message || 'Candidato añadido exitosamente');
      
      // Limpiar formulario
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        education: '',
        experience: '',
      });
      setCvFile(null);
      
      // Esperar un momento para mostrar el mensaje de éxito
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || 'Error al añadir candidato. Por favor, intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="formulario-candidato-container">
      <div className="formulario-candidato">
        <div className="form-header">
          <h2>Añadir Nuevo Candidato</h2>
          <button 
            className="btn-close"
            onClick={onCancel}
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            {successMessage}
          </div>
        )}

        {submitError && (
          <div className="alert alert-error" role="alert">
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                Nombre <span className="required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={errors.firstName ? 'error' : ''}
                aria-required="true"
                aria-invalid={!!errors.firstName}
                aria-describedby={errors.firstName ? 'firstName-error' : undefined}
              />
              {errors.firstName && (
                <span id="firstName-error" className="error-message" role="alert">
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                Apellido <span className="required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'error' : ''}
                aria-required="true"
                aria-invalid={!!errors.lastName}
                aria-describedby={errors.lastName ? 'lastName-error' : undefined}
              />
              {errors.lastName && (
                <span id="lastName-error" className="error-message" role="alert">
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">
                Correo Electrónico <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                aria-required="true"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <span id="email-error" className="error-message" role="alert">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
              {errors.phone && (
                <span id="phone-error" className="error-message" role="alert">
                  {errors.phone}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="education">Educación</label>
            <textarea
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ej: Licenciatura en Ingeniería de Sistemas, Universidad Nacional..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Experiencia Laboral</label>
            <textarea
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              rows={4}
              placeholder="Ej: Desarrollador Full Stack en Empresa XYZ (2020-2023)..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="cv">
              CV (PDF, DOC, DOCX)
            </label>
            <input
              type="file"
              id="cv"
              name="cv"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className={errors.cv ? 'error' : ''}
              aria-invalid={!!errors.cv}
              aria-describedby={errors.cv ? 'cv-error' : undefined}
            />
            {cvFile && (
              <p className="file-info">
                Archivo seleccionado: {cvFile.name} ({(cvFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {errors.cv && (
              <span id="cv-error" className="error-message" role="alert">
                {errors.cv}
              </span>
            )}
            <small className="form-hint">
              Máximo 10MB. Formatos permitidos: PDF, DOC, DOCX
            </small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Añadir Candidato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCandidato;

