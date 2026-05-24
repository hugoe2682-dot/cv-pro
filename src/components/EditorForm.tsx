"use client";
import React, { useState } from "react";

import { CVData } from "@/types/cv";
import { User, Briefcase, Code, ImagePlus, Trash2, GraduationCap, Plus, X, Globe, Folder, Award, Heart } from "lucide-react";

import GlobalSpellingAssistant from "./GlobalSpellingAssistant";

interface EditorFormProps {
  cvData: CVData;
  setCvData: React.Dispatch<React.SetStateAction<CVData>>;
}

export default function EditorForm({ cvData, setCvData }: EditorFormProps) {
  const [interestInput, setInterestInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() !== "") {
      // Remove empty strings that might have been default
      const currentSkills = cvData.skills.filter(s => s.trim() !== "");
      setCvData({
        ...cvData,
        skills: [...currentSkills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = [...cvData.skills];
    newSkills.splice(index, 1);
    setCvData({
      ...cvData,
      skills: newSkills
    });
  };

  const addInterest = () => {
    if (interestInput.trim() !== "") {
      setCvData({
        ...cvData,
        interests: [...(cvData.interests || []), interestInput.trim()]
      });
      setInterestInput("");
    }
  };

  const removeInterest = (index: number) => {
    const newInterests = [...(cvData.interests || [])];
    newInterests.splice(index, 1);
    setCvData({
      ...cvData,
      interests: newInterests
    });
  };

  const updatePersonal = (field: keyof CVData["personal"], value: string | boolean) => {
    setCvData({
      ...cvData,
      personal: { ...cvData.personal, [field]: value }
    });
  };

  const addEducation = () => {
    setCvData({
      ...cvData,
      education: [
        ...cvData.education,
        {
          id: Math.random().toString(36).substr(2, 9),
          degree: "",
          school: "",
          startDate: "",
          endDate: "",
        }
      ]
    });
  };

  const removeEducation = (id: string) => {
    setCvData({
      ...cvData,
      education: cvData.education.filter(edu => edu.id !== id)
    });
  };

  const addExperience = () => {
    setCvData({
      ...cvData,
      experience: [
        ...cvData.experience,
        {
          id: Math.random().toString(36).substr(2, 9),
          title: "",
          company: "",
          startDate: "",
          endDate: "",
          description: "",
        }
      ]
    });
  };

  const removeExperience = (id: string) => {
    setCvData({
      ...cvData,
      experience: cvData.experience.filter(exp => exp.id !== id)
    });
  };

  const addLanguage = () => {
    setCvData({
      ...cvData,
      languages: [
        ...(cvData.languages || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          name: "",
          level: "",
        }
      ]
    });
  };

  const removeLanguage = (id: string) => {
    setCvData({
      ...cvData,
      languages: (cvData.languages || []).filter(lang => lang.id !== id)
    });
  };

  const addProject = () => {
    setCvData({
      ...cvData,
      projects: [
        ...(cvData.projects || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          title: "",
          date: "",
          description: "",
        }
      ]
    });
  };

  const removeProject = (id: string) => {
    setCvData({
      ...cvData,
      projects: (cvData.projects || []).filter(p => p.id !== id)
    });
  };

  const addCertificate = () => {
    setCvData({
      ...cvData,
      certificates: [
        ...(cvData.certificates || []),
        {
          id: Math.random().toString(36).substr(2, 9),
          title: "",
          image: "",
          showOnCV: true,
        }
      ]
    });
  };

  const removeCertificate = (id: string) => {
    setCvData({
      ...cvData,
      certificates: (cvData.certificates || []).filter(c => c.id !== id)
    });
  };

  const formatFirstName = (val: string) => {
    let clean = val.replace(/[^a-zA-ZàâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]/g, '');
    if (clean.length > 0) {
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
    }
    return clean;
  };

  const formatLastName = (val: string) => {
    return val.toUpperCase().replace(/[^A-ZÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]/g, '');
  };

  const formatDate = (val: string) => {
    let clean = val.replace(/\D/g, "");
    clean = clean.slice(0, 8);
    
    let formatted = "";
    if (clean.length > 0) {
      let day = clean.slice(0, 2);
      if (day.length === 2) {
        if (parseInt(day) > 31) day = "31";
        if (parseInt(day) === 0) day = "01";
      }
      formatted += day;
    }
    if (clean.length > 2) {
      formatted += "/";
      let month = clean.slice(2, 4);
      if (month.length === 2) {
        if (parseInt(month) > 12) month = "12";
        if (parseInt(month) === 0) month = "01";
      }
      formatted += month;
    }
    if (clean.length > 4) {
      formatted += "/";
      formatted += clean.slice(4, 8);
    }
    return formatted;
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Informations Personnelles */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--color-primary)] border-b border-slate-200 dark:border-slate-800 pb-2">
          <User size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Informations Personnelles</h2>
        </div>

        {/* Photo Upload / QR Code Option */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex-1 space-y-1">
            <h3 className="font-medium text-slate-900 dark:text-white">Photo de profil</h3>
            <p className="text-xs text-slate-500">Ajoutez une photo ou générez un QR Code pour votre CV.</p>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={cvData.personal.includePhoto}
                  onChange={() => updatePersonal("includePhoto", true)}
                  className="accent-[var(--color-primary)]"
                />
                <span className="text-sm">Avec Photo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  checked={!cvData.personal.includePhoto}
                  onChange={() => updatePersonal("includePhoto", false)}
                  className="accent-[var(--color-primary)]"
                />
                <span className="text-sm">Sans Photo (QR Code)</span>
              </label>
            </div>
          </div>
          
          {cvData.personal.includePhoto && (
            <div className="flex items-center gap-3">
              {cvData.personal.photo ? (
                <div className="relative group">
                  <img src={cvData.personal.photo} alt="Profile" className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
                  <button 
                    onClick={() => updatePersonal("photo", "")}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                  <ImagePlus size={20} className="text-slate-400" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updatePersonal("photo", reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prénom</label>
            <input 
              type="text" 
              placeholder="ex: Jean"
              value={cvData.personal.firstName || ""}
              onChange={(e) => {
                const firstName = formatFirstName(e.target.value);
                setCvData({
                  ...cvData,
                  personal: { 
                    ...cvData.personal, 
                    firstName, 
                    name: `${firstName} ${cvData.personal.lastName}`.trim() 
                  }
                });
              }}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</label>
            <input 
              type="text" 
              placeholder="ex: DUPONT"
              value={cvData.personal.lastName || ""}
              onChange={(e) => {
                const lastName = formatLastName(e.target.value);
                setCvData({
                  ...cvData,
                  personal: { 
                    ...cvData.personal, 
                    lastName, 
                    name: `${cvData.personal.firstName} ${lastName}`.trim() 
                  }
                });
              }}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date de naissance</label>
            <input 
              type="text" 
              placeholder="ex: 01/01/1998"
              value={cvData.personal.dateOfBirth || ""}
              onChange={(e) => updatePersonal("dateOfBirth", formatDate(e.target.value))}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nationalité</label>
            <input 
              type="text" 
              placeholder="ex: Française"
              value={cvData.personal.nationality || ""}
              onChange={(e) => updatePersonal("nationality", e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Titre / Poste</label>
            <input 
              type="text" 
              placeholder="ex: Développeur Web"
              value={cvData.personal.jobTitle}
              onChange={(e) => updatePersonal("jobTitle", e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</label>
            <input 
              type="email" 
              placeholder="ex: jean.dupont@email.com"
              value={cvData.personal.email}
              onChange={(e) => updatePersonal("email", e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Téléphone</label>
            <input 
              type="text" 
              placeholder="ex: +33 6 12 34 56 78"
              value={cvData.personal.phone}
              onChange={(e) => updatePersonal("phone", e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Adresse</label>
            <input 
              type="text" 
              placeholder="ex: Paris, France"
              value={cvData.personal.address}
              onChange={(e) => updatePersonal("address", e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
            />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Profil / Résumé</label>
            <textarea 
              rows={4}
              placeholder="Décrivez brièvement votre parcours et vos objectifs..."
              value={cvData.personal.summary}
              onChange={(e) => updatePersonal("summary", e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all resize-none"
            />
          </div>

          {/* Réseaux sociaux & Liens */}
          <div className="space-y-1 sm:col-span-2 mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Réseaux sociaux et liens (Facultatif)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">LinkedIn</label>
                <input 
                  type="text" 
                  value={cvData.personal.linkedin || ""}
                  onChange={(e) => updatePersonal("linkedin", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  placeholder="ex: linkedin.com/in/votreprofil"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Site Web</label>
                <input 
                  type="text" 
                  value={cvData.personal.website || ""}
                  onChange={(e) => updatePersonal("website", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  placeholder="ex: www.votresite.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Facebook</label>
                <input 
                  type="text" 
                  value={cvData.personal.facebook || ""}
                  onChange={(e) => updatePersonal("facebook", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  placeholder="ex: facebook.com/votreprofil"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Instagram</label>
                <input 
                  type="text" 
                  value={cvData.personal.instagram || ""}
                  onChange={(e) => updatePersonal("instagram", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  placeholder="ex: instagram.com/votreprofil"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">YouTube</label>
                <input 
                  type="text" 
                  value={cvData.personal.youtube || ""}
                  onChange={(e) => updatePersonal("youtube", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  placeholder="ex: youtube.com/c/votrechaine"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">WhatsApp</label>
                <input 
                  type="text" 
                  value={cvData.personal.whatsapp || ""}
                  onChange={(e) => updatePersonal("whatsapp", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  placeholder="ex: +33 6 12 34 56 78"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Indeed</label>
                <input 
                  type="text" 
                  value={cvData.personal.indeed || ""}
                  onChange={(e) => updatePersonal("indeed", e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-all"
                  placeholder="ex: indeed.com/votreprofil"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <GraduationCap size={20} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Études et formations</h2>
          </div>
          <button
            onClick={addEducation}
            className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        {cvData.education.map((edu, index) => (
          <div key={edu.id} className="relative p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 mt-2">
            <button
              onClick={() => removeEducation(edu.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <X size={16} />
            </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <input 
                type="text" 
                placeholder="Nom du diplôme"
                value={edu.degree}
                onChange={(e) => {
                  const newEdu = [...cvData.education];
                  newEdu[index].degree = e.target.value;
                  setCvData({...cvData, education: newEdu});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input 
                type="text" 
                placeholder="Institut / École / Université"
                value={edu.school}
                onChange={(e) => {
                  const newEdu = [...cvData.education];
                  newEdu[index].school = e.target.value;
                  setCvData({...cvData, education: newEdu});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input 
                type="text" 
                placeholder="Début (JJ/MM/AAAA)"
                value={edu.startDate}
                onChange={(e) => {
                  const newEdu = [...cvData.education];
                  newEdu[index].startDate = formatDate(e.target.value);
                  setCvData({...cvData, education: newEdu});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input 
                type="text" 
                placeholder="Fin (JJ/MM/AAAA)"
                value={edu.endDate}
                onChange={(e) => {
                  const newEdu = [...cvData.education];
                  newEdu[index].endDate = formatDate(e.target.value);
                  setCvData({...cvData, education: newEdu});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        ))}
      </section>

      {/* Expériences */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Briefcase size={20} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Expériences</h2>
          </div>
          <button
            onClick={addExperience}
            className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        {cvData.experience.map((exp, index) => (
          <div key={exp.id} className="relative p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 mt-2">
            <button
              onClick={() => removeExperience(exp.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <X size={16} />
            </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <input 
                type="text" 
                placeholder="Poste"
                value={exp.title}
                onChange={(e) => {
                  const newExp = [...cvData.experience];
                  newExp[index].title = e.target.value;
                  setCvData({...cvData, experience: newExp});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input 
                type="text" 
                placeholder="Entreprise"
                value={exp.company}
                onChange={(e) => {
                  const newExp = [...cvData.experience];
                  newExp[index].company = e.target.value;
                  setCvData({...cvData, experience: newExp});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input 
                type="text" 
                placeholder="Début (JJ/MM/AAAA)"
                value={exp.startDate}
                onChange={(e) => {
                  const newExp = [...cvData.experience];
                  newExp[index].startDate = formatDate(e.target.value);
                  setCvData({...cvData, experience: newExp});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input 
                type="text" 
                placeholder="Fin (JJ/MM/AAAA)"
                value={exp.endDate}
                onChange={(e) => {
                  const newExp = [...cvData.experience];
                  newExp[index].endDate = formatDate(e.target.value);
                  setCvData({...cvData, experience: newExp});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <textarea 
              rows={3}
              placeholder="Description des missions..."
              value={exp.description}
              onChange={(e) => {
                const newExp = [...cvData.experience];
                newExp[index].description = e.target.value;
                setCvData({...cvData, experience: newExp});
              }}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none resize-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        ))}
      </section>

      {/* Compétences */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--color-primary)] border-b border-slate-200 dark:border-slate-800 pb-2">
          <Code size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Compétences</h2>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Ex: React, Next.js, Gestion de projet"
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          />
          <button 
            onClick={addSkill}
            className="px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        
        {(cvData.skills && cvData.skills.length > 0 && cvData.skills[0] !== "") && (
          <div className="flex flex-wrap gap-2 mt-3">
            {cvData.skills.filter(s => s.trim() !== "").map((skill, index) => (
              <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300">
                <span>{skill}</span>
                <button 
                  onClick={() => removeSkill(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Langues */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Globe size={20} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Langues</h2>
          </div>
          <button
            onClick={addLanguage}
            className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        {(cvData.languages || []).map((lang, index) => (
          <div key={lang.id} className="relative p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 mt-2">
            <button
              onClick={() => removeLanguage(lang.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <X size={16} />
            </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <input 
                type="text" 
                placeholder="Langue (ex: Anglais)"
                value={lang.name}
                onChange={(e) => {
                  const newLanguages = [...(cvData.languages || [])];
                  newLanguages[index].name = e.target.value;
                  setCvData({...cvData, languages: newLanguages});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <select
                value={lang.level}
                onChange={(e) => {
                  const newLanguages = [...(cvData.languages || [])];
                  newLanguages[index].level = e.target.value;
                  setCvData({...cvData, languages: newLanguages});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Sélectionner un niveau</option>
                <option value="Langue maternelle">Langue maternelle</option>
                <option value="A1 (débutant)">A1 (débutant)</option>
                <option value="A2 (élémentaire)">A2 (élémentaire)</option>
                <option value="B1 (intermédiaire)">B1 (intermédiaire)</option>
                <option value="B2 (intermédiaire avancé)">B2 (intermédiaire avancé)</option>
                <option value="C1 (avancé)">C1 (avancé)</option>
                <option value="C2 (maîtrise)">C2 (maîtrise)</option>
              </select>
            </div>
          </div>
        ))}
      </section>

      {/* Projets */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Folder size={20} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Projets (Facultatif)</h2>
          </div>
          <button
            onClick={addProject}
            className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        {(cvData.projects || []).map((project, index) => (
          <div key={project.id} className="relative p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 mt-2">
            <button
              onClick={() => removeProject(project.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <X size={16} />
            </button>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <input 
                type="text" 
                placeholder="Titre du projet"
                value={project.title}
                onChange={(e) => {
                  const newProjects = [...(cvData.projects || [])];
                  newProjects[index].title = e.target.value;
                  setCvData({...cvData, projects: newProjects});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input 
                type="text" 
                placeholder="Date (ex: 2023 ou JJ/MM/AAAA)"
                value={project.date}
                onChange={(e) => {
                  const newProjects = [...(cvData.projects || [])];
                  newProjects[index].date = e.target.value;
                  setCvData({...cvData, projects: newProjects});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <textarea 
              rows={2}
              placeholder="Petite description du projet..."
              value={project.description}
              onChange={(e) => {
                const newProjects = [...(cvData.projects || [])];
                newProjects[index].description = e.target.value;
                setCvData({...cvData, projects: newProjects});
              }}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none resize-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        ))}
      </section>

      {/* Certificats */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <Award size={20} />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Certificats (Facultatif)</h2>
          </div>
          <button
            onClick={addCertificate}
            className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        {(cvData.certificates || []).map((cert, index) => (
          <div key={cert.id} className="relative p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 mt-2">
            <button
              onClick={() => removeCertificate(cert.id)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors p-1"
            >
              <X size={16} />
            </button>
            <div className="pt-2 space-y-3">
              <input 
                type="text" 
                placeholder="Titre du certificat"
                value={cert.title}
                onChange={(e) => {
                  const newCerts = [...(cvData.certificates || [])];
                  newCerts[index].title = e.target.value;
                  setCvData({...cvData, certificates: newCerts});
                }}
                className="w-full px-3 py-1.5 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <div className="flex flex-col gap-3">
                {cert.image ? (
                  <div className="flex flex-col gap-2">
                    <div className="relative group self-start">
                      <img src={cert.image} alt="Certificat" className="h-16 w-auto object-contain border border-slate-200 rounded bg-white" />
                      <button 
                        onClick={() => {
                          const newCerts = [...(cvData.certificates || [])];
                          newCerts[index].image = "";
                          setCvData({...cvData, certificates: newCerts});
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={cert.showOnCV !== false}
                          onChange={() => {
                            const newCerts = [...(cvData.certificates || [])];
                            newCerts[index].showOnCV = true;
                            setCvData({...cvData, certificates: newCerts});
                          }}
                          className="accent-[var(--color-primary)]"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">Sur le CV</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          checked={cert.showOnCV === false}
                          onChange={() => {
                            const newCerts = [...(cvData.certificates || [])];
                            newCerts[index].showOnCV = false;
                            setCvData({...cvData, certificates: newCerts});
                          }}
                          className="accent-[var(--color-primary)]"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">Via QR Code</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex items-center justify-center px-4 py-2 text-sm bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded cursor-pointer hover:border-[var(--color-primary)] transition-colors">
                    <ImagePlus size={16} className="text-slate-400 mr-2" />
                    <span className="text-slate-500">Ajouter l'image du certificat</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const newCerts = [...(cvData.certificates || [])];
                            newCerts[index].image = reader.result as string;
                            setCvData({...cvData, certificates: newCerts});
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Centres d'intérêt */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--color-primary)] border-b border-slate-200 dark:border-slate-800 pb-2">
          <Heart size={20} />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Centres d'intérêt (Facultatif)</h2>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addInterest();
              }
            }}
            placeholder="Ex: Sports, Lecture, Voyages"
            className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
          />
          <button 
            onClick={addInterest}
            className="px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus size={16} />
            Ajouter
          </button>
        </div>
        
        {(cvData.interests && cvData.interests.length > 0) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {cvData.interests.map((interest, index) => (
              <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300">
                <span>{interest}</span>
                <button 
                  onClick={() => removeInterest(index)}
                  className="text-slate-400 hover:text-red-500 transition-colors ml-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Correction globale */}
      <GlobalSpellingAssistant
        cvData={cvData}
        onApplyAllCorrections={(correctedData) => setCvData(correctedData)}
      />
    </div>
  );
}
