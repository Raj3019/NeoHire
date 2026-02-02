'use client';
import React, { useState, useEffect } from 'react';
import { NeoButton, NeoCard } from '@/components/ui/neo';
import { X, Plus, Trash2, Sliders, Briefcase, MapPin, Code } from 'lucide-react';

export default function CreateAlertModal({ alert, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    requiredSkills: [],
    minExperience: 0,
    minFitScore: 80,
    location: '',
    workMode: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (alert) {
      setFormData({
        name: alert.name || '',
        requiredSkills: alert.requiredSkills || [],
        minExperience: alert.minExperience || 0,
        minFitScore: alert.minFitScore || 80,
        location: alert.location || '',
        workMode: alert.workMode || ''
      });
    }
  }, [alert]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.requiredSkills.length === 0) {
      alert('At least one skill is required');
      return;
    }

    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-neo-bg dark:bg-zinc-950 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]">
        <div className="p-6 border-b-4 border-black dark:border-white flex justify-between items-center bg-neo-yellow">
          <h2 className="text-2xl font-black uppercase flex items-center gap-2">
            <Sliders className="w-6 h-6" />
            {alert ? 'Edit Alert' : 'Create Talent Alert'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Alert Name */}
          <div className="space-y-2">
            <label className="block text-sm font-black uppercase tracking-widest dark:text-white">Alert Label</label>
            <input
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineers"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 border-4 border-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experience */}
            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-widest dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Min Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.minExperience}
                onChange={(e) => setFormData({ ...formData, minExperience: parseInt(e.target.value) })}
                className="w-full p-3 border-4 border-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-mono"
              />
            </div>

            {/* Match Score */}
            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-widest dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4" /> Minimum Fit Score (%)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="50"
                  max="100"
                  step="5"
                  value={formData.minFitScore}
                  onChange={(e) => setFormData({ ...formData, minFitScore: parseInt(e.target.value) })}
                  className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-neo-blue border-2 border-black"
                />
                <span className="w-12 text-center font-black text-neo-blue border-2 border-black p-1 bg-white">
                  {formData.minFitScore}%
                </span>
              </div>
            </div>
          </div>

          {/* Location & Work Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-widest dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Prefered Location
              </label>
              <input
                type="text"
                placeholder="e.g. Remote or London"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full p-3 border-4 border-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none transition-all font-mono placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black uppercase tracking-widest dark:text-white">Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                className="w-full p-3 border-4 border-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none font-bold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22black%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:20px_20px] bg-[right_10px_center] bg-no-repeat"
              >
                <option value="">Any Mode</option>
                <option value="Remote">Remote Only</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Skills Tags */}
          <div className="space-y-3 p-6 bg-neo-blue/5 border-4 border-dashed border-neo-blue/30 relative">
            <label className="block text-sm font-black uppercase tracking-widest text-neo-blue">Required Skills (Match Filter)</label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. React)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                className="flex-1 p-3 border-4 border-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none font-mono"
              />
              <NeoButton type="button" onClick={handleAddSkill} className="bg-neo-blue text-white">
                <Plus className="w-5 h-5" />
              </NeoButton>
            </div>

            <div className="flex flex-wrap gap-2 min-h-12 items-center">
              {formData.requiredSkills.length === 0 ? (
                <span className="text-gray-400 font-mono text-xs italic">Add skills that candidates must have...</span>
              ) : (
                formData.requiredSkills.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 border-2 border-black dark:border-white font-bold text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none"
                  >
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-neo-pink">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t-4 border-black dark:border-white">
            <NeoButton
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </NeoButton>
            <NeoButton
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-neo-black text-white hover:bg-gray-800"
            >
              {isSubmitting ? 'Processing...' : alert ? 'Update Alert' : 'Launch Alert'}
            </NeoButton>
          </div>
        </form>
      </div>
    </div>
  );
}
