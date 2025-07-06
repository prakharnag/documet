/**
 * Text processing utilities for Document content preprocessing
 */

// Clean and normalize text content
export function cleanText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove special formatting characters
    .replace(/[•●▪▫]/g, '')
    // Remove bullet points and dashes at start of lines
    .replace(/^[-•*]\s*/gm, '')
    // Remove email addresses
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '')
    // Remove phone numbers
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '')
    // Remove URLs
    .replace(/https?:\/\/[^\s]+/g, '')
    // Remove excessive punctuation
    .replace(/[!]{2,}/g, '!')
    .replace(/[?]{2,}/g, '?')
    .replace(/[.]{2,}/g, '.')
    // Trim whitespace
    .trim();
}

// Split large sections into focused subsections
export function splitSectionIntoSubsections(sectionName: string, content: string): { title: string, content: string }[] {
  const cleanedContent = cleanText(content);
  
  // For Work Experience, split by job entries
  if (["Experience", "Work Experience", "Professional Experience"].includes(sectionName)) {
    return splitWorkExperience(cleanedContent);
  }
  
  // For Projects, split by project entries
  if (["Projects", "Technical Projects", "Portfolio"].includes(sectionName)) {
    return splitProjects(cleanedContent);
  }
  
  // For Education, split by degree/entry
  if (["Education", "Academic Background"].includes(sectionName)) {
    return splitEducation(cleanedContent);
  }
  
  // For Skills, organize by category
  if (["Skills", "Technical Skills", "Competencies"].includes(sectionName)) {
    return splitSkills(cleanedContent);
  }
  
  // For other sections, keep as single subsection
  return [{
    title: sectionName,
    content: cleanedContent
  }];
}

// Split work experience into individual job entries
function splitWorkExperience(content: string): { title: string, content: string }[] {
  const entries: { title: string, content: string }[] = [];
  
  // Split by common job entry patterns
  const patterns = [
    // Pattern: Company Name - Position (Date)
    /([A-Z][A-Za-z\s&]+)\s*[-–—]\s*([A-Za-z\s]+)\s*\(([^)]+)\)/g,
    // Pattern: Position at Company (Date)
    /([A-Za-z\s]+)\s+at\s+([A-Z][A-Za-z\s&]+)\s*\(([^)]+)\)/g,
    // Pattern: Company, Position, Date
    /([A-Z][A-Za-z\s&]+),\s*([A-Za-z\s]+),\s*([^,]+)/g
  ];
  
  let lastIndex = 0;
  let match;
  
  // Try to find structured job entries
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const previousContent = content.substring(lastIndex, match.index).trim();
        if (previousContent.length > 20) {
          entries.push({
            title: `Previous Role`,
            content: previousContent
          });
        }
      }
      
      const company = match[1]?.trim() || match[2]?.trim() || 'Unknown Company';
      const position = match[2]?.trim() || match[1]?.trim() || 'Unknown Position';
      const date = match[3]?.trim() || '';
      
      entries.push({
        title: `${position} at ${company}`,
        content: `${position} at ${company} (${date})`
      });
      
      lastIndex = pattern.lastIndex;
    }
  }
  
  // Add remaining content
  if (lastIndex < content.length) {
    const remainingContent = content.substring(lastIndex).trim();
    if (remainingContent.length > 20) {
      entries.push({
        title: `Additional Experience`,
        content: remainingContent
      });
    }
  }
  
  // If no structured entries found, split by paragraphs
  if (entries.length === 0) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    return paragraphs.map((para, index) => ({
      title: `Experience Entry ${index + 1}`,
      content: para.trim()
    }));
  }
  
  return entries;
}

// Split projects into individual project entries
function splitProjects(content: string): { title: string, content: string }[] {
  const entries: { title: string, content: string }[] = [];
  
  // Split by project patterns
  const patterns = [
    // Pattern: Project Name - Description
    /([A-Z][A-Za-z0-9\s]+)\s*[-–—]\s*([^.!?]+[.!?])/g,
    // Pattern: Project Name: Description
    /([A-Z][A-Za-z0-9\s]+)\s*:\s*([^.!?]+[.!?])/g
  ];
  
  let lastIndex = 0;
  let match;
  
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const previousContent = content.substring(lastIndex, match.index).trim();
        if (previousContent.length > 20) {
          entries.push({
            title: `Previous Project`,
            content: previousContent
          });
        }
      }
      
      const projectName = match[1]?.trim() || 'Unknown Project';
      const description = match[2]?.trim() || '';
      
      entries.push({
        title: projectName,
        content: `${projectName}: ${description}`
      });
      
      lastIndex = pattern.lastIndex;
    }
  }
  
  // If no structured entries found, split by paragraphs
  if (entries.length === 0) {
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    return paragraphs.map((para, index) => ({
      title: `Project ${index + 1}`,
      content: para.trim()
    }));
  }
  
  return entries;
}

