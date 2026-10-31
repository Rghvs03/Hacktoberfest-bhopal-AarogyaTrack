import React, { useState } from 'react';
import { api, LocalPatient } from '../api';
import { X, UserPlus } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (patient: LocalPatient) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [village, setVillage] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const created = await api.createPatient({
        fullName,
        age: age === '' ? null : Number(age),
        gender,
        village,
        contactNumber: contactNumber || null,
        medicalHistory: medicalHistory || null,
        allergies: allergies || null,
      });
      onCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="card-clinical w-full max-w-lg p-6 bg-white shadow-xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-clinical-100 text-clinical-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Register New Patient</h2>
              <p className="text-xs text-slate-500">Record demographic baseline for travelling health camps</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Village / Locality *
              </label>
              <input
                type="text"
                required
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                placeholder="e.g. Rampur Kalan"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Age
              </label>
              <input
                type="number"
                min="0"
                max="125"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="e.g. 52"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contact Phone (Optional)
            </label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+91 98XXX XXXXX"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Chronic Medical History
            </label>
            <input
              type="text"
              value={medicalHistory}
              onChange={(e) => setMedicalHistory(e.target.value)}
              placeholder="e.g. Essential Hypertension, Type 2 Diabetes"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Known Drug Allergies
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa drugs (or 'NKDA')"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-clinical-600 focus:ring-1 focus:ring-clinical-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-medium bg-clinical-700 text-white hover:bg-clinical-800 rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Save Patient Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

