import React from 'react';

// Message formatting utility
// Enhanced version with better edge case handling

export interface FormattedElement {
  type: 'paragraph' | 'heading' | 'ordered-list' | 'unordered-list' | 'spacing';
  content: string;
  children?: string[];
}

export const formatMessage = (content: string): React.JSX.Element[] => {
  // Configuration - easily modifiable
  const CONFIG = {
    // Emojis that should trigger new lines and heading formatting
    EMOJI_PATTERNS: [
      '📋', '🎯', '📝', '💡', '🔍', '🎉', '✨', '🏙️', '🗓️', '✅', '💎', '📞', '🎟️', '📊', 
      '🏠', '🚗', '✈️', '🛫', '🛬', '🏨', '🍽️', '🎭', '🎨', '🛍️', '💼', '📱', '📧', '📨', 
      '📬', '📭', '📮', '📯', '📢', '📣', '🔔', '🔕', '🎵', '🎶', '🎼', '🎤', '🎧', '🎸', 
      '🎹', '🎷', '🎺', '🎻', '🥁', '🎪', '🎭', '🎨', '🎬', '➕', '✔', '🎫', '🎪', '🎭', 
      '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🎷', '🎺', '🎻', '🥁', '🎪', '🎭', '🎨', '🎬'
    ],
    
    // Bullet point characters
    BULLET_PATTERNS: ['•', '-', '*', '\u2022'],
    
    // Common abbreviations and acronyms that shouldn't be treated as headings
    COMMON_ABBREVIATIONS: [
      'ID', 'VIP', 'KAI', 'F1', 'GP', 'UAE', 'UK', 'US', 'USA', 'EU', 'API', 'URL', 'HTML', 
      'CSS', 'JS', 'AI', 'ML', 'UI', 'UX', 'CEO', 'CTO', 'CFO', 'HR', 'IT', 'PR', 'SEO',
      'FAQ', 'QR', 'PDF', 'PNG', 'JPG', 'GIF', 'MP3', 'MP4', 'TV', 'PC', 'MAC', 'IOS',
      'GPS', 'WiFi', 'HTTP', 'HTTPS', 'FTP', 'SSH', 'SQL', 'DB', 'OS', 'RAM', 'CPU'
    ],
    
    // Minimum length for capital heading detection
    MIN_CAPS_LENGTH: 4,
    
    // Minimum word count for capital heading detection
    MIN_CAPS_WORDS: 2,
    
    // CSS classes
    CLASSES: {
      paragraph: 'mb-2 last:mb-0 text-slate-300 leading-relaxed',
      heading: 'font-semibold text-white mb-2 mt-3 first:mt-0',
      orderedList: 'ml-4 mb-3 list-decimal',
      unorderedList: 'ml-4 mb-3 list-disc',
      listItem: 'text-slate-300 mb-1',
      spacing: 'h-2'
    }
  };

  // Enhanced abbreviation detection
  const isCommonAbbreviation = (text: string): boolean => {
    const cleanText = text.replace(/[^\w\s]/g, '').trim();
    return CONFIG.COMMON_ABBREVIATIONS.includes(cleanText.toUpperCase());
  };

  // Enhanced heading detection with better filtering
  const isValidCapitalHeading = (text: string): boolean => {
    const cleanText = text.replace(/[^\w\s]/g, '').trim();
    
    // Must be all caps
    if (cleanText !== cleanText.toUpperCase()) return false;
    
    // Must have minimum length
    if (cleanText.length < CONFIG.MIN_CAPS_LENGTH) return false;
    
    // Must have minimum word count
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    if (words.length < CONFIG.MIN_CAPS_WORDS) return false;
    
    // Don't treat common abbreviations as headings
    if (words.length === 1 && isCommonAbbreviation(words[0])) return false;
    
    // Don't treat sequences of common abbreviations as headings
    if (words.every(word => isCommonAbbreviation(word))) return false;
    
    // Must contain letters (not just punctuation)
    if (!/[A-Z]/.test(cleanText)) return false;
    
    return true;
  };

  // Pre-processing functions
  const preprocessContent = (content: string): string => {
    let processed = content;
    
    // More comprehensive fix for duplicate numbering patterns
    processed = processed.replace(/(\d+)\.\s*\1\.\s*/g, '$1. ');
    processed = processed.replace(/(\d+)\.\s*(\d+)\.\s*/g, '$1. ');
    
    // Remove meaningless dash sequences (--- or similar)
    processed = processed.replace(/^\s*[-]{2,}\s*$/gm, '');
    processed = processed.replace(/\s+[-]{2,}\s+/g, ' ');
    
    // Add line breaks before numbered lists
    processed = processed.replace(/(\S)(\s+)(\d+\.\s)/g, '$1\n$3');
    
    // Add line breaks before bullet points
    processed = processed.replace(/(\S)(\s+)([-•*]\s)/g, '$1\n$3');
    
    // Add line breaks before emojis, but only if followed by meaningful text
    CONFIG.EMOJI_PATTERNS.forEach(emoji => {
      processed = processed.replace(
        new RegExp(`(\\S)(\\s+)(${emoji})(\\s+\\S)`, 'g'), 
        '$1\n$3$4'
      );
    });
    
    // Enhanced capital heading detection with better filtering
    processed = processed.replace(/(\S)(\s+)([A-Z\s:!?]{4,})/g, (match, prevChar, space, capsText) => {
      const trimmedCaps = capsText.trim();
      if (isValidCapitalHeading(trimmedCaps)) {
        return prevChar + '\n' + trimmedCaps;
      }
      return match;
    });
    
    // Clean up: remove lines that are just emojis or meaningless content
    const lines = processed.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim();
      
      // Skip empty lines
      if (!trimmed) return true;
      
      // Skip lines that are just single emojis
      if (CONFIG.EMOJI_PATTERNS.some(emoji => trimmed === emoji)) return false;
      
      // Skip lines that are just dashes
      if (/^[-]{1,}$/.test(trimmed)) return false;
      
      // Skip lines that are just common abbreviations without context
      if (trimmed.length <= 3 && isCommonAbbreviation(trimmed)) return false;
      
      return true;
    });
    
    return cleanedLines.join('\n');
  };

  // Detection functions
  const isNumberedItem = (line: string): boolean => {
    const trimmed = line.trim();
    return /^\d+\.\s/.test(trimmed);
  };
  
  const isBulletItem = (line: string): boolean => {
    const trimmed = line.trim();
    return CONFIG.BULLET_PATTERNS.some(bullet => 
      trimmed.startsWith(bullet + ' ')
    );
  };
  
  const isHeading = (line: string): boolean => {
    const trimmed = line.trim();
    
    // Check for emoji headings
    const hasEmoji = CONFIG.EMOJI_PATTERNS.some(emoji => trimmed.startsWith(emoji));
    if (hasEmoji) return true;
    
    // Check for valid capital headings with enhanced filtering
    return isValidCapitalHeading(trimmed);
  };

  // Clean text functions
  const cleanBulletText = (line: string): string => {
    return line.trim().replace(/^[•\-*]\s*/, '');
  };

  const cleanNumberedText = (line: string): string => {
    return line.trim().replace(/^\d+\.\s*/, '');
  };

  // Enhanced text cleaning to remove inconsistent characters
  const cleanText = (text: string): string => {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[-]{2,}/g, '') // Remove dash sequences
      .trim();
  };

  // Main processing
  const processedContent = preprocessContent(content);
  const lines = processedContent.split("\n");
  const formattedElements: React.JSX.Element[] = [];
  let currentList: React.JSX.Element[] = [];
  let inNumberedList = false;
  let inBulletList = false;
  let listType: 'ordered' | 'unordered' | null = null;

  const closeCurrentList = () => {
    if (currentList.length > 0) {
      const listElement = listType === 'ordered' ? (
        <ol key={`list-${Date.now()}-${Math.random()}`} className={CONFIG.CLASSES.orderedList}>
          {currentList}
        </ol>
      ) : (
        <ul key={`list-${Date.now()}-${Math.random()}`} className={CONFIG.CLASSES.unorderedList}>
          {currentList}
        </ul>
      );
      formattedElements.push(listElement);
      currentList = [];
      inNumberedList = false;
      inBulletList = false;
      listType = null;
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines but add spacing and close any open lists
    if (!trimmedLine) {
      closeCurrentList();
      // Only add spacing if we have content before and after
      if (formattedElements.length > 0 && index < lines.length - 1) {
        formattedElements.push(<div key={`spacing-${index}`} className={CONFIG.CLASSES.spacing}></div>);
      }
      return;
    }

    // Clean the line
    const cleanedLine = cleanText(trimmedLine);
    
    // Skip if cleaning resulted in empty or meaningless content
    if (!cleanedLine || cleanedLine.length < 2) return;

    // Check if we're starting a new list
    if (isNumberedItem(cleanedLine) && !inNumberedList) {
      closeCurrentList();
      inNumberedList = true;
      listType = 'ordered';
    } else if (isBulletItem(cleanedLine) && !inBulletList) {
      closeCurrentList();
      inBulletList = true;
      listType = 'unordered';
    }

    // Handle numbered list items
    if (isNumberedItem(cleanedLine)) {
      const cleanText = cleanNumberedText(cleanedLine);
      if (cleanText) { // Only add if there's actual content
        currentList.push(
          <li key={`numbered-${index}`} className={CONFIG.CLASSES.listItem}>
            {cleanText}
          </li>
        );
      }
      return;
    }

    // Handle bullet list items
    if (isBulletItem(cleanedLine)) {
      const cleanText = cleanBulletText(cleanedLine);
      if (cleanText) { // Only add if there's actual content
        currentList.push(
          <li key={`bullet-${index}`} className={CONFIG.CLASSES.listItem}>
            {cleanText}
          </li>
        );
      }
      return;
    }

    // If we were in a list and now we're not, close the list
    if ((inNumberedList || inBulletList) && !isNumberedItem(cleanedLine) && !isBulletItem(cleanedLine)) {
      closeCurrentList();
    }

    // Handle headings with better validation
    if (isHeading(cleanedLine)) {
      closeCurrentList();
      formattedElements.push(
        <h3 key={`heading-${index}`} className={CONFIG.CLASSES.heading}>
          {cleanedLine}
        </h3>
      );
      return;
    }

    // Handle regular paragraphs
    closeCurrentList();
    formattedElements.push(
      <p key={`paragraph-${index}`} className={CONFIG.CLASSES.paragraph}>
        {cleanedLine}
      </p>
    );
  });

  // Close any remaining list
  closeCurrentList();

  return formattedElements;
};