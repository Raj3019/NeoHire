'use client';
import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import { useAuthStore } from '@/lib/store';
import { recruiterAPI } from '@/lib/api';
import { getMissingProfileFields, formatDate } from '@/lib/utils';
import { NeoCard, NeoButton, NeoInput, NeoBadge, NeoDatePicker, NeoCheckbox, NeoRadio } from '@/components/ui/neo';
import { User, Briefcase, MapPin, GraduationCap, Globe, Edit2, Save, X, Trophy, Plus, Trash2, Camera, Crown } from 'lucide-react';

import ProfileCompletionBanner from '@/components/shared/ProfileCompletionBanner';

const FIELD_LIMITS = {
  fullName: 50,
  headline: 120,
  about: 1000,
  phone: 10,
  area: 100,
  currentCity: 50,
  state: 50,
  country: 50,
  zipCode: 6,
  schoolName: 150,
  collegeName: 150,
  university: 150,
  degree: 100,
  specialization: 100,
  thesisTitle: 200,
  fieldOfStudy: 100,
  company: 100,
  jobTitle: 100,
  location: 100,
  description: 1000,
  language: 50,
  issuingOrganization: 150,
  certificationName: 150,
  portfolioUrl: 200,
  linkedinUrl: 200,
  twitter: 100,
  githubUrl: 200,
  skills: 500,
  industries: 300,
  jobTypes: 300,
  currentRole: 100,
  currentEmployer: 100,
  companyURL: 200
};

// Helper component for displaying field in view mode vs edit mode
const DisplayField = ({ label, value, name, type = "text", onChange, isTextarea = false, placeholder = "", isEditing, maxLength, ...props }) => {
  if (isEditing) {
    if (isTextarea) {
      return (
        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="block font-bold text-sm dark:text-white">{label}</label>
            {maxLength && (
              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500">
                {(value || '').length}/{maxLength}
              </span>
            )}
          </div>
          <textarea
            name={name}
            value={value || ''}
            onChange={onChange}
            maxLength={maxLength}
            className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 focus:outline-none focus:ring-2 focus:ring-neo-blue font-mono text-sm h-24 resize-none dark:text-white"
            placeholder={placeholder}
          />
        </div>
      );
    }
    if (type === 'date') {
      return (
        <NeoDatePicker label={label} name={name} value={value || ''} onChange={onChange} {...props} />
      );
    }
    return (
      <NeoInput
        label={label}
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        {...props}
      />
    );
  }
  return (
    <div>
      <label className="block font-bold text-xs mb-1 text-gray-400 dark:text-gray-500 uppercase">{label}</label>
      <span className="font-bold dark:text-white text-lg">
        {type === 'date' ? formatDate(value) : (value || 'Not specified')}
      </span>
    </div>
  );
};

