'use client';
import React, { useState, useEffect } from 'react';
import { NeoButton, NeoCard, NeoBadge } from '@/components/ui/neo';
import { X, Plus, Trash2, Sliders, Briefcase, MapPin, Code, Zap } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border-4 border-neo-black dark:border-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] flex flex-col max-h-[90vh]">

        {/* Header - Retro Tab Style */}
        <div className="p-5 border-b-4 border-neo-black dark:border-white flex justify-between items-center bg-white dark:bg-zinc-900 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neo-blue border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight dark:text-white">
              {alert ? 'Update Radar' : 'Launch Talent Radar'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-800 hover:bg-neo-red hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] active:translate-y-px active:shadow-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 overflow-y-auto no-scrollbar">

          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-neo-blue rounded-full"></span> Alert Name / Label
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior React Developers - London"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-4 border-2 border-neo-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none focus:ring-0 focus:scale-[1.01] transition-all font-bold text-lg shadow-neo-sm dark:shadow-[4px_4px_0px_0px_#ffffff]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Experience (Min Years)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.minExperience}
                    onChange={(e) => setFormData({ ...formData, minExperience: parseInt(e.target.value) || 0 })}
                    className="w-full p-4 border-2 border-neo-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none font-black text-xl shadow-neo-sm"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-gray-400">YRS</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Code className="w-4 h-4" /> AI Fit Threshold
                </label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-900 border-2 border-neo-black dark:border-white shadow-neo-sm">
                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="5"
                    value={formData.minFitScore}
                    onChange={(e) => setFormData({ ...formData, minFitScore: parseInt(e.target.value) })}
                    className="flex-1 cursor-pointer accent-neo-blue h-6"
                  />
                  <div className="bg-neo-blue text-white min-w-[60px] text-center px-2 py-1.5 font-black text-sm border-2 border-neo-black shadow-neo-sm">
                    {formData.minFitScore}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Requirements */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Targeted Location
                </label>
                <input
                  type="text"
                  placeholder={formData.workMode === 'Remote' ? 'Not required for Remote' : 'e.g. Mumbai, London, New York'}
                  value={formData.workMode === 'Remote' ? '' : formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  disabled={formData.workMode === 'Remote'}
                  className={`w-full p-4 border-2 border-neo-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none font-bold shadow-neo-sm ${formData.workMode === 'Remote' ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-zinc-800' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  Work Preference
                </label>
                <div className="relative">
                  <select
                    value={formData.workMode}
                    onChange={(e) => {
                      const newMode = e.target.value;
                      setFormData({ ...formData, workMode: newMode, ...(newMode === 'Remote' ? { location: '' } : {}) });
                    }}
                    className="w-full p-4 border-2 border-neo-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none font-black appearance-none shadow-neo-sm"
                  >
                    <option value="">Any Mode</option>
                    <option value="Remote">Remote Only</option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <X className="w-4 h-4 rotate-45" />
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Input */}
            <div className="space-y-4 p-5 bg-neo-blue/5 dark:bg-blue-950/20 border-2 border-neo-black dark:border-white relative overflow-hidden">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-widest text-neo-blue dark:text-blue-400">Required Skill Stack</label>
                <NeoBadge variant="blue" className="text-[10px]">{formData.requiredSkills.length} SKILLS</NeoBadge>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a skill & press enter..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                  className="flex-1 p-3 border-2 border-neo-black dark:border-white dark:bg-zinc-900 dark:text-white focus:outline-none font-bold text-sm shadow-neo-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="bg-neo-blue text-white px-4 border-2 border-neo-black shadow-neo-sm active:translate-y-px active:shadow-none transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {formData.requiredSkills.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No skills added yet. Skill matching is the core of Talent Radar.</p>
                ) : (
                  formData.requiredSkills.map(skill => (
                    <div
                      key={skill}
                      className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-3 py-1.5 border-2 border-neo-black dark:border-white font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-neo-red transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="p-6 border-t-4 border-neo-black dark:border-white flex gap-4 bg-gray-50 dark:bg-zinc-900">
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
            onClick={handleSubmit}
            disabled={isSubmitting}
            variant="blue"
            className="flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin text-lg">⏳</span> PLOTTING...
              </span>
            ) : alert ? 'Update Alert' : 'Launch Radar'}
          </NeoButton>
        </div>
      </div>
    </div>
  );
}
