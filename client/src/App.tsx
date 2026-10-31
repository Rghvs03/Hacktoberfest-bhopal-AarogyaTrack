import React, { useEffect, useState } from 'react';
import { api, DoctorUser, LocalPatient, LocalConsultation } from './api';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { PatientDetailView } from './components/PatientDetailView';
import { NewPatientModal } from './components/NewPatientModal';
import { NewConsultationModal } from './components/NewConsultationModal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<DoctorUser | null>(api.getCurrentUser());
  const [patients, setPatients] = useState<LocalPatient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');
  
  // Modals
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false);
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const loadPatients = async (query?: string) => {
    try {
      const data = await api.getPatients(query);
      setPatients(data);
    } catch (e) {
      console.error('Failed to load patient list:', e);
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadPatients(searchQuery);
    }
  }, [currentUser, searchQuery, refreshTrigger]);

  const handleLogout = () => {
    api.clearAuth();
    setCurrentUser(null);
    setSelectedPatientId(null);
  };

  const handlePatientCreated = (newPatient: LocalPatient) => {
    setPatients((prev) => [newPatient, ...prev]);
    setSelectedPatientId(newPatient.id);
    setSelectedPatientName(newPatient.fullName);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleConsultationCreated = (_consultation: LocalConsultation) => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectPatient = (id: string) => {
    const found = patients.find((p) => p.id === id);
    setSelectedPatientId(id);
    setSelectedPatientName(found ? found.fullName : 'Patient');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-paper-base">
        <Navbar user={null} onLogout={() => {}} onRefresh={() => {}} />
        <LoginView onSuccess={(user) => setCurrentUser(user)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-base flex flex-col">
      <Navbar
        user={currentUser}
        onLogout={handleLogout}
        onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
      />

      <main className="flex-1">
        {selectedPatientId ? (
          <PatientDetailView
            patientId={selectedPatientId}
            onBack={() => setSelectedPatientId(null)}
            onOpenNewConsultation={() => setIsNewConsultationOpen(true)}
            refreshTrigger={refreshTrigger}
          />
        ) : (
          <DashboardView
            patients={patients}
            loading={loadingPatients}
            onSelectPatient={handleSelectPatient}
            onOpenNewPatientModal={() => setIsNewPatientOpen(true)}
            onSearch={(q) => setSearchQuery(q)}
            searchQuery={searchQuery}
          />
        )}
      </main>

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={isNewPatientOpen}
        onClose={() => setIsNewPatientOpen(false)}
        onCreated={handlePatientCreated}
      />

      {/* New Consultation Modal */}
      {selectedPatientId && (
        <NewConsultationModal
          isOpen={isNewConsultationOpen}
          patientId={selectedPatientId}
          patientName={selectedPatientName}
          onClose={() => setIsNewConsultationOpen(false)}
          onCreated={handleConsultationCreated}
        />
      )}
    </div>
  );
};

export default App;

