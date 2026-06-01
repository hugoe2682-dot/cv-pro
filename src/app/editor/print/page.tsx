"use client";

import { useEffect, useState } from "react";
import CVPreview from "@/components/CVPreview";
import { CVData, defaultCVData } from "@/types/cv";
import LoadingScreen from "@/components/LoadingScreen";

export default function PrintPage() {
  const [cvData, setCvData] = useState<CVData | null>(null);

  useEffect(() => {
    // Retrieve the most up-to-date printed CV data
    const localData = localStorage.getItem("cvDataPrint") || localStorage.getItem("cvData");
    if (localData) {
      try {
        setCvData(JSON.parse(localData));
      } catch (e) {
        console.error("Error parsing cvData", e);
        setCvData(defaultCVData);
      }
    } else {
      setCvData(defaultCVData);
    }
  }, []);

  useEffect(() => {
    if (cvData) {
      // Let standard rendering finish, then trigger print
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cvData]);

  if (!cvData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingScreen message="Génération du format PDF..." />
      </div>
    );
  }

  return (
    <div className="w-full bg-white flex justify-center items-start print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4;
          margin: 0;
        }

        /* Masquer TOUT sauf le CV lors de l'impression */
        @media print {
          html, body {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Cacher la navbar et tout ce qui n'est pas le CV */
          nav,
          header,
          footer,
          .no-print,
          [data-print-hide] {
            display: none !important;
          }
        }

        /* En mode écran sur cette page, fond blanc propre */
        body {
          background: white !important;
        }
      `}} />
      <div className="w-[210mm] bg-white print:shadow-none">
        <CVPreview cvData={cvData} showExamples={false} />
      </div>
    </div>
  );
}
