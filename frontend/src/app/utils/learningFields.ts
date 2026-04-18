type FieldCourseLike = {
  title?: string | null;
  category?: string | null;
  description?: string | null;
};

type FieldDefinition = {
  label: string;
  keywords: string[];
};

const FIELD_DEFINITIONS: FieldDefinition[] = [
  {
    label: "Web Development",
    keywords: [
      "web",
      "frontend",
      "front end",
      "backend",
      "back end",
      "fullstack",
      "full stack",
      "react",
      "javascript",
      "typescript",
      "node",
      "express",
      "html",
      "css",
      "bootstrap",
      "phase",
      "mysql",
      "api",
      "rest",
    ],
  },
  {
    label: "Graphics Design",
    keywords: [
      "graphic",
      "graphics",
      "design",
      "illustrator",
      "photoshop",
      "figma",
      "ui",
      "ux",
      "branding",
      "typography",
      "motion design",
    ],
  },
  {
    label: "App Development",
    keywords: [
      "app",
      "mobile",
      "android",
      "ios",
      "flutter",
      "react native",
      "swift",
      "kotlin",
      "xamarin",
      "expo",
    ],
  },
  {
    label: "Maintenance",
    keywords: [
      "maintenance",
      "support",
      "operations",
      "devops",
      "monitoring",
      "deployment",
      "sre",
      "incident",
      "qa",
      "testing",
      "bug fix",
    ],
  },
];

const KNOWN_FIELD_LABELS = new Set(FIELD_DEFINITIONS.map((item) => item.label.toLowerCase()));

const normalizeText = (value: unknown): string => String(value || "").trim().toLowerCase();

const toTitleCase = (value: string): string => {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const findFieldByText = (value: string): string | null => {
  if (!value) {
    return null;
  }

  for (const field of FIELD_DEFINITIONS) {
    if (field.keywords.some((keyword) => value.includes(keyword))) {
      return field.label;
    }
  }

  return null;
};

export const FIELD_PRIORITY = [
  "Web Development",
  "Graphics Design",
  "App Development",
  "Maintenance",
  "General Technology",
];

export const resolveLearningFieldFromCourse = (course: FieldCourseLike): string => {
  const category = normalizeText(course.category);
  const title = normalizeText(course.title);
  const description = normalizeText(course.description);

  const fromCategory = findFieldByText(category);
  if (fromCategory) {
    return fromCategory;
  }

  if (category) {
    const cleanedCategory = toTitleCase(category.replace(/[\/_-]+/g, " ").replace(/\s+/g, " ").trim());
    if (cleanedCategory && !KNOWN_FIELD_LABELS.has(cleanedCategory.toLowerCase())) {
      if (cleanedCategory.toLowerCase() !== "development") {
        return cleanedCategory;
      }
    }
  }

  const mergedText = `${title} ${description}`.trim();
  const fromContent = findFieldByText(mergedText);
  if (fromContent) {
    return fromContent;
  }

  if (/phase\s*\d+/i.test(`${course.title || ""}`)) {
    return "Web Development";
  }

  return "General Technology";
};