// Split education into individual entries
function splitEducation(content: string): { title: string, content: string }[] {
  const entries: { title: string, content: string }[] = [];
  
  // Split by degree patterns
  const patterns = [
    // Pattern: Degree, Institution (Year)
    /([A-Za-z\s]+),\s*([A-Z][A-Za-z\s&]+)\s*\(([^)]+)\)/g,
    // Pattern: Institution - Degree (Year)
    /([A-Z][A-Za-z\s&]+)\s*[-–—]\s*([A-Za-z\s]+)\s*\(([^)]+)\)/g
  ];
  
  let lastIndex = 0;
  let match;
  
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    while ((match = pattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        const previousContent = content.substring(lastIndex, match.index).trim();
        if (previousContent.length > 20) {
          entries.push({
            title: `Previous Education`,
            content: previousContent
          });
        }
      }
      
      const degree = match[1]?.trim() || match[2]?.trim() || 'Unknown Degree';
      const institution = match[2]?.trim() || match[1]?.trim() || 'Unknown Institution';
      const year = match[3]?.trim() || '';
      
      entries.push({
        title: `${degree} from ${institution}`,
        content: `${degree} from ${institution} (${year})`
      });
      
      lastIndex = pattern.lastIndex;
    }
  }
  
  // If no structured entries found, split by lines
  if (entries.length === 0) {
    const lines = content.split('\n').filter(line => line.trim().length > 20);
    return lines.map((line, index) => ({
      title: `Education Entry ${index + 1}`,
      content: line.trim()
    }));
  }
  
  return entries;
}

// Split skills into categories
function splitSkills(content: string): { title: string, content: string }[] {
  const entries: { title: string, content: string }[] = [];
  
  // Split by skill categories
  const categories = [
    { name: 'Technical Skills', patterns: [/technical|programming|coding|software|development/i] },
    { name: 'Soft Skills', patterns: [/soft|communication|leadership|teamwork|management/i] },
    { name: 'Languages', patterns: [/language|bilingual|fluent|speak/i] },
    { name: 'Tools & Technologies', patterns: [/tool|technology|framework|platform/i] }
  ];
  
  // If content contains category indicators, split accordingly
  let hasCategories = false;
  for (const category of categories) {
    if (category.patterns.some(pattern => pattern.test(content))) {
      hasCategories = true;
      break;
    }
  }
  
  if (hasCategories) {
    // Split by category headers
    const lines = content.split('\n');
    let currentCategory = 'General Skills';
    let currentSkills: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length === 0) continue;
      
      // Check if line is a category header
      const isCategoryHeader = categories.some(cat => 
        cat.patterns.some(pattern => pattern.test(trimmedLine))
      );
      
      if (isCategoryHeader) {
        // Save previous category
        if (currentSkills.length > 0) {
          entries.push({
            title: currentCategory,
            content: currentSkills.join(', ')
          });
        }
        
        // Start new category
        currentCategory = trimmedLine;
        currentSkills = [];
      } else {
        // Add skill to current category
        currentSkills.push(trimmedLine);
      }
    }
    
    // Add final category
    if (currentSkills.length > 0) {
      entries.push({
        title: currentCategory,
        content: currentSkills.join(', ')
      });
    }
  } else {
    // Simple comma-separated skills
    const skills = content.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 2);
    if (skills.length > 0) {
      entries.push({
        title: 'Skills',
        content: skills.join(', ')
      });
    }
  }
  
  return entries;
}

// Ensure embedding is properly formatted as JSON array
export function formatEmbedding(embedding: number[]): number[] {
  if (!Array.isArray(embedding)) {
    throw new Error('Embedding must be an array of numbers');
  }
  
  // Ensure all values are numbers
  return embedding.map(val => {
    const num = Number(val);
    if (isNaN(num)) {
      throw new Error('Embedding contains non-numeric values');
    }
    return num;
  });
} 