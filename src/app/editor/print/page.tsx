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
    <div id="print-root" className="w-full bg-white flex justify-center items-start print:block print:p-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: A4;
          margin: 0;
        }

        /* Masquer TOUT sauf le CV lors de l'impression */
        @media print {
          html, body, main {
            width: 210mm !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: block !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Force le conteneur principal à être en bloc sans flexbox */
          #print-root {
            display: block !important;
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Ajuster la hauteur et le padding du conteneur du CV pour l'impression A4 */
          #print-cv-wrapper {
            width: 210mm !important;
            margin: 0 !important;
            padding: 0 !important;
            display: block !important;
          }

          #print-cv-wrapper > div {
            padding-bottom: 12mm !important;
            min-height: 297mm !important;
            height: auto !important;
            box-sizing: border-box !important;
          }

          /* Éviter les coupures de page en plein milieu d'une section ou d'un élément */
          .break-inside-avoid,
          h1, h2, h3, h4, p, li, img,
          .mb-6, .mb-4,
          .space-y-4 > div,
          .space-y-3 > div,
          .space-y-2\\.5 > div {
            break-inside: avoid-page !important;
            page-break-inside: avoid !important;
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
      <div id="print-cv-wrapper" className="w-[210mm] bg-white print:shadow-none print:block print:w-[210mm] print:mx-0 print:my-0">
        <CVPreview cvData={cvData} showExamples={false} />
      </div>
    </div>
  );
}
