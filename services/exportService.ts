import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TabStopType, TabStopPosition, Header } from "docx";
import FileSaver from "file-saver";
import { OptimizeResponse } from "../types";

export const exportToDocx = async (cv: OptimizeResponse['optimizedCV']) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // --- HEADER ---
        new Paragraph({
          text: cv.personalInfo.name.toUpperCase(),
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({ 
               text: [
                 cv.personalInfo.email, 
                 cv.personalInfo.phone, 
                 cv.personalInfo.location,
                 cv.personalInfo.linkedin
               ].filter(Boolean).join(" | "), 
               size: 20 
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          border: { bottom: { color: "999999", space: 10, style: BorderStyle.SINGLE, size: 6 } }
        }),

        // --- SUMMARY ---
        new Paragraph({
          text: "PERFIL PROFESIONAL",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [new TextRun({ text: cv.professionalSummary.replace(/<[^>]*>?/gm, ''), size: 22 })], // Strip basic HTML tags
          spacing: { after: 300 },
        }),

        // --- EXPERIENCE ---
        new Paragraph({
          text: "EXPERIENCIA PROFESIONAL",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        ...cv.workExperience.flatMap(exp => [
            new Paragraph({
                children: [
                    new TextRun({ text: exp.role, bold: true, size: 24 }),
                    new TextRun({ text: "\t" + exp.date, size: 20, italics: true }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                spacing: { before: 100 },
            }),
            new Paragraph({
                children: [
                    new TextRun({ text: exp.company + " | " + exp.location, size: 22 }),
                ],
                spacing: { after: 100 },
            }),
            ...exp.bullets.map(bullet => new Paragraph({
                children: [new TextRun({ text: bullet.replace(/<[^>]*>?/gm, ''), size: 22 })],
                bullet: { level: 0 },
            }))
        ]),

        // --- EDUCATION ---
        new Paragraph({
            text: "EDUCACIÓN",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
        }),
        ...cv.education.map(edu => 
            new Paragraph({
                children: [
                    new TextRun({ text: edu.institution, bold: true, size: 22 }),
                    new TextRun({ text: " - " + edu.degree, size: 22 }),
                    new TextRun({ text: "\t" + edu.date, italics: true, size: 20 }),
                ],
                tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
                spacing: { after: 100 },
            })
        ),

        // --- SKILLS ---
        new Paragraph({
            text: "HABILIDADES",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
        }),
        new Paragraph({
            children: [
                new TextRun({ text: cv.skills.join(" • "), size: 22 })
            ]
        })
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  FileSaver.saveAs(blob, `CV-${cv.personalInfo.name.replace(/\s+/g, "_")}.docx`);
};

export const exportToJson = (cv: OptimizeResponse['optimizedCV']) => {
    // Mapping to Standard JSON Resume Schema
    const jsonResume = {
        basics: {
            name: cv.personalInfo.name,
            email: cv.personalInfo.email,
            phone: cv.personalInfo.phone,
            location: { address: cv.personalInfo.location },
            summary: cv.professionalSummary.replace(/<[^>]*>?/gm, ''),
            profiles: [{ network: "LinkedIn", url: cv.personalInfo.linkedin }]
        },
        work: cv.workExperience.map(w => ({
            name: w.company,
            position: w.role,
            startDate: w.date,
            highlights: w.bullets.map(b => b.replace(/<[^>]*>?/gm, ''))
        })),
        education: cv.education.map(e => ({
            institution: e.institution,
            area: e.degree,
            startDate: e.date
        })),
        skills: [{ name: "Professional Skills", keywords: cv.skills }]
    };

    const blob = new Blob([JSON.stringify(jsonResume, null, 2)], { type: "application/json" });
    FileSaver.saveAs(blob, `CV-${cv.personalInfo.name.replace(/\s+/g, "_")}.json`);
};