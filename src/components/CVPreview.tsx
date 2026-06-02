import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Calendar, Globe, MessageCircle, Link as LinkIcon, Briefcase, Users, Camera, Video } from "lucide-react";
import QRCode from "react-qr-code";

const MOCK_DATA = {
  name: "ex: JEAN DUPONT",
  jobTitle: "ex: Développeur Web",
  email: "ex: jean.dupont@email.com",
  phone: "ex: +33 6 12 34 56 78",
  address: "ex: Paris, France",
  summary: "Décrivez brièvement votre parcours et vos objectifs...",
  dateOfBirth: "ex: 01/01/1998",
  nationality: "ex: Française",
  whatsapp: "ex: +33 6 12 34 56 78",
  facebook: "ex: facebook.com/votreprofil",
  youtube: "ex: youtube.com/c/votrechaine",
  indeed: "ex: indeed.com/votreprofil",
  linkedin: "ex: linkedin.com/in/votreprofil",
  website: "ex: www.votresite.com",
  instagram: "ex: instagram.com/votreprofil",
  education: [
    { id: 'm1', degree: "Nom du diplôme", school: "Institut / École / Université", startDate: "Début", endDate: "Fin" },
  ],
  experience: [
    { id: 'm1', title: "Poste", company: "Entreprise", startDate: "Début", endDate: "Fin", description: "Description des missions..." },
  ],
  skills: ["Ex: React", "Next.js", "TypeScript"],
  languages: [
    { id: 'm1', name: "Langue (ex: Anglais)", level: "Niveau" },
  ],
  projects: [
    { id: 'm1', title: "Titre du projet", date: "Date", description: "Petite description du projet..." }
  ],
  certificates: [
    { id: 'm1', title: "Titre du certificat", image: "" }
  ],
  interests: ["Sports", "Lecture", "Voyages"]
};

