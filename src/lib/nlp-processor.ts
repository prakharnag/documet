// Free NLP processing using Hugging Face Transformers.js
import { pipeline } from '@xenova/transformers';

interface ProcessedSection {
  title: string;
  content: string;
  summary: string;
  keywords: string[];
  importance: number;
}

class NLPProcessor {
  private summarizer: any = null;
  private classifier: any = null;

  async initialize() {
    if (!this.summarizer) {
      // Load free summarization model
      this.summarizer = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    }
    if (!this.classifier) {
      // Load free text classification model
      this.classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
    }
  }

  // Extract meaningful sections from document
  extractSections(text: string): { title: string; content: string }[] {
    const sections: { title: string; content: string }[] = [];
    
    // Split by common section patterns
    const sectionPatterns = [
      /^(SUMMARY|HIGHLIGHTS|OBJECTIVE|PROFILE|ABOUT)[\s\S]*?(?=^[A-Z]{2,}|\n\n[A-Z]|$)/gim,
      /^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE)[\s\S]*?(?=^[A-Z]{2,}|\n\n[A-Z]|$)/gim,
      /^(EDUCATION|ACADEMIC)[\s\S]*?(?=^[A-Z]{2,}|\n\n[A-Z]|$)/gim,
      /^(SKILLS|TECHNICAL SKILLS|COMPETENCIES)[\s\S]*?(?=^[A-Z]{2,}|\n\n[A-Z]|$)/gim,
      /^(PROJECTS|PORTFOLIO)[\s\S]*?(?=^[A-Z]{2,}|\n\n[A-Z]|$)/gim,
      /^(CERTIFICATIONS|CERTIFICATES)[\s\S]*?(?=^[A-Z]{2,}|\n\n[A-Z]|$)/gim,
    ];

    // Try pattern-based extraction first
    sectionPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lines = match.trim().split('\n');
          const title = lines[0].trim();
          const content = lines.slice(1).join('\n').trim();
          if (content.length > 50) {
            sections.push({ title, content });
          }
        });
      }
    });

    // If no patterns found, use paragraph-based splitting
    if (sections.length === 0) {
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 100);
      
      paragraphs.forEach((paragraph, index) => {
        const lines = paragraph.trim().split('\n');
        const potentialTitle = lines[0].trim();
        
        // Check if first line looks like a title
        if (potentialTitle.length < 50 && /^[A-Z][A-Za-z\s]{2,}$/.test(potentialTitle)) {
          sections.push({
            title: potentialTitle,
            content: lines.slice(1).join('\n').trim() || paragraph
          });
        } else {
          sections.push({
            title: `Section ${index + 1}`,
            content: paragraph
          });
        }
      });
    }

    return sections.filter(s => s.content.length > 30);
  }

  // Classify section type
  async classifySection(content: string): Promise<string> {
    if (!this.classifier) await this.initialize();
    
    const labels = [
      'professional experience',
      'education background', 
      'technical skills',
      'personal summary',
      'projects portfolio',
      'certifications',
      'general information'
    ];

    try {
      const result = await this.classifier(content.substring(0, 500), labels);
      return result.labels[0];
    } catch (error) {
      console.error('Classification error:', error);
      return 'general information';
    }
  }

  // Generate summary for section
  async summarizeSection(content: string): Promise<string> {
    if (!this.summarizer) await this.initialize();
    
    // Skip if content is too short
    if (content.length < 100) return content;
    
    try {
      const result = await this.summarizer(content, {
        max_length: 100,
        min_length: 30,
        do_sample: false
      });
      return result[0].summary_text;
    } catch (error) {
      console.error('Summarization error:', error);
      // Fallback to first 2 sentences
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
      return sentences.slice(0, 2).join('. ') + '.';
    }
  }

  // Extract keywords using simple frequency analysis
  extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const stopWords = new Set([
      'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'way', 'will', 'with', 'have', 'this', 'that', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'
    ]);

    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      if (!stopWords.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  // Calculate section importance
  calculateImportance(content: string, keywords: string[]): number {
    let score = 0;
    
    // Length factor (longer sections might be more important)
    score += Math.min(content.length / 1000, 1) * 0.3;
    
    // Keyword density
    score += keywords.length / 20 * 0.4;
    
    // Important terms bonus
    const importantTerms = ['experience', 'skills', 'education', 'project', 'achievement', 'responsibility'];
    const hasImportantTerms = importantTerms.some(term => 
      content.toLowerCase().includes(term)
    );
    if (hasImportantTerms) score += 0.3;
    
    return Math.min(score, 1);
  }

  // Main processing function
  async processDocument(text: string): Promise<ProcessedSection[]> {
    await this.initialize();
    
    const sections = this.extractSections(text);
    const processedSections: ProcessedSection[] = [];

    for (const section of sections) {
      try {
        const [summary, keywords] = await Promise.all([
          this.summarizeSection(section.content),
          Promise.resolve(this.extractKeywords(section.content))
        ]);

        const importance = this.calculateImportance(section.content, keywords);

        processedSections.push({
          title: section.title,
          content: section.content,
          summary,
          keywords,
          importance
        });
      } catch (error) {
        console.error(`Error processing section "${section.title}":`, error);
        // Add section without processing if error occurs
        processedSections.push({
          title: section.title,
          content: section.content,
          summary: section.content.substring(0, 200) + '...',
          keywords: this.extractKeywords(section.content),
          importance: 0.5
        });
      }
    }

    return processedSections.sort((a, b) => b.importance - a.importance);
  }
}

export const nlpProcessor = new NLPProcessor();
export type { ProcessedSection };