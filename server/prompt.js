export const RESUME_PARSER_PROMPT = `You are a resume parser. Convert the following resume into a structured JSON object.
        Follow this exact structure:
        {
        "personalInfo": {
            "name": "",
            "location": "",
            "email": "",
            "phone": "",
            "profiles": {
            "linkedin": "",
            "github": "",
            "twitter": "",
            "portfolio": ""
            }
        },
        "education": [
            {
            "institution": "",
            "degree": "",
            "field": "",
            "duration": "",
            "gpa": "",
            "percentage": ""
            }
        ],
        "experience": [
            {
            "title": "",
            "company": "",
            "location": "",
            "duration": "",
            "responsibilities": []
            }
        ],
        "projects": [
            {
            "name": "",
            "repository": "",
            "technologies": [],
            "description": []
            }
        ],
        "skills": {
            "languages": [],
            "frameworks": [],
            "tools": [],
            "databases": []
        },
        "certifications": [],
        "achievements": []
        }

        Rules:
        1. Extract ALL information from the resume
        2. If a field is not present, omit it from the JSON (don't include null or empty values)
        3. Keep the original text as-is, don't paraphrase
        4. For arrays, split items logically
        5. Return ONLY valid JSON, no markdown, no explanation, no preamble

        Resume text:`

export const RESPONSE_SCHEMA = `const responseJsonSchema = {
  description: "Resume data extraction schema",
  type: SchemaType.OBJECT,
  properties: {
    personal_info: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        linkedin: { type: SchemaType.STRING },
        github: { type: SchemaType.STRING },
        portfolio: { type: SchemaType.STRING },
      },
      required: ["name", "email"],
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          institution: { type: SchemaType.STRING },
          degree: { type: SchemaType.STRING },
          start_date: { type: SchemaType.STRING },
          end_date: { type: SchemaType.STRING },
        },
      },
    },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING },
          role: { type: SchemaType.STRING },
          start_date: { type: SchemaType.STRING },
          end_date: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
        },
      },
    },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["personal_info", "experience", "skills"],
};`