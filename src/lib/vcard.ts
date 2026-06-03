import { CVData } from "@/types/cv";

export function generateVCard(cvData: CVData, showExamples: boolean = false) {
  const MOCK_DATA = {
    name: "ex: JEAN DUPONT",
    jobTitle: "ex: Développeur Web",
    email: "ex: jean.dupont@email.com",
    phone: "ex: +33 6 12 34 56 78",
    address: "ex: Paris, France",
    summary: "Décrivez brièvement votre parcours et vos objectifs...",
    dateOfBirth: "ex: 01/01/1998",
    nationality: "ex: Française",
    website: "ex: www.votresite.com",
    linkedin: "ex: linkedin.com/in/votreprofil",
    education: [
      { degree: "Nom du diplôme", school: "Institut / École / Université", startDate: "Début", endDate: "Fin" },
    ],
    experience: [
      { title: "Poste", company: "Entreprise", startDate: "Début", endDate: "Fin", description: "Description des missions..." },
    ],
    skills: ["Ex: React", "Next.js", "TypeScript"],
    languages: [
      { name: "Langue (ex: Anglais)", level: "Niveau" },
    ]
  };

  const getVal = (val: string | undefined, mock: string) => {
    if (val && val.trim() !== "") return { value: val, isMock: false };
    return { value: showExamples ? mock : "", isMock: true };
  };

  const name = getVal(cvData.personal.name, MOCK_DATA.name);
  const jobTitle = getVal(cvData.personal.jobTitle, MOCK_DATA.jobTitle);
  const dob = getVal(cvData.personal.dateOfBirth, MOCK_DATA.dateOfBirth);
  const email = getVal(cvData.personal.email, MOCK_DATA.email);
  const phone = getVal(cvData.personal.phone, MOCK_DATA.phone);
  const address = getVal(cvData.personal.address, MOCK_DATA.address);
  const website = getVal(cvData.personal.website, MOCK_DATA.website);
  const linkedin = getVal(cvData.personal.linkedin, MOCK_DATA.linkedin);
  const summary = getVal(cvData.personal.summary, MOCK_DATA.summary);

  const hasEducation = cvData.education && cvData.education.length > 0;
  const education = hasEducation ? cvData.education : (showExamples ? MOCK_DATA.education : []);

  const hasExperience = cvData.experience && cvData.experience.length > 0;
  const experience = hasExperience ? cvData.experience : (showExamples ? MOCK_DATA.experience : []);

  const hasSkills = cvData.skills && cvData.skills.length > 0 && cvData.skills[0] !== "";
  const skills = hasSkills ? cvData.skills : (showExamples ? MOCK_DATA.skills : []);

  const hasLanguages = cvData.languages && cvData.languages.length > 0;
  const languages = hasLanguages ? cvData.languages : (showExamples ? MOCK_DATA.languages : []);

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
    const cleanNote = note.replace(/\n/g, " ");
    vcard += `\nNOTE:${cleanNote}`;
  }
  
  if (linkedin.value && !linkedin.isMock) vcard += `\nURL;type=LinkedIn:${linkedin.value}`;
  if (website.value && !website.isMock) vcard += `\nURL;type=Website:${website.value}`;
  
  vcard += `\nEND:VCARD`;
  return vcard;
}
