export type CVData = {
  themeColor?: string;
  personal: {
    firstName: string;
    lastName: string;
    name: string;
    jobTitle: string;
    email: string;
    phone: string;
    address: string;
    summary: string;
    photo?: string;
    includePhoto: boolean;
    dateOfBirth?: string;
    nationality?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
    youtube?: string;
    whatsapp?: string;
    linkedin?: string;
    indeed?: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  languages: Array<{
    id: string;
    name: string;
    level: string;
  }>;
  projects?: Array<{
    id: string;
    title: string;
    date: string;
    description: string;
  }>;
  certificates?: Array<{
    id: string;
    title: string;
    image: string; // Base64 or URL
    showOnCV?: boolean; // True to display on CV, false to hide it (intention to show via QR later)
  }>;
  interests?: string[];
};

export const defaultCVData: CVData = {
  themeColor: "#6366f1",
  personal: {
    firstName: "",
    lastName: "",
    name: "",
    dateOfBirth: "",
    nationality: "",
    jobTitle: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    includePhoto: false,
    linkedin: "",
    website: "",
    facebook: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
    indeed: "",
  },
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certificates: [],
  interests: [],
};
