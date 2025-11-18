const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3010';

// Función auxiliar para obtener el token del localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función auxiliar para hacer peticiones con autenticación
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  
  // Convertir headers existentes a un objeto si es necesario
  const existingHeaders: Record<string, string> = {};
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        existingHeaders[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        existingHeaders[key] = value;
      });
    } else {
      Object.assign(existingHeaders, options.headers);
    }
  }

  const headers: Record<string, string> = {
    ...existingHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: headers as HeadersInit,
  });

  // Si el token es inválido o expiró, redirigir al login
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }

  return response;
};

export interface Candidate {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  experience?: string;
  cvPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCandidateData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  education?: string;
  experience?: string;
  cv?: File;
}

export interface UpdateCandidateData extends CreateCandidateData {
  id: number;
}

export interface ApiResponse {
  message?: string;
  candidate?: Candidate;
  error?: string;
}

export const api = {
  // Obtener todos los candidatos
  getCandidates: async (): Promise<Candidate[]> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/candidates`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error al obtener candidatos' }));
      throw new Error(error.error || 'Error al obtener candidatos');
    }
    return response.json();
  },

  // Obtener un candidato por ID
  getCandidate: async (id: number): Promise<Candidate> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/candidates/${id}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error al obtener candidato' }));
      throw new Error(error.error || 'Error al obtener candidato');
    }
    return response.json();
  },

  // Crear un nuevo candidato
  createCandidate: async (data: CreateCandidateData): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.education) formData.append('education', data.education);
    if (data.experience) formData.append('experience', data.experience);
    if (data.cv) formData.append('cv', data.cv);

    const response = await fetchWithAuth(`${API_BASE_URL}/api/candidates`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Error al crear candidato');
    }

    return result;
  },

  // Actualizar un candidato
  updateCandidate: async (data: UpdateCandidateData): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.education) formData.append('education', data.education);
    if (data.experience) formData.append('experience', data.experience);
    if (data.cv) formData.append('cv', data.cv);

    const response = await fetchWithAuth(`${API_BASE_URL}/api/candidates/${data.id}`, {
      method: 'PUT',
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Error al actualizar candidato');
    }

    return result;
  },

  // Eliminar un candidato
  deleteCandidate: async (id: number): Promise<void> => {
    const response = await fetchWithAuth(`${API_BASE_URL}/api/candidates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error al eliminar candidato' }));
      throw new Error(error.error || 'Error al eliminar candidato');
    }
  },
};
