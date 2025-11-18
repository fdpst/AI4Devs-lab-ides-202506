import React, { useState, useEffect } from 'react';
import { api, Candidate } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FormularioCandidato from './FormularioCandidato';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCandidates();
      setCandidates(data);
    } catch (err) {
      setError('Error al cargar candidatos. Por favor, intente nuevamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateAdded = () => {
    setShowForm(false);
    loadCandidates();
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>Sistema ATS - Gestión de Talento</h1>
            <p className="dashboard-subtitle">Panel del Reclutador</p>
          </div>
          <div className="user-info">
            <div className="user-details">
              <span className="user-name">{user?.name || user?.email}</span>
              <span className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Reclutador'}</span>
            </div>
            <button 
              className="btn btn-secondary btn-logout"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            aria-label="Añadir nuevo candidato"
          >
            + Añadir Candidato
          </button>
        </div>

        {showForm && (
          <FormularioCandidato
            onSuccess={handleCandidateAdded}
            onCancel={() => setShowForm(false)}
          />
        )}

        <section className="candidates-section">
          <h2>Lista de Candidatos</h2>
          
          {loading && (
            <div className="loading-message">
              <p>Cargando candidatos...</p>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadCandidates} className="btn btn-secondary">
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="empty-state">
              <p>No hay candidatos registrados aún.</p>
              <p>Comience añadiendo su primer candidato.</p>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && (
            <div className="candidates-grid">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-card">
                  <div className="candidate-header">
                    <h3>{candidate.firstName} {candidate.lastName}</h3>
                    <span className="candidate-email">{candidate.email}</span>
                  </div>
                  <div className="candidate-details">
                    {candidate.phone && (
                      <p><strong>Teléfono:</strong> {candidate.phone}</p>
                    )}
                    {candidate.address && (
                      <p><strong>Dirección:</strong> {candidate.address}</p>
                    )}
                    {candidate.education && (
                      <p><strong>Educación:</strong> {candidate.education}</p>
                    )}
                    {candidate.experience && (
                      <p><strong>Experiencia:</strong> {candidate.experience}</p>
                    )}
                    {candidate.cvPath && (
                      <p className="cv-indicator">✓ CV adjunto</p>
                    )}
                  </div>
                  <div className="candidate-footer">
                    <small>
                      Añadido: {new Date(candidate.createdAt).toLocaleDateString('es-ES')}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

