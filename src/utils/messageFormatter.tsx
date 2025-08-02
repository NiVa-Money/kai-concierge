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
    
    // Fix existing duplicate numbering like "1. 1." -> "1."
    processed = processed.replace(/(\d+)\.\s+\1\./g, '$1.');
    
    // Add line breaks before numbered lists
    processed = processed.replace(/(\s)(\d+\.\s)/g, '\n$2');
    
    // Add line breaks before bullet points
    processed = processed.replace(/(\s)([-•*]\s)/g, '\n$2');
    
    // Add line breaks before emojis
    CONFIG.EMOJI_PATTERNS.forEach(emoji => {
      processed = processed.replace(new RegExp(`(\\s)(${emoji})`, 'g'), '\n$2');
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
    
    return processed;
  };

  // Detection functions
  const isNumberedItem = (line: string): boolean => /^\d+\.\s/.test(line);
  
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
        <ol key={`list-${Date.now()}`} className={CONFIG.CLASSES.orderedList}>
          {currentList}
        </ol>
      ) : (
        <ul key={`list-${Date.now()}`} className={CONFIG.CLASSES.unorderedList}>
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

    // If we're starting a new list
    if (isNumberedItem(trimmedLine) && !inNumberedList) {
      closeCurrentList();
      inNumberedList = true;
      listType = 'ordered';
    } else if (isBulletItem(trimmedLine) && !inBulletList) {
      closeCurrentList();
      inBulletList = true;
      listType = 'unordered';
    }

    // Handle numbered list items
    if (isNumberedItem(trimmedLine)) {
      currentList.push(
        <li key={index} className={CONFIG.CLASSES.listItem}>
          {trimmedLine}
        </li>
      );
      return;
    }

    // Handle bullet list items
    if (isBulletItem(trimmedLine)) {
      const cleanText = cleanBulletText(trimmedLine);
      currentList.push(
        <li key={index} className={CONFIG.CLASSES.listItem}>
          {cleanText}
        </li>
      );
      return;
    }

    // If we were in a list and now we're not, close the list
    if ((inNumberedList || inBulletList) && !isNumberedItem(trimmedLine) && !isBulletItem(trimmedLine)) {
      closeCurrentList();
    }

    // Handle headings
    if (isHeading(trimmedLine)) {
      closeCurrentList();
      formattedElements.push(
        <h3 key={index} className={CONFIG.CLASSES.heading}>
          {trimmedLine}
        </h3>
      );
      return;
    }

    // Handle regular paragraphs
    closeCurrentList();
    formattedElements.push(
      <p key={index} className={CONFIG.CLASSES.paragraph}>
        {trimmedLine}
      </p>
    );
  });

  // Close any remaining list
  closeCurrentList();

  return formattedElements;
}; 