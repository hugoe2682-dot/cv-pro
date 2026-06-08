import { CVData } from "@/types/cv";
import { Mail, Phone, MapPin, Calendar, Globe, MessageCircle, Link as LinkIcon, Briefcase, Users, Camera, Video } from "lucide-react";
import QRCode from "react-qr-code";
import { generateVCard } from "@/lib/vcard";

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

  const generateQRCodeContent = () => {
    return generateVCard(cvData, showExamples);
  };

  const renderSummary = () => {
    if (!summary.value) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-3">Profil</h3>
        <p className={`text-xs leading-relaxed ${summary.isMock ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
          {summary.value}
        </p>
      </div>
    );
  };

  const renderEducation = () => {
    if (education.length === 0) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Études et Formations</h3>
        <div className="space-y-4">
          {education.map((edu: any, idx: number) => (
            <div key={edu.id || idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className={`text-xs font-bold ${!hasEducation ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                  {edu.degree || "Nom du diplôme"}
                </h4>
                <span 
                  style={hasEducation ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${!hasEducation ? mockStyle + " text-slate-400" : ""}`}
                >
                  {edu.startDate || "Début"} - {edu.endDate || "Fin"}
                </span>
              </div>
              <div className={`text-xs font-medium mb-1 ${!hasEducation ? mockStyle + " text-slate-400" : "text-slate-600"}`}>
                {edu.school || "Institut / École / Université"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExperience = () => {
    if (experience.length === 0) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Expérience Professionnelle</h3>
        <div className="space-y-4">
          {experience.map((exp: any, idx: number) => (
            <div key={exp.id || idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className={`text-xs font-bold ${!hasExperience ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                  {exp.title || "Poste"}
                </h4>
                <span 
                  style={hasExperience ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${!hasExperience ? mockStyle + " text-slate-400" : ""}`}
                >
                  {exp.startDate || "Début"} - {exp.endDate || (hasExperience ? "En cours" : "Fin")}
                </span>
              </div>
              <div className={`text-xs font-medium mb-1 ${!hasExperience ? mockStyle + " text-slate-400" : "text-slate-600"}`}>
                {exp.company || "Entreprise"}
              </div>
              <p className={`text-xs leading-relaxed whitespace-pre-wrap ${!hasExperience ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
                {exp.description || "Description des missions..."}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (projects.length === 0) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Projets</h3>
        <div className="space-y-4">
          {projects.map((project: any, idx: number) => (
            <div key={project.id || idx} className="break-inside-avoid">
              <div className="flex justify-between items-baseline mb-0.5">
                <h4 className={`text-xs font-bold ${!hasProjects ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                  {project.title || "Titre du projet"}
                </h4>
                <span 
                  style={hasProjects ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${!hasProjects ? mockStyle + " text-slate-400" : ""}`}
                >
                  {project.date || "Date"}
                </span>
              </div>
              <p className={`text-xs leading-relaxed whitespace-pre-wrap ${!hasProjects ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
                {project.description || "Petite description du projet..."}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (skills.length === 0) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Compétences</h3>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill: string, index: number) => (
            <span key={index} className={`px-2.5 py-1 bg-slate-100 text-[10px] font-medium rounded ${!hasSkills ? mockStyle + " text-slate-400 bg-slate-50 border border-slate-200" : "text-slate-700"}`}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderLanguages = () => {
    if (languages.length === 0) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Langues</h3>
        <div className="space-y-2.5">
          {languages.map((lang: any, idx: number) => (
            <div key={lang.id || idx} className="flex items-center justify-between text-xs border-b border-slate-100 pb-1 last:border-0 last:pb-0">
              <span className={`font-medium ${!hasLanguages ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                {lang.name || "Langue"}
              </span>
              <span 
                style={hasLanguages ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : {}}
                className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${!hasLanguages ? mockStyle + " text-slate-400" : ""}`}
              >
                {lang.level || "Niveau"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertificates = () => {
    if (certificates.length === 0) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Certificats</h3>
        <div className="space-y-3">
          {certificates.map((cert: any, idx: number) => (
            <div key={cert.id || idx} className="flex flex-col gap-1.5 break-inside-avoid">
              <span className={`font-medium text-xs ${!hasCertificates ? mockStyle + " text-slate-400" : "text-slate-800"}`}>
                {cert.title || "Titre du certificat"}
              </span>
              {cert.image && (cert.showOnCV !== false || isPublicView) && (
                <img src={cert.image} alt="Certificat" className={`w-full rounded border border-slate-200 max-h-28 object-cover ${!hasCertificates ? "opacity-40 grayscale" : ""}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInterests = () => {
    if (interests.length === 0) return null;
    return (
      <div className="mb-6 break-inside-avoid">
        <h3 className="text-md font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-1 mb-4">Centres d'intérêt</h3>
        <div className="flex flex-wrap gap-1.5">
          {interests.map((interest: string, index: number) => (
            <span key={index} className={`px-2 py-0.5 bg-slate-50 text-[10px] font-medium rounded border border-slate-100 ${!hasInterests ? mockStyle + " text-slate-400" : "text-slate-700"}`}>
              {interest}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderContactListInline = () => {
    return (
      <>
        {(dob.value || nationality.value) && (
          <span className="flex items-center gap-1.5">
            <span className={dob.isMock ? mockStyle : ""}>{dob.value}</span>
            {dob.value && nationality.value && <span className="opacity-30">|</span>}
            <span className={nationality.isMock ? mockStyle : ""}>{nationality.value}</span>
          </span>
        )}
        {email.value && <span className={email.isMock ? mockStyle : ""}>• {email.value}</span>}
        {phone.value && <span className={phone.isMock ? mockStyle : ""}>• {phone.value}</span>}
        {whatsapp.value && <span className={whatsapp.isMock ? mockStyle : ""}>• WhatsApp: {whatsapp.value}</span>}
        {address.value && <span className={address.isMock ? mockStyle : ""}>• {address.value}</span>}
        {linkedin.value && <span className={linkedin.isMock ? mockStyle : ""}>• LinkedIn: {linkedin.value}</span>}
        {website.value && <span className={website.isMock ? mockStyle : ""}>• {website.value}</span>}
      </>
    );
  };

  const renderContactListInlinePlain = () => {
    return (
      <>
        {dob.value && <span className={dob.isMock ? mockStyle : ""}>{dob.value}</span>}
        {nationality.value && <span className={nationality.isMock ? mockStyle : ""}>• {nationality.value}</span>}
        {email.value && <span className={email.isMock ? mockStyle : ""}>• {email.value}</span>}
        {phone.value && <span className={phone.isMock ? mockStyle : ""}>• {phone.value}</span>}
        {address.value && <span className={address.isMock ? mockStyle : ""}>• {address.value}</span>}
      </>
    );
  };

  const renderContactListVertical = () => {
    return (
      <div className="space-y-2">
        {dob.value && (
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={dob.isMock ? mockStyle : ""}>{dob.value}</span>
          </div>
        )}
        {nationality.value && (
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={nationality.isMock ? mockStyle : ""}>{nationality.value}</span>
          </div>
        )}
        {email.value && (
          <div className="flex items-center gap-1.5">
            <Mail size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={`break-all ${email.isMock ? mockStyle : ""}`}>{email.value}</span>
          </div>
        )}
        {phone.value && (
          <div className="flex items-center gap-1.5">
            <Phone size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={phone.isMock ? mockStyle : ""}>{phone.value}</span>
          </div>
        )}
        {whatsapp.value && (
          <div className="flex items-center gap-1.5">
            <MessageCircle size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={whatsapp.isMock ? mockStyle : ""}>{whatsapp.value}</span>
          </div>
        )}
        {address.value && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={address.isMock ? mockStyle : ""}>{address.value}</span>
          </div>
        )}
        {linkedin.value && (
          <div className="flex items-center gap-1.5">
            <Briefcase size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={`break-all ${linkedin.isMock ? mockStyle : ""}`}>{linkedin.value}</span>
          </div>
        )}
        {website.value && (
          <div className="flex items-center gap-1.5">
            <Globe size={12} className="text-[var(--color-primary)] opacity-70" />
            <span className={`break-all ${website.isMock ? mockStyle : ""}`}>{website.value}</span>
          </div>
        )}
      </div>
    );
  };

  const renderHeaderClassic = () => {
    return (
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
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-600">
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

          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-600">
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

        <div className="flex-shrink-0 flex items-center gap-4">
          {cvData.personal.includePhoto && cvData.personal.photo && (
            <img 
              src={cvData.personal.photo} 
              alt="Profile" 
              className="w-28 h-28 rounded-xl object-cover border-2 border-slate-100 shadow-sm"
            />
          )}

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
    );
  };

  const renderClassic = () => {
    return (
      <div className="flex flex-col flex-1">
        {renderHeaderClassic()}
        <div className="flex gap-8 flex-1">
          <div className="w-2/3 pr-4">
            {renderSummary()}
            {renderEducation()}
            {renderExperience()}
            {renderProjects()}
          </div>
          <div className="w-1/3 flex flex-col">
            {renderSkills()}
            {renderLanguages()}
            {renderCertificates()}
            {renderInterests()}
          </div>
        </div>
      </div>
    );
  };

  const renderModern = () => {
    return (
      <div className="flex flex-col flex-1">
        <div className="border-b-4 border-[var(--color-primary)] pb-6 mb-6 flex flex-col items-center text-center relative">
          {cvData.personal.includePhoto && cvData.personal.photo && (
            <img 
              src={cvData.personal.photo} 
              alt="Profile" 
              className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 shadow-md mb-4"
            />
          )}
          {name.value && (
            <h1 className={`text-4xl font-black uppercase tracking-wider ${name.isMock ? mockStyle + " text-slate-400" : "text-slate-900"}`}>
              {name.value}
            </h1>
          )}
          {jobTitle.value && (
            <h2 className={`text-xl font-bold mt-1 tracking-widest ${jobTitle.isMock ? mockStyle + " text-slate-400" : "text-[var(--color-primary)]"}`}>
              {jobTitle.value}
            </h2>
          )}
          
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-4 text-xs text-slate-600 max-w-2xl">
            {renderContactListInline()}
          </div>

          {(!cvData.personal.includePhoto || !cvData.personal.photo) && (
            <div className="absolute top-0 right-0 w-16 h-16 bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center justify-center">
              <QRCode 
                value={generateQRCodeContent()}
                size={60}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 60 60`}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {renderSummary()}
          {renderExperience()}
          {renderEducation()}
          {renderProjects()}
          
          <div className="grid grid-cols-2 gap-6 mt-2">
            <div>
              {renderSkills()}
              {renderLanguages()}
            </div>
            <div>
              {renderCertificates()}
              {renderInterests()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProfessional = () => {
    return (
      <div className="flex flex-1 -m-10 print:-m-8">
        <div className="w-1/3 bg-slate-50 dark:bg-slate-900/30 p-8 flex flex-col border-r border-slate-200 dark:border-slate-800">
          {cvData.personal.includePhoto && cvData.personal.photo && (
            <div className="flex justify-center mb-6">
              <img 
                src={cvData.personal.photo} 
                alt="Profile" 
                className="w-32 h-32 rounded-2xl object-cover border-4 border-white dark:border-slate-800 shadow-md"
              />
            </div>
          )}
          
          <div className="space-y-3 mb-8 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-1 mb-2">Contact</h4>
            {renderContactListVertical()}
          </div>

          {renderSkills()}
          {renderLanguages()}
          {renderInterests()}

          <div className="mt-auto pt-6 flex justify-center">
            <div className="bg-white p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <QRCode 
                value={generateQRCodeContent()}
                size={80}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 80 80`}
              />
            </div>
          </div>
        </div>

        <div className="w-2/3 p-8 flex flex-col">
          <div className="border-b-2 border-[var(--color-primary)] pb-4 mb-6">
            {name.value && (
              <h1 className={`text-3xl font-black uppercase tracking-wider ${name.isMock ? mockStyle + " text-slate-400" : "text-slate-900 dark:text-white"}`}>
                {name.value}
              </h1>
            )}
            {jobTitle.value && (
              <h2 className={`text-lg font-bold mt-1 ${jobTitle.isMock ? mockStyle + " text-slate-400" : "text-[var(--color-primary)]"}`}>
                {jobTitle.value}
              </h2>
            )}
          </div>

          {renderSummary()}
          {renderExperience()}
          {renderEducation()}
          {renderProjects()}
          {renderCertificates()}
        </div>
      </div>
    );
  };

  const renderMinimalist = () => {
    return (
      <div className="flex flex-col flex-1">
        <div className="border-b border-slate-200 pb-4 mb-6 flex justify-between items-end">
          <div>
            {name.value && (
              <h1 className={`text-2xl font-bold ${name.isMock ? mockStyle + " text-slate-400" : "text-slate-900"}`}>
                {name.value}
              </h1>
            )}
            {jobTitle.value && (
              <h2 className={`text-sm font-semibold tracking-wider uppercase mt-0.5 ${jobTitle.isMock ? mockStyle + " text-slate-400" : "text-[var(--color-primary)]"}`}>
                {jobTitle.value}
              </h2>
            )}
            <div className="flex flex-wrap gap-x-3 mt-2 text-[10px] text-slate-500">
              {renderContactListInlinePlain()}
            </div>
          </div>

          {cvData.personal.includePhoto && cvData.personal.photo && (
            <img 
              src={cvData.personal.photo} 
              alt="Profile" 
              className="w-16 h-16 rounded object-cover border border-slate-200"
            />
          )}
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {renderSummary()}
          {renderExperience()}
          {renderEducation()}
          {renderProjects()}
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            {renderSkills()}
            {renderLanguages()}
          </div>
          {renderCertificates()}
          {renderInterests()}
        </div>
      </div>
    );
  };

  return (
    <div 
      style={{ "--color-primary": primaryColor } as React.CSSProperties}
      className="w-full min-h-[297mm] bg-white text-slate-800 p-10 print:p-8 flex flex-col font-sans overflow-visible relative pb-20 print:pb-20"
    >
      {(() => {
        const layout = cvData.layout || "classic";
        switch (layout) {
          case "modern":
            return renderModern();
          case "professional":
            return renderProfessional();
          case "minimalist":
            return renderMinimalist();
          case "classic":
          default:
            return renderClassic();
        }
      })()}

      {cvData.layout !== "professional" && cvData.personal.includePhoto && cvData.personal.photo && (
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
