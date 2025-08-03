import React from 'react';

// Message formatting utility
// This file contains all formatting logic that can be easily modified

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
    
    // Minimum length for capital heading detection
    MIN_CAPS_LENGTH: 3,
    
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

  // Pre-processing functions
  const preprocessContent = (content: string): string => {
    let processed = content;
    
    // More comprehensive fix for duplicate numbering patterns
    // Handle patterns like "1. 1." or "1. 1. text" or "1.1." etc.
    processed = processed.replace(/(\d+)\.\s*\1\.\s*/g, '$1. ');
    processed = processed.replace(/(\d+)\.\s*(\d+)\.\s*/g, '$1. ');
    
    // Add line breaks before numbered lists (number + dot + space pattern)
    processed = processed.replace(/(\s)(\d+\.\s)/g, '\n$2');
    
    // Add line breaks before bullet points
    processed = processed.replace(/(\s)([-•*]\s)/g, '\n$2');
    
    // Add line breaks before emojis, but only if followed by text
    CONFIG.EMOJI_PATTERNS.forEach(emoji => {
      // Only add line break if emoji is followed by text (not just another emoji)
      processed = processed.replace(
        new RegExp(`(\\s)(${emoji})(\\s+[^\\s])`, 'g'), 
        '\n$2$3'
      );
    });
    
    // Add line breaks before CAPITAL HEADINGS
    processed = processed.replace(/(\s)([A-Z\s]{3,}[:!?]?)/g, (match, space, capsText) => {
      if (capsText.length > CONFIG.MIN_CAPS_LENGTH && 
          capsText === capsText.toUpperCase() && 
          /^[A-Z\s:!?]+$/.test(capsText)) {
        return '\n' + capsText;
      }
      return match;
    });
    
    // Clean up: remove lines that are just single emojis
    const lines = processed.split('\n');
    const cleanedLines = lines.filter(line => {
      const trimmed = line.trim();
      // Keep line if it's not just a single emoji
      return !CONFIG.EMOJI_PATTERNS.some(emoji => trimmed === emoji);
    });
    
    return cleanedLines.join('\n');
  };

  // Detection functions
  const isNumberedItem = (line: string): boolean => {
    const trimmed = line.trim();
    // More robust detection - must start with number followed by dot and space
    return /^\d+\.\s/.test(trimmed);
  };
  
  const isBulletItem = (line: string): boolean => {
    return CONFIG.BULLET_PATTERNS.some(bullet => 
      line.startsWith(bullet + ' ') || line.startsWith(bullet)
    );
  };
  
  const isHeading = (line: string): boolean => {
    const hasEmoji = CONFIG.EMOJI_PATTERNS.some(emoji => line.startsWith(emoji));
    const isAllCaps = line.length > CONFIG.MIN_CAPS_LENGTH && 
                      line === line.toUpperCase() && 
                      /^[A-Z\s:!?]+$/.test(line);
    return hasEmoji || isAllCaps;
  };

  // Clean text functions
  const cleanBulletText = (line: string): string => {
    return line.replace(/^[•\-*]\s/, '').replace(/^\u2022\s/, '');
  };

  // NEW: Clean numbered text function to remove number prefix
  const cleanNumberedText = (line: string): string => {
    // Remove the number and dot from the beginning
    // This handles patterns like "1. ", "12. ", etc.
    return line.replace(/^\d+\.\s*/, '').trim();
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
      formattedElements.push(<div key={`spacing-${index}`} className={CONFIG.CLASSES.spacing}></div>);
      return;
    }

    // Apply additional cleaning for any remaining duplicate patterns
    let cleanedLine = trimmedLine;
    
    // Multiple passes to catch complex duplicate patterns
    let prevLine = '';
    while (prevLine !== cleanedLine) {
      prevLine = cleanedLine;
      // Remove duplicate numbering patterns
      cleanedLine = cleanedLine.replace(/(\d+)\.\s*\1\.\s*/g, '$1. ');
      cleanedLine = cleanedLine.replace(/(\d+)\.\s*(\d+)\.\s*/g, '$1. ');
      cleanedLine = cleanedLine.trim();
    }
    
    // If we're starting a new list
    if (isNumberedItem(cleanedLine) && !inNumberedList) {
      closeCurrentList();
      inNumberedList = true;
      listType = 'ordered';
    } else if (isBulletItem(cleanedLine) && !inBulletList) {
      closeCurrentList();
      inBulletList = true;
      listType = 'unordered';
    }

    // Handle numbered list items - CRITICAL FIX: Remove the number prefix!
    if (isNumberedItem(cleanedLine)) {
      const cleanText = cleanNumberedText(cleanedLine);
      currentList.push(
        <li key={`numbered-${index}`} className={CONFIG.CLASSES.listItem}>
          {cleanText}
        </li>
      );
      return;
    }

    // Handle bullet list items
    if (isBulletItem(cleanedLine)) {
      const cleanText = cleanBulletText(cleanedLine);
      currentList.push(
        <li key={`bullet-${index}`} className={CONFIG.CLASSES.listItem}>
          {cleanText}
        </li>
      );
      return;
    }

    // If we were in a list and now we're not, close the list
    if ((inNumberedList || inBulletList) && !isNumberedItem(cleanedLine) && !isBulletItem(cleanedLine)) {
      closeCurrentList();
    }

    // Handle headings
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