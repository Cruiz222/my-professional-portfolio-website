export const categories = [
  "Software",
  "AI",
  "Cybersecurity",
  "AI Security",
  "Automation",
] as const;
export const contributions = [
  "Personal project",
  "Contributed project",
] as const;
export type ProjectCategory = (typeof categories)[number];
export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  category: ProjectCategory;
  contribution: (typeof contributions)[number];
  repositoryUrl: string;
  demoUrl: string;
}

function text(
  value: unknown,
  label: string,
  limit: number,
  required = true,
): string {
  if (
    typeof value !== "string" ||
    value.trim().length > limit ||
    (required && !value.trim())
  ) {
    throw new Error(
      `${label} must be ${required ? "nonempty text" : "text"} of at most ${limit} characters.`,
    );
  }
  return value.trim();
}

function link(value: unknown, label: string): string {
  const result = text(value ?? "", label, 2048, false);
  if (result) {
    let url: URL;
    try {
      url = new URL(result);
    } catch {
      throw new Error(`${label} must be a full http:// or https:// URL.`);
    }
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password
    ) {
      throw new Error(
        `${label} must be an HTTP or HTTPS URL without embedded credentials.`,
      );
    }
  }
  return result;
}

export function parseProjects(value: unknown): Project[] {
  if (!Array.isArray(value) || value.length > 100)
    throw new Error("Projects must be a list of at most 100 entries.");
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw new Error("Each project must be an object.");
    const row = item as Record<string, unknown>;
    const id = text(row.id, "Project ID", 80);
    if (ids.has(id)) throw new Error("Project IDs must be unique.");
    ids.add(id);
    if (!categories.includes(row.category as ProjectCategory))
      throw new Error("Choose a valid project category.");
    if (!contributions.includes(row.contribution as Project["contribution"]))
      throw new Error("Choose a valid contribution.");
    if (!Array.isArray(row.technologies) || row.technologies.length > 20)
      throw new Error("Use at most 20 technologies.");
    return {
      id,
      title: text(row.title, "Title", 80),
      description: text(row.description, "Description", 1000),
      technologies: [
        ...new Set(
          row.technologies.map((value) => text(value, "Technology", 40)),
        ),
      ],
      category: row.category as ProjectCategory,
      contribution: row.contribution as Project["contribution"],
      repositoryUrl: link(row.repositoryUrl, "Repository URL"),
      demoUrl: link(row.demoUrl, "Demo URL"),
    };
  });
}