export default function CVPreview({ cvData, showExamples, cvId, isPublicView }: { cvData: CVData, showExamples?: boolean, cvId?: string | null, isPublicView?: boolean }) {
  const primaryColor = cvData.themeColor || "#6366f1";

  const getVal = (val: string | undefined, mock: string) => {
    if (val && val.trim() !== "") return { value: val, isMock: false };
    return { value: showExamples ? mock : "", isMock: true };
  };

  const hasEducation = cvData.education.length > 0;
  const education = hasEducation ? cvData.education : (showExamples ? MOCK_DATA.education : []);
  
  const hasExperience = cvData.experience.length > 0;
  const experience = hasExperience ? cvData.experience : (showExamples ? MOCK_DATA.experience : []);
  
  const hasSkills = cvData.skills.length > 0 && cvData.skills[0] !== "";
  const skills = hasSkills ? cvData.skills : (showExamples ? MOCK_DATA.skills : []);
  
  const hasLanguages = cvData.languages && cvData.languages.length > 0;
  const languages = hasLanguages ? cvData.languages : (showExamples ? MOCK_DATA.languages : []);

  const hasProjects = cvData.projects && cvData.projects.length > 0;
  const projects = hasProjects ? (cvData.projects || []) : (showExamples ? MOCK_DATA.projects : []);

  const hasCertificates = cvData.certificates && cvData.certificates.length > 0;
  const certificates = hasCertificates ? (cvData.certificates || []) : (showExamples ? MOCK_DATA.certificates : []);

  const hasInterests = cvData.interests && cvData.interests.length > 0 && cvData.interests[0] !== "";
  const interests = hasInterests ? (cvData.interests || []) : (showExamples ? MOCK_DATA.interests : []);

  const name = getVal(cvData.personal.name, MOCK_DATA.name);
  const jobTitle = getVal(cvData.personal.jobTitle, MOCK_DATA.jobTitle);
  const dob = getVal(cvData.personal.dateOfBirth, MOCK_DATA.dateOfBirth);
  const nationality = getVal(cvData.personal.nationality, MOCK_DATA.nationality);
  const email = getVal(cvData.personal.email, MOCK_DATA.email);
  const phone = getVal(cvData.personal.phone, MOCK_DATA.phone);
  const address = getVal(cvData.personal.address, MOCK_DATA.address);
  const whatsapp = getVal(cvData.personal.whatsapp, MOCK_DATA.whatsapp);
  const facebook = getVal(cvData.personal.facebook, MOCK_DATA.facebook);
  const youtube = getVal(cvData.personal.youtube, MOCK_DATA.youtube);
  const indeed = getVal(cvData.personal.indeed, MOCK_DATA.indeed);
  const linkedin = getVal(cvData.personal.linkedin, MOCK_DATA.linkedin);
  const website = getVal(cvData.personal.website, MOCK_DATA.website);
  const instagram = getVal(cvData.personal.instagram, MOCK_DATA.instagram);
  const summary = getVal(cvData.personal.summary, MOCK_DATA.summary);

  const mockStyle = "opacity-40 italic font-light";

  const generateVCard = () => {
    let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${name.value}\nFN:${name.value}\nTITLE:${jobTitle.value}\nBDAY:${dob.value.replace(/\//g, "-")}\nEMAIL:${email.value}\nTEL:${phone.value}\nADR:;;${address.value}`;
    
    let note = "";
    if (summary.value) note += `Profil: ${summary.value}\\n\\n`;
    
    if (education.length > 0) {
      note += `Formations:\\n`;
      education.forEach((edu: any) => {
        note += `- ${edu.degree || 'Diplôme'} (${edu.startDate || ''}-${edu.endDate || ''}) @ ${edu.school || ''}\\n`;
      });
      note += `\\n`;
    }
    
    if (experience.length > 0) {
      note += `Expériences:\\n`;
      experience.forEach((exp: any) => {
        note += `- ${exp.title || 'Poste'} (${exp.startDate || ''}-${exp.endDate || ''}) @ ${exp.company || ''}\\n`;
      });
      note += `\\n`;
    }

    if (skills.length > 0) {
      note += `Compétences: ${skills.join(", ")}\\n\\n`;
    }

    if (languages.length > 0) {
      note += `Langues:\\n`;
      languages.forEach((lang: any) => {
        note += `- ${lang.name || ''} (${lang.level || ''})\\n`;
      });
      note += `\\n`;
    }

    if (note) {
      // Nettoyer les vrais sauts de ligne dans le résumé pour éviter de casser le vCard
      const cleanNote = note.replace(/\n/g, " ");
      vcard += `\nNOTE:${cleanNote}`;
    }
    
    if (linkedin.value && !linkedin.isMock) vcard += `\nURL;type=LinkedIn:${linkedin.value}`;
    if (website.value && !website.isMock) vcard += `\nURL;type=Website:${website.value}`;
    
    vcard += `\nEND:VCARD`;
    return vcard;
  };

  const generateQRCodeContent = () => {
    // Return vCard directly to ensure the QR code updates visually in real-time as the user types/modifies/corrects information
    return generateVCard();
  };

  return (
    <div 
      style={{ "--color-primary": primaryColor } as React.CSSProperties}
      className="w-full min-h-[297mm] bg-white text-slate-800 p-10 print:p-8 flex flex-col font-sans overflow-visible relative pb-20 print:pb-20"
    >
      {/* Header */}
      <div className="border-b-2 border-[var(--color-primary)] pb-6 mb-6 flex justify-between items-start gap-6">
        <div className="flex-1">
          {name.value && (
            <h1 className={`text-4xl font-bold uppercase tracking-wider ${name.isMock ? mockStyle + " text-slate-400" : "text-slate-900"}`}>
              {name.value}
            </h1>
          )}
          {jobTitle.value && (
            <h2 className={`text-xl font-medium mt-1 ${jobTitle.isMock ? mockStyle + " text-slate-400" : "text-[var(--color-primary)]"}`}>
              {jobTitle.value}
            </h2>
          )}
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-sm text-slate-600">
            {(dob.value || nationality.value) && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={dob.isMock ? mockStyle : ""}>{dob.value}</span>
                {dob.value && nationality.value && <span className="mx-0.5 opacity-30">|</span>}
                {nationality.value && <Globe size={14} className="text-[var(--color-primary)] opacity-70" />}
                <span className={nationality.isMock ? mockStyle : ""}>{nationality.value}</span>
              </div>
            )}
            
            {email.value && (
              <div className="flex items-center gap-1.5">
                <Mail size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={email.isMock ? mockStyle : ""}>{email.value}</span>
              </div>
            )}
            
            {phone.value && (
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={phone.isMock ? mockStyle : ""}>{phone.value}</span>
              </div>
            )}

            {whatsapp.value && (
              <div className="flex items-center gap-1.5">
                <MessageCircle size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={whatsapp.isMock ? mockStyle : ""}>{whatsapp.value}</span>
              </div>
            )}
            
            {address.value && (
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <MapPin size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={address.isMock ? mockStyle : ""}>{address.value}</span>
              </div>
            )}

            {facebook.value && (
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={facebook.isMock ? mockStyle : ""}>{facebook.value}</span>
              </div>
            )}
            {youtube.value && (
              <div className="flex items-center gap-1.5">
                <Video size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={youtube.isMock ? mockStyle : ""}>{youtube.value}</span>
              </div>
            )}
            {indeed.value && (
              <div className="flex items-center gap-1.5">
                <LinkIcon size={14} className="text-[var(--color-primary)] opacity-70" />
                <span className={indeed.isMock ? mockStyle : ""}>{indeed.value}</span>
              </div>
            )}
          </div>

          {/* Other Links (LinkedIn, Website, etc.) */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
            {linkedin.value && (
              <div className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-[var(--color-primary)] opacity-70" />
                {linkedin.isMock ? (
                  <span className={mockStyle}>{linkedin.value}</span>
                ) : (
                  <a href={linkedin.value.startsWith('http') ? linkedin.value : `https://${linkedin.value}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)] hover:underline">
                    {linkedin.value.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                )}
              </div>
            )}
            {website.value && (
              <div className="flex items-center gap-1.5">
                <Globe size={14} className="text-[var(--color-primary)] opacity-70" />
                {website.isMock ? (
                  <span className={mockStyle}>{website.value}</span>
                ) : (
                  <a href={website.value.startsWith('http') ? website.value : `https://${website.value}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)] hover:underline">
                    {website.value.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                )}
              </div>
            )}
            {instagram.value && (
              <div className="flex items-center gap-1.5">
                <Camera size={14} className="text-[var(--color-primary)] opacity-70" />
                {instagram.isMock ? (
                  <span className={mockStyle}>{instagram.value}</span>
                ) : (
                  <a href={instagram.value.startsWith('http') ? instagram.value : `https://${instagram.value}`} target="_blank" rel="noreferrer" className="hover:text-[var(--color-primary)] hover:underline">
                    {instagram.value.replace(/(^\w+:|^)\/\//, '')}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Photo & QR Code Container */}
        <div className="flex-shrink-0 flex items-center gap-4">
          {/* Photo (if enabled and present) */}
          {cvData.personal.includePhoto && cvData.personal.photo && (
            <img 
              src={cvData.personal.photo} 
              alt="Profile" 
              className="w-28 h-28 rounded-xl object-cover border-2 border-slate-100 shadow-sm"
            />
          )}

          {/* QR Code (Only displayed in header if there is no profile photo) */}
          {(!cvData.personal.includePhoto || !cvData.personal.photo) && (
            <div className={`w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center ${name.isMock ? "opacity-40 grayscale" : ""}`}>
              <QRCode 
                value={generateQRCodeContent()}
                size={96}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 96 96`}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-8 flex-1">
        {/* Colonne Principale */}
        <div className="w-2/3 pr-4">
          {summary.value && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-3">Profil</h3>
              <p className={`text-sm leading-relaxed ${summary.isMock ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
                {summary.value}
              </p>
            </div>
          )}

          {education.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Études et Formations</h3>
              <div className="space-y-6">
                {education.map((edu: any, idx: number) => (
                  <div key={edu.id || idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-bold ${!hasEducation ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                        {edu.degree || "Nom du diplôme"}
                      </h4>
                      <span 
                        style={hasEducation ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                        className={`text-xs font-medium px-2 py-0.5 rounded ${!hasEducation ? mockStyle + " text-slate-400" : ""}`}
                      >
                        {edu.startDate || "Début"} - {edu.endDate || "Fin"}
                      </span>
                    </div>
                    <div className={`text-sm font-medium mb-2 ${!hasEducation ? mockStyle + " text-slate-400" : "text-slate-600"}`}>
                      {edu.school || "Institut / École / Université"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {experience.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Expérience Professionnelle</h3>
              <div className="space-y-6">
                {experience.map((exp: any, idx: number) => (
                  <div key={exp.id || idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-bold ${!hasExperience ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                        {exp.title || "Poste"}
                      </h4>
                      <span 
                        style={hasExperience ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                        className={`text-xs font-medium px-2 py-0.5 rounded ${!hasExperience ? mockStyle + " text-slate-400" : ""}`}
                      >
                        {exp.startDate || "Début"} - {exp.endDate || (hasExperience ? "En cours" : "Fin")}
                      </span>
                    </div>
                    <div className={`text-sm font-medium mb-2 ${!hasExperience ? mockStyle + " text-slate-400" : "text-slate-600"}`}>
                      {exp.company || "Entreprise"}
                    </div>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!hasExperience ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
                      {exp.description || "Description des missions..."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Projets</h3>
              <div className="space-y-6">
                {projects.map((project: any, idx: number) => (
                  <div key={project.id || idx}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className={`font-bold ${!hasProjects ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                        {project.title || "Titre du projet"}
                      </h4>
                      <span 
                        style={hasProjects ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                        className={`text-xs font-medium px-2 py-0.5 rounded ${!hasProjects ? mockStyle + " text-slate-400" : ""}`}
                      >
                        {project.date || "Date"}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${!hasProjects ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
                      {project.description || "Petite description du projet..."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Colonne Latérale */}
        <div className="w-1/3 flex flex-col">
          {skills.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Compétences</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string, index: number) => (
                  <span key={index} className={`px-2.5 py-1 bg-slate-100 text-xs font-medium rounded-md ${!hasSkills ? mockStyle + " text-slate-400 bg-slate-50 border border-slate-200" : "text-slate-700"}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Langues</h3>
              <div className="space-y-3">
                {languages.map((lang: any, idx: number) => (
                  <div key={lang.id || idx} className="flex items-center gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <span className={`font-medium ${!hasLanguages ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                      {lang.name || "Langue"}
                    </span>
                    <span 
                      style={hasLanguages ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                      className={`text-xs font-medium px-2 py-0.5 rounded ${!hasLanguages ? mockStyle + " text-slate-400" : ""}`}
                    >
                      {lang.level || "Niveau"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Certificats</h3>
              <div className="space-y-4">
                {certificates.map((cert: any, idx: number) => (
                  <div key={cert.id || idx} className="flex flex-col gap-2">
                    <span className={`font-medium text-sm ${!hasCertificates ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                      {cert.title || "Titre du certificat"}
                    </span>
                    {cert.image && (cert.showOnCV !== false || isPublicView) && (
                      <img src={cert.image} alt="Certificat" className={`w-full rounded border border-slate-200 ${!hasCertificates ? "opacity-40 grayscale" : ""}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {interests.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Centres d'intérêt</h3>
              <p className={`text-sm leading-relaxed ${!hasInterests ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
                {interests.join(" ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code at the bottom-right of all pages (only when a photo is added/present) */}
      {cvData.personal.includePhoto && cvData.personal.photo && (
        <div className={`print:fixed absolute bottom-4 right-4 w-20 h-20 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center ${name.isMock ? "opacity-40 grayscale" : ""} z-50`}>
          <QRCode 
            value={generateQRCodeContent()}
            size={72}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 72 72`}
          />
        </div>
      )}
    </div>
  );
}