export default function RecruiterProfilePage() {
  const { user, updateProfile, fetchProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.name || '',
    email: user?.email || '',
    headline: user?.headline || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender || '',

    // Address
    currentCity: user?.currentCity || '',
    area: user?.area || '',
    state: user?.state || '',
    country: user?.country || 'India',
    zipCode: user?.zipCode || '',

    about: user?.about || '',
    skills: user?.skills || [],
    skillsString: user?.skills?.join(', ') || '',
    experienceYears: user?.experienceYears || 0,
    isFresher: user?.experienceYears === 0,

    // Education Object (Matching Mongoose Schema)
    education: user?.education || {
      tenth: { schoolName: '', board: '', percentage: '', passingYear: '', city: '', state: '', grade: '' },
      juniorCollege: { collegeName: '', board: '', stream: '', percentage: '', passingYear: '', city: '', state: '', grade: '' },
      graduation: { collegeName: '', university: '', degree: '', specialization: '', percentage: '', cgpa: '', passingYear: '', city: '', state: '' },
      postGraduation: { collegeName: '', university: '', degree: '', specialization: '', percentage: '', cgpa: '', passingYear: '', city: '', state: '' },
      phd: { university: '', fieldOfStudy: '', thesisTitle: '', year: '' }
    },

    workExperience: user?.workExperience || [],
    languages: user?.languages || [],
    certifications: user?.certifications || [],

    currentRole: user?.currentRole || '',
    currentEmployer: user?.currentEmployer || '',
    companyURL: user?.companyURL || '',
    totalHires: user?.totalHires || 0,

    socials: user?.socials || { linkedin: '', twitter: '' },
    portfolioUrl: user?.portfolioUrl || '',
    linkedinUrl: user?.linkedinUrl || '',
    githubUrl: user?.githubUrl || '',

    preferences: user?.preferences || { industries: [], jobTypes: [] },
    industriesString: user?.preferences?.industries?.join(', ') || '',
    jobTypesString: user?.preferences?.jobTypes?.join(', ') || '',

    resumeFileURL: user?.resumeFileURL || '',
    profilePicture: user?.profilePicture || '',
    createdAt: user?.createdAt || ''
  });

  // Sync with store/API data
  const syncFormData = (apiData) => {
    if (!apiData) return;

    const edu = apiData.education || {};
    const jp = apiData.preferences || apiData.jobPreferences || {};
    const soc = apiData.socials || {};

    setFormData(prev => ({
      ...prev,
      fullName: apiData.fullName || apiData.name || '',
      email: apiData.email || '',
      headline: apiData.headline || '',
      phone: apiData.phone || '',
      dateOfBirth: apiData.dateOfBirth ? new Date(apiData.dateOfBirth).toISOString().split('T')[0] : '',
      gender: apiData.gender || '',
      currentCity: apiData.currentCity || '',
      area: apiData.area || '',
      state: apiData.state || '',
      country: apiData.country || 'India',
      zipCode: apiData.zipCode || '',
      about: apiData.about || apiData.bio || '',

      skills: apiData.skills || [],
      skillsString: apiData.skills?.join(', ') || '',
      experienceYears: apiData.experienceYears || 0,
      isFresher: apiData.isFresher !== undefined ? apiData.isFresher : (apiData.experienceYears === 0 || apiData.workExperience?.length === 0),

      // Education (Support both structures)
      education: {
        tenth: {
          schoolName: edu.tenth?.schoolName || '',
          board: edu.tenth?.board || '',
          percentage: edu.tenth?.percentage || '',
          passingYear: edu.tenth?.passingYear || edu.tenth?.year || '',
          city: edu.tenth?.city || '',
          state: edu.tenth?.state || '',
          grade: edu.tenth?.grade || ''
        },
        juniorCollege: {
          collegeName: edu.juniorCollege?.collegeName || '',
          board: edu.juniorCollege?.board || '',
          stream: edu.juniorCollege?.stream || '',
          percentage: edu.juniorCollege?.percentage || '',
          passingYear: edu.juniorCollege?.passingYear || edu.juniorCollege?.year || '',
          city: edu.juniorCollege?.city || '',
          state: edu.juniorCollege?.state || '',
          grade: edu.juniorCollege?.grade || ''
        },
        graduation: {
          collegeName: edu.graduation?.collegeName || '',
          university: edu.graduation?.university || '',
          degree: edu.graduation?.degree || '',
          specialization: edu.graduation?.specialization || '',
          percentage: edu.graduation?.percentage || '',
          cgpa: edu.graduation?.cgpa || '',
          passingYear: edu.graduation?.passingYear || edu.graduation?.year || '',
          city: edu.graduation?.city || '',
          state: edu.graduation?.state || '',
          grade: edu.graduation?.grade || ''
        },
        postGraduation: {
          collegeName: edu.postGraduation?.collegeName || '',
          university: edu.postGraduation?.university || '',
          degree: edu.postGraduation?.degree || '',
          specialization: edu.postGraduation?.specialization || '',
          percentage: edu.postGraduation?.percentage || '',
          cgpa: edu.postGraduation?.cgpa || '',
          passingYear: edu.postGraduation?.passingYear || edu.postGraduation?.year || '',
          city: edu.postGraduation?.city || '',
          state: edu.postGraduation?.state || '',
          grade: edu.postGraduation?.grade || ''
        },
        phd: {
          university: edu.phd?.university || '',
          fieldOfStudy: edu.phd?.fieldOfStudy || '',
          thesisTitle: edu.phd?.thesisTitle || '',
          year: edu.phd?.year || ''
        }
      },

      workExperience: apiData.workExperience || [],
      languages: apiData.languages || [],
      certifications: apiData.certifications || [],

      currentRole: apiData.currentRole || '',
      currentEmployer: apiData.currentEmployer || '',
      companyURL: apiData.companyURL || '',
      totalHires: apiData.totalHires || 0,

      socials: {
        linkedin: soc.linkedin || apiData.linkedinUrl || '',
        twitter: soc.twitter || ''
      },
      portfolioUrl: apiData.portfolioUrl || '',
      linkedinUrl: apiData.linkedinUrl || soc.linkedin || '',
      githubUrl: apiData.githubUrl || '',

      preferences: {
        industries: jp.industries || [],
        jobTypes: jp.jobTypes || []
      },
      industriesString: (jp.industries || []).join(', '),
      jobTypesString: (jp.jobTypes || []).join(', '),

      resumeFileURL: apiData.resumeFileURL || apiData.resumeUrl || apiData.resume || '',
      profilePicture: apiData.profilePicture || '',
      createdAt: apiData.createdAt || ''
    }));
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (user && user.role) {
        setIsLoadingProfile(true);
        const result = await fetchProfile(user.role);
        if (result.success && result.data) {
          syncFormData(result.data);
        }
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, [user?.role, fetchProfile]);

  useEffect(() => {
    if (user && !isEditing) {
      syncFormData(user);
    }
  }, [user, isEditing]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Phone Validation: 10 digits max
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    // Zip Code Validation: 6 digits max
    if (name === 'zipCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWorkExperienceChange = (index, field, value) => {
    const updatedExp = [...formData.workExperience];
    updatedExp[index] = { ...updatedExp[index], [field]: value };
    setFormData(prev => ({ ...prev, workExperience: updatedExp }));
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, { jobTitle: '', company: '', location: '', startDate: '', endDate: '', description: '', currentlyWorking: false }]
    }));
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  const handleEducationChange = (level, field, value) => {
    // Prevent negative values
    // Validation Logic
    if (value < 0) return;

    if (field === 'percentage' && value > 100) return;
    if (field === 'cgpa' && value > 10) return;
    if ((field === 'year' || field === 'passingYear') && value.length > 4) return;

    setFormData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        [level]: {
          ...prev.education[level],
          [field]: value
        }
      }
    }));
  };

  const handleLanguageChange = (index, field, value) => {
    const updated = [...formData.languages];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, languages: updated }));
  };
  const addLanguage = () => setFormData(prev => ({ ...prev, languages: [...prev.languages, { language: '', proficiency: 'Beginner' }] }));
  const removeLanguage = (index) => setFormData(prev => ({ ...prev, languages: prev.languages.filter((_, i) => i !== index) }));

  const handleCertificationChange = (index, field, value) => {
    const updated = [...formData.certifications];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, certifications: updated }));
  };
  const addCertification = () => setFormData(prev => ({ ...prev, certifications: [...prev.certifications, { name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialURL: '' }] }));
  const removeCertification = (index) => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  const saveProfile = async () => {
    setIsSaving(true);
    if (!user || (!user._id && !user.id)) {
      setSuccessMessage("Error: User ID missing.");
      setIsSaving(false);
      return;
    }

    try {
      const id = user._id || user.id;
      const res = await recruiterAPI.updateProfile(id, formData);
      updateProfile(formData);
      if (user?.role) await fetchProfile(user.role);
      setIsEditing(false);
      setSuccessMessage(res?.message || 'Profile saved successfully!');
    } catch (error) {
      if (!error.isHandled) {
        setSuccessMessage(error.response?.data?.message || 'Failed to save profile.');
      }
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (user) syncFormData(user);
  };

  const handleProfilePicUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('profilePicture', file);
      setIsUploadingProfilePic(true);
      try {
        const res = await recruiterAPI.updateProfilePicture(formData);
        const picUrl = res.profilePicture || res.data?.profilePicture;
        if (picUrl) {
          updateProfile({ profilePicture: picUrl });
          setFormData(prev => ({ ...prev, profilePicture: picUrl }));
          setSuccessMessage('Profile picture updated!');
        }
      } catch (error) {
        if (!error.isHandled) {
          setSuccessMessage('Failed to upload image.');
        }
      } finally {
        setIsUploadingProfilePic(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleResumeUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('resume', file);


      setIsUploadingResume(true);

      try {
        const res = await recruiterAPI.updateResume(formData);
        // The backend returns { message: "...", resumeLink: "..." }
        const resumeUrl = res.resumeLink || res.resumeFileURL || res.resume || res.resumeUrl || res.url || res.data?.resume;

        if (resumeUrl) {
          setFormData(prev => ({ ...prev, resumeFileURL: resumeUrl }));
          setSuccessMessage('Resume uploaded successfully!');
        } else {
          // Fallback if URL isn't directly returned, fetch profile again
          if (user?.role) await fetchProfile(user.role);
          setSuccessMessage('Resume uploaded! Refreshing...');
        }
      } catch (error) {
        if (!error.isHandled) {
          setSuccessMessage('Failed to upload resume.');
        }
        console.error("Resume upload error:", error);
      } finally {
        setIsUploadingResume(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  };

  const handleFileSelection = (inputId) => {
    document.getElementById(inputId).click();
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Dec 2024';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  const steps = [
    { id: 1, label: "Personal Information", icon: User },
    { id: 2, label: "Education", icon: GraduationCap },
    { id: 3, label: "Professional Experience", icon: Briefcase },
    { id: 4, label: "Additional Info", icon: Globe },
  ];

  return (
    <AuthGuard allowedRoles={['Recruiter']}>
      {isLoadingProfile ? (
        <div className="min-h-screen flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-neo-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-mono text-gray-500 dark:text-gray-400">Loading profile...</p>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-neo-bg dark:bg-zinc-950">
          <ProfileCompletionBanner />
          <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">

            {successMessage && (
              <div className="fixed top-24 right-4 z-50 animate-in slide-in-from-right-5">
                <div className="bg-neo-green border-2 border-neo-black dark:border-white px-6 py-3 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff]">
                  <p className="text-white font-bold">{successMessage}</p>
                </div>
              </div>
            )}

            <div className="md:w-1/3">
              <NeoCard className="sticky top-24 text-center border-4">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full border-4 border-neo-black dark:border-white overflow-hidden bg-gray-200 dark:bg-zinc-800 relative flex items-center justify-center">
                    {isUploadingProfilePic ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neo-black dark:border-white"></div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">Uploading...</span>
                      </div>
                    ) : (
                      <img
                        src={user?.profilePicture || user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Recruiter";
                        }}
                      />
                    )}
                  </div>
                  {isEditing && !isUploadingProfilePic && (
                    <button
                      onClick={() => handleFileSelection('profile-pic-input')}
                      className="absolute bottom-0 right-0 bg-white dark:bg-zinc-800 border-2 border-neo-black dark:border-white p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors shadow-neo-sm z-10"
                      title="Change Profile Picture"
                    >
                      <Camera className="w-4 h-4 text-neo-black dark:text-white" />
                    </button>
                  )}
                  <input type="file" id="profile-pic-input" className="hidden" accept="image/*" onChange={handleProfilePicUpload} disabled={!isEditing || isUploadingProfilePic} />
                </div>
                <h2 className="text-2xl font-black uppercase dark:text-white">{formData.fullName}</h2>
                <p className="font-mono text-gray-500 dark:text-gray-400 mb-2">{formData.headline || ''}</p>

                <div className="flex justify-center items-center gap-2 mb-6 text-sm text-gray-500 dark:text-gray-400 font-bold">
                  <MapPin className="w-4 h-4" /> {formData.currentCity}, {formData.country}
                </div>

                <div className="flex flex-col items-center gap-2">
                  <NeoBadge variant="pink"><span className="text-xs uppercase font-bold">RECRUITER</span></NeoBadge>

                  {user?.currentPlan && (
                    <div className="bg-neo-blue/10 text-neo-blue dark:text-blue-400 text-[10px] px-2.5 py-0.5 border border-neo-blue/20 rounded-full flex items-center gap-1.5 uppercase font-black shadow-sm">
                      <Crown className="w-3.5 h-3.5" />
                      {user.currentPlan.name} Plan
                    </div>
                  )}
                </div>

                <div className="mt-8 text-left">
                  <h4 className="font-bold text-xs uppercase text-gray-400 dark:text-gray-500 mb-3 tracking-widest">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills?.slice(0, 4).map((skill, i) => (
                      <span key={i} className="text-xs border border-neo-black dark:border-white px-2 py-1 bg-white dark:bg-zinc-800 dark:text-white rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-none">{skill}</span>
                    )) || <span className="text-xs text-gray-400">No skills added</span>}
                  </div>
                </div>

                <div className="mt-8 border-t-2 border-gray-100 dark:border-zinc-700 pt-6 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Member Since</span>
                    <span className="font-bold dark:text-white uppercase">{formatMemberSince(formData.createdAt)}</span>
                  </div>
                  {/*
                  <div>
                    <span className="block text-xs text-gray-400 dark:text-gray-500 font-bold uppercase">Hires</span>
                    <span className="font-bold dark:text-white">{formData.totalHires} Total</span>
                  </div>
                  */}
                </div>
              </NeoCard>
            </div>

            <div className="md:w-2/3">
              <div className="mb-6 flex justify-end gap-3">
                {!isEditing ? (
                  <NeoButton variant="black" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </NeoButton>
                ) : (
                  <>
                    <NeoButton onClick={cancelEdit} variant="secondary">
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </NeoButton>
                    <NeoButton onClick={saveProfile} className="bg-neo-green text-white" disabled={isSaving}>
                      <Save className="w-4 h-4 mr-2" /> {isSaving ? 'Saving...' : 'Save Changes'}
                    </NeoButton>
                  </>
                )}
              </div>

              <div className="mb-8">
                <div className="hidden md:flex justify-between items-center relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-zinc-700 -z-10"></div>
                  {steps.map((step) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setActiveStep(step.id)}
                        className="flex flex-col items-center group"
                      >
                        <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center text-lg font-bold transition-all z-10 
                                ${isActive ? 'bg-neo-blue border-neo-black dark:border-white text-white scale-110 shadow-neo-sm' :
                            isCompleted ? 'bg-neo-green border-neo-black dark:border-white text-white' :
                              'bg-white dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-400'}`}>
                          {isCompleted ? '✓' : step.id}
                        </div>
                        <span className={`mt-2 text-xs font-bold uppercase tracking-wide bg-white dark:bg-black px-1 
                                ${isActive ? 'text-neo-blue' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <NeoCard className="min-h-[600px] flex flex-col border-4">
                <h3 className="text-2xl font-black uppercase mb-1 dark:text-white">{steps[activeStep - 1].label}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mb-6 border-b-2 border-gray-100 dark:border-zinc-700 pb-4">
                  {isEditing ? 'Fill in your recruiter details.' : 'Your recruitment profile.'}
                </p>

                <div className="flex-grow space-y-6">
                  {activeStep === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <DisplayField isEditing={isEditing} label="Full Name" value={formData.fullName} name="fullName" onChange={handleInputChange} maxLength={FIELD_LIMITS.fullName} />
                      <DisplayField isEditing={isEditing} label="Headline" value={formData.headline} name="headline" onChange={handleInputChange} maxLength={FIELD_LIMITS.headline} />
                      <DisplayField isEditing={isEditing} label="About You" value={formData.about} name="about" onChange={handleInputChange} isTextarea={true} placeholder="Recruiter bio..." maxLength={FIELD_LIMITS.about} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DisplayField isEditing={isEditing} label="Phone Number" value={formData.phone} name="phone" onChange={handleInputChange} placeholder="10 Digit Number" maxLength={FIELD_LIMITS.phone} />
                        <DisplayField isEditing={isEditing} label="Date of Birth" value={formData.dateOfBirth} name="dateOfBirth" type="date" onChange={handleInputChange} maxDate={new Date().toISOString().split('T')[0]} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-sm mb-1 dark:text-white">Gender</label>
                          {isEditing ? (
                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neo-blue h-[46px] dark:text-white">
                              <option value="">Select...</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                            </select>
                          ) : (
                            <span className="font-bold dark:text-white text-lg">{formData.gender || 'Not specified'}</span>
                          )}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                        <label className="block font-bold text-sm mb-3 uppercase text-gray-400 dark:text-gray-500 tracking-widest font-mono">Location Details</label>
                        <div className="space-y-4">
                          <DisplayField isEditing={isEditing} label="Area / Locality" value={formData.area} name="area" onChange={handleInputChange} maxLength={FIELD_LIMITS.area} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DisplayField isEditing={isEditing} label="City" value={formData.currentCity} name="currentCity" onChange={handleInputChange} maxLength={FIELD_LIMITS.currentCity} />
                            <DisplayField isEditing={isEditing} label="State" value={formData.state} name="state" onChange={handleInputChange} maxLength={FIELD_LIMITS.state} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DisplayField isEditing={isEditing} label="Country" value={formData.country} name="country" onChange={handleInputChange} maxLength={FIELD_LIMITS.country} />
                            <DisplayField isEditing={isEditing} label="Zip Code" value={formData.zipCode} name="zipCode" onChange={handleInputChange} maxLength={FIELD_LIMITS.zipCode} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="space-y-4">
                        {['tenth', 'juniorCollege', 'graduation', 'postGraduation', 'phd'].map((level) => (
                          <details key={level} className="group border-2 border-neo-black dark:border-white bg-white dark:bg-zinc-900 open:bg-gray-50 dark:open:bg-zinc-800 transition-colors">
                            <summary className="flex cursor-pointer items-center justify-between p-4 font-bold select-none dark:text-white uppercase">
                              {level.replace(/([A-Z])/g, ' $1').trim()} Education
                              <span className="text-xl group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <div className="p-4 border-t-2 border-neo-black dark:border-white grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block font-bold text-xs mb-1 dark:text-white">{level.includes('tenth') ? 'School Name' : 'College/University Name'}</label>
                                <NeoInput
                                  value={formData.education[level]?.[level.includes('tenth') ? 'schoolName' : 'collegeName'] || ''}
                                  onChange={(e) => handleEducationChange(level, level.includes('tenth') ? 'schoolName' : 'collegeName', e.target.value)}
                                  disabled={!isEditing}
                                  maxLength={FIELD_LIMITS.schoolName}
                                />
                              </div>
                              {level.includes('tenth') || level.includes('juniorCollege') ? (
                                <div>
                                  <label className="block font-bold text-xs mb-1 dark:text-white">Board</label>
                                  {isEditing ? (
                                    <select
                                      value={formData.education[level]?.board || ''}
                                      onChange={(e) => handleEducationChange(level, 'board', e.target.value)}
                                      className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-2 font-mono text-sm dark:text-white focus:outline-none"
                                    >
                                      <option value="">Select...</option>
                                      <option value="CBSE">CBSE</option>
                                      <option value="ICSE">ICSE</option>
                                      <option value="State Board">State Board</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  ) : <span className="font-bold dark:text-white block">{formData.education[level]?.board || 'Not specified'}</span>}
                                </div>
                              ) : (
                                <div>
                                  <label className="block font-bold text-xs mb-1 dark:text-white">University</label>
                                  <NeoInput
                                    value={formData.education[level]?.university || ''}
                                    onChange={(e) => handleEducationChange(level, 'university', e.target.value)}
                                    disabled={!isEditing}
                                    maxLength={FIELD_LIMITS.university}
                                  />
                                </div>
                              )}

                              {level === 'juniorCollege' && (
                                <div>
                                  <label className="block font-bold text-xs mb-1 dark:text-white">Stream</label>
                                  {isEditing ? (
                                    <select
                                      value={formData.education[level]?.stream || ''}
                                      onChange={(e) => handleEducationChange(level, 'stream', e.target.value)}
                                      className="w-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-2 font-mono text-sm dark:text-white focus:outline-none"
                                    >
                                      <option value="">Select...</option>
                                      <option value="Science">Science</option>
                                      <option value="Commerce">Commerce</option>
                                      <option value="Arts">Arts</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  ) : <span className="font-bold dark:text-white block">{formData.education[level]?.stream || 'Not specified'}</span>}
                                </div>
                              )}

                              {['graduation', 'postGraduation'].includes(level) && (
                                <>
                                  <div>
                                    <label className="block font-bold text-xs mb-1 dark:text-white">Degree</label>
                                    <NeoInput
                                      value={formData.education[level]?.degree || ''}
                                      onChange={(e) => handleEducationChange(level, 'degree', e.target.value)}
                                      disabled={!isEditing}
                                      maxLength={FIELD_LIMITS.degree}
                                    />
                                  </div>
                                  <div>
                                    <label className="block font-bold text-xs mb-1 dark:text-white">Specialization</label>
                                    <NeoInput
                                      value={formData.education[level]?.specialization || ''}
                                      onChange={(e) => handleEducationChange(level, 'specialization', e.target.value)}
                                      disabled={!isEditing}
                                      maxLength={FIELD_LIMITS.specialization}
                                    />
                                  </div>
                                </>
                              )}

                              {level === 'phd' && (
                                <>
                                  <div className="md:col-span-2">
                                    <label className="block font-bold text-xs mb-1 dark:text-white">Field of Study</label>
                                    <NeoInput
                                      value={formData.education[level]?.fieldOfStudy || ''}
                                      onChange={(e) => handleEducationChange(level, 'fieldOfStudy', e.target.value)}
                                      disabled={!isEditing}
                                      maxLength={FIELD_LIMITS.fieldOfStudy}
                                    />
                                  </div>
                                  <div className="md:col-span-2">
                                    <label className="block font-bold text-xs mb-1 dark:text-white">Thesis Title</label>
                                    <NeoInput
                                      value={formData.education[level]?.thesisTitle || ''}
                                      onChange={(e) => handleEducationChange(level, 'thesisTitle', e.target.value)}
                                      disabled={!isEditing}
                                      maxLength={FIELD_LIMITS.thesisTitle}
                                    />
                                  </div>
                                </>
                              )}

                              <div>
                                <label className="block font-bold text-xs mb-1 dark:text-white">Percentage / CGPA</label>
                                <NeoInput
                                  type="number"
                                  value={formData.education[level]?.percentage || formData.education[level]?.cgpa || ''}
                                  onChange={(e) => handleEducationChange(level, level.includes('graduation') && !level.includes('tenth') ? 'cgpa' : 'percentage', e.target.value)}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <label className="block font-bold text-xs mb-1 dark:text-white">Grade</label>
                                <select
                                  value={formData.education[level]?.grade || ''}
                                  onChange={(e) => handleEducationChange(level, 'grade', e.target.value)}
                                  disabled={!isEditing}
                                  className="w-full bg-white dark:bg-zinc-900 border-2 border-black p-2 font-mono text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-neo-blue"
                                >
                                  <option value="">Select Grade</option>
                                  {['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F'].map(g => (
                                    <option key={g} value={g}>{g}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block font-bold text-xs mb-1 dark:text-white">Year</label>
                                <NeoInput
                                  type="number"
                                  value={formData.education[level]?.passingYear || formData.education[level]?.year || ''}
                                  onChange={(e) => handleEducationChange(level, level === 'phd' ? 'year' : 'passingYear', e.target.value)}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block font-bold text-xs mb-1 dark:text-white">City</label>
                                  <NeoInput
                                    value={formData.education[level]?.city || ''}
                                    onChange={(e) => handleEducationChange(level, 'city', e.target.value)}
                                    disabled={!isEditing}
                                    maxLength={FIELD_LIMITS.currentCity}
                                  />
                                </div>
                                <div>
                                  <label className="block font-bold text-xs mb-1 dark:text-white">State</label>
                                  <NeoInput
                                    value={formData.education[level]?.state || ''}
                                    onChange={(e) => handleEducationChange(level, 'state', e.target.value)}
                                    disabled={!isEditing}
                                    maxLength={FIELD_LIMITS.state}
                                  />
                                </div>
                              </div>
                            </div>
                          </details>
                        ))}
                      </div>

                      {/* Languages & Certifications added for Recruiter */}
                      <div className="pt-6 border-t mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <label className="font-black text-sm uppercase dark:text-white">Languages Known</label>
                          {isEditing && (
                            <NeoButton size="sm" onClick={addLanguage} variant="secondary" className="h-8 text-xs">
                              <Plus className="w-3 h-3 mr-1" /> Add Language
                            </NeoButton>
                          )}
                        </div>

                        {formData.languages.length === 0 ? (
                          <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 rounded-sm">
                            <span className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase">No languages added</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3">
                            {formData.languages.map((l, i) => (
                              <div key={i} className="flex gap-2 items-center bg-gray-50 dark:bg-zinc-900 border-2 border-black dark:border-white p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                <NeoInput
                                  placeholder="Language (e.g. English)"
                                  value={l.language}
                                  onChange={(e) => handleLanguageChange(i, 'language', e.target.value)}
                                  disabled={!isEditing}
                                  maxLength={FIELD_LIMITS.language}
                                  className="flex-grow border-0 focus:ring-0 bg-transparent"
                                />
                                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
                                <select
                                  className="bg-transparent font-bold text-sm focus:outline-none dark:text-white cursor-pointer"
                                  value={l.proficiency}
                                  onChange={(e) => handleLanguageChange(i, 'proficiency', e.target.value)}
                                  disabled={!isEditing}
                                >
                                  <option value="Beginner">Beginner</option>
                                  <option value="Intermediate">Intermediate</option>
                                  <option value="Advanced">Advanced</option>
                                  <option value="Native">Native</option>
                                </select>
                                {isEditing && (
                                  <button onClick={() => removeLanguage(i)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t mt-6">
                        <div className="flex justify-between items-center mb-4">
                          <label className="font-black text-sm uppercase dark:text-white">Certifications</label>
                          {isEditing && (
                            <NeoButton size="sm" onClick={addCertification} variant="secondary" className="h-8 text-xs">
                              <Plus className="w-3 h-3 mr-1" /> Add Certificate
                            </NeoButton>
                          )}
                        </div>

                        {formData.certifications.length === 0 ? (
                          <div className="text-center p-4 border-2 border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 rounded-sm">
                            <span className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase">No certifications added</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {formData.certifications.map((c, i) => (
                              <div key={i} className="border-2 border-black dark:border-white p-4 bg-white dark:bg-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] relative">
                                {isEditing && (
                                  <button
                                    onClick={() => removeCertification(i)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-600 p-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                                <span className="absolute -top-3 left-3 bg-neo-blue text-white px-2 py-0.5 text-[10px] font-black uppercase border-2 border-black">Certificate #{i + 1}</span>

                                <div className="grid md:grid-cols-2 gap-3 mt-1">
                                  <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Name</label>
                                    <NeoInput placeholder="ex. HR Management" value={c.name} onChange={(e) => handleCertificationChange(i, 'name', e.target.value)} disabled={!isEditing} />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Issuing Org</label>
                                    <NeoInput placeholder="ex. SHRM" value={c.issuingOrganization} onChange={(e) => handleCertificationChange(i, 'issuingOrganization', e.target.value)} disabled={!isEditing} />
                                  </div>
                                  <div>
                                    <NeoDatePicker
                                      label="Issue Date"
                                      value={c.issueDate}
                                      onChange={(e) => handleCertificationChange(i, 'issueDate', e.target.value)}
                                      disabled={!isEditing}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-500 mb-1 block">Credential URL</label>
                                    <NeoInput placeholder="https://..." value={c.credentialURL} onChange={(e) => handleCertificationChange(i, 'credentialURL', e.target.value)} disabled={!isEditing} />
                                  </div>
                                  <div>
                                    <NeoDatePicker
                                      label="Expiry Date (Optional)"
                                      value={c.expiryDate}
                                      onChange={(e) => handleCertificationChange(i, 'expiryDate', e.target.value)}
                                      disabled={!isEditing}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  )}

                  {activeStep === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-800/50 border-2 border-neo-black dark:border-white shadow-neo-sm mb-6">
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row gap-6">
                            <NeoRadio
                              checked={formData.isFresher}
                              onChange={() => setFormData(p => ({ ...p, isFresher: true, experienceYears: 0 }))}
                              label="I am a Fresher"
                            />
                            <NeoRadio
                              checked={!formData.isFresher}
                              onChange={() => setFormData(p => ({
                                ...p,
                                isFresher: false,
                                experienceYears: p.experienceYears === 0 ? (user?.experienceYears || 0) : p.experienceYears
                              }))}
                              label="I have Work Experience"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full border-2 border-black ${formData.isFresher ? 'bg-neo-green' : 'bg-neo-blue'}`}></div>
                            <span className={`font-bold uppercase text-sm tracking-tight ${formData.isFresher ? 'text-neo-green' : 'text-neo-blue dark:text-blue-400'}`}>
                              {formData.isFresher ? 'I AM A FRESHER' : 'I HAVE WORK EXPERIENCE'}
                            </span>
                          </div>
                        )}
                      </div>

                      {!formData.isFresher && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DisplayField isEditing={isEditing} label="Experience Years" value={formData.experienceYears} name="experienceYears" type="number" onChange={handleInputChange} />
                            <DisplayField isEditing={isEditing} label="Total Hires" value={formData.totalHires} name="totalHires" type="number" onChange={handleInputChange} />
                            <DisplayField isEditing={isEditing} label="Current Role" value={formData.currentRole} name="currentRole" onChange={handleInputChange} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DisplayField isEditing={isEditing} label="Current Employer" value={formData.currentEmployer} name="currentEmployer" onChange={handleInputChange} />
                            <DisplayField isEditing={isEditing} label="Company URL" value={formData.companyURL} name="companyURL" onChange={handleInputChange} />
                          </div>
                          <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold uppercase text-sm dark:text-white font-mono">Detailed Work Experience</h4>
                              {isEditing && (
                                <NeoButton variant="secondary" className="text-xs py-1 px-3" onClick={addWorkExperience}>
                                  + Add Role
                                </NeoButton>
                              )}
                            </div>

                            {formData.workExperience?.length > 0 ? (
                              formData.workExperience.map((exp, idx) => (
                                <div key={idx} className="border-2 border-neo-black dark:border-white p-4 relative bg-white dark:bg-zinc-900 shadow-neo-sm mb-4">
                                  {isEditing && (
                                    <button
                                      onClick={() => removeWorkExperience(idx)}
                                      className="absolute top-2 right-2 text-red-500 font-bold text-xs hover:underline uppercase"
                                    >
                                      Remove
                                    </button>
                                  )}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Job Title</label>
                                      <NeoInput
                                        placeholder="e.g. Senior Recruiter"
                                        value={exp.jobTitle || ''}
                                        onChange={(e) => handleWorkExperienceChange(idx, 'jobTitle', e.target.value)}
                                        disabled={!isEditing}
                                        maxLength={FIELD_LIMITS.jobTitle}
                                      />
                                    </div>
                                    <div>
                                      <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Company</label>
                                      <NeoInput
                                        placeholder="Company Name"
                                        value={exp.company || ''}
                                        onChange={(e) => handleWorkExperienceChange(idx, 'company', e.target.value)}
                                        disabled={!isEditing}
                                        maxLength={FIELD_LIMITS.company}
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <label className="block font-bold text-xs mb-1 dark:text-white uppercase">Start Date</label>
                                      <NeoInput
                                        type="date"
                                        value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                                        onChange={(e) => handleWorkExperienceChange(idx, 'startDate', e.target.value)}
                                        disabled={!isEditing}
                                      />
                                    </div>
                                    {!exp.currentlyWorking && (
                                      <div>
                                        <label className="block font-bold text-xs mb-1 dark:text-white uppercase">End Date</label>
                                        <NeoInput
                                          type="date"
                                          value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                                          onChange={(e) => handleWorkExperienceChange(idx, 'endDate', e.target.value)}
                                          disabled={!isEditing}
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <NeoCheckbox
                                      checked={exp.currentlyWorking}
                                      onCheckedChange={(checked) => handleWorkExperienceChange(idx, 'currentlyWorking', checked)}
                                      disabled={!isEditing}
                                      id={`current-${idx}`}
                                      label="Current Job"
                                    />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-sm font-mono italic">No detailed experience added.</p>
                            )}
                          </div>
                        </>
                      )}

                      {/* Hide all professional fields for freshers */}
                      {formData.isFresher && (
                        <div className="text-center text-neo-green font-bold py-4">No professional experience required for freshers.</div>
                      )}
                    </div>
                  )}

                  {activeStep === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                      <div className="space-y-4">
                        <h4 className="font-bold uppercase text-sm dark:text-white font-mono">Skills & Preferences</h4>
                        <div>
                          <label className="block font-bold text-sm mb-1 dark:text-white">Skills (comma separated)</label>
                          {isEditing ? (
                            <NeoInput
                              name="skills"
                              value={formData.skillsString || formData.skills.join(', ')}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData(p => ({
                                  ...p,
                                  skillsString: val,
                                  skills: val.split(',').map(s => s.trim()).filter(s => s !== '')
                                }));
                              }}
                              maxLength={FIELD_LIMITS.skills}
                            />
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {formData.skills.map((s, i) => <NeoBadge key={i} variant="blue">{s}</NeoBadge>)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-zinc-700">
                        <div className="space-y-4">
                          <label className="block font-bold text-sm uppercase text-gray-400 font-mono">Web Presence</label>
                          <DisplayField isEditing={isEditing} label="LinkedIn" value={formData.linkedinUrl || formData.socials.linkedin} name="linkedinUrl" onChange={handleInputChange} maxLength={FIELD_LIMITS.linkedinUrl} />
                          <DisplayField isEditing={isEditing} label="Portfolio" value={formData.portfolioUrl} name="portfolioUrl" onChange={handleInputChange} maxLength={FIELD_LIMITS.portfolioUrl} />
                          <DisplayField isEditing={isEditing} label="Github" value={formData.githubUrl} name="githubUrl" onChange={handleInputChange} maxLength={FIELD_LIMITS.githubUrl} />
                        </div>
                        <div className="space-y-4">
                          <label className="block font-bold text-sm uppercase text-gray-400 font-mono">Recruitment Preferences</label>
                          <DisplayField
                            isEditing={isEditing}
                            label="Industries"
                            value={formData.industriesString || formData.preferences?.industries?.join(', ')}
                            name="industriesString"
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(p => ({
                                ...p,
                                industriesString: val,
                                preferences: { ...p.preferences, industries: val.split(',').map(s => s.trim()).filter(s => s !== '') }
                              }));
                            }}
                            maxLength={FIELD_LIMITS.industries}
                          />
                          <DisplayField
                            isEditing={isEditing}
                            label="Job Types"
                            value={formData.jobTypesString || formData.preferences?.jobTypes?.join(', ')}
                            name="jobTypesString"
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData(p => ({
                                ...p,
                                jobTypesString: val,
                                preferences: { ...p.preferences, jobTypes: val.split(',').map(s => s.trim()).filter(s => s !== '') }
                              }));
                            }}
                            maxLength={FIELD_LIMITS.jobTypes}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-zinc-700">
                        <label className="block font-bold text-sm mb-1 dark:text-white">Resume / Profile Document</label>
                        <div
                          className={`p-4 border-2 border-dashed ${formData.resumeFileURL ? 'border-neo-green bg-neo-green/10' : 'border-gray-300 dark:border-zinc-700'} flex items-center justify-between transition-colors rounded-lg ${isEditing && !isUploadingResume ? 'cursor-pointer hover:border-neo-black dark:hover:border-white' : ''}`}
                          onClick={() => isEditing && !isUploadingResume && handleFileSelection('resume-upload-input')}
                        >
                          <div className="flex flex-col gap-1 w-full relative">
                            {isUploadingResume ? (
                              <div className="flex items-center gap-2 justify-center py-2">
                                <div className="w-4 h-4 border-2 border-neo-black border-t-transparent rounded-full animate-spin"></div>
                                <span className="font-bold text-gray-500">Uploading...</span>
                              </div>
                            ) : formData.resumeFileURL ? (
                              <div className="flex flex-col items-center gap-3">
                                <span className="font-bold text-neo-black dark:text-white block">Resume Uploaded Successfully!</span>

                                <a
                                  href={formData.resumeFileURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-neo-black text-white text-xs font-bold uppercase border-2 border-transparent hover:border-neo-black hover:bg-white hover:text-neo-black transition-all z-20"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Resume
                                </a>

                                {isEditing && <span className="text-xs text-gray-500 block mt-1 text-center">Click area to replace</span>}
                              </div>
                            ) : (
                              <span className="font-bold text-gray-500 dark:text-gray-400 text-center block">
                                {isEditing ? 'Click to upload resume' : 'No file uploaded'}
                              </span>
                            )}
                          </div>
                          <input type="file" id="resume-upload-input" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={isUploadingResume} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-gray-100 dark:border-zinc-700 flex justify-between">
                  {activeStep > 1 ? (
                    <NeoButton onClick={prevStep} variant="secondary">Previous</NeoButton>
                  ) : <div />}
                  {activeStep < 4 ? (
                    <NeoButton onClick={nextStep} variant="black">Next</NeoButton>
                  ) : <div />}
                </div>
              </NeoCard>
            </div>
          </div>
        </div>
      )}
    </AuthGuard>
  );
}
