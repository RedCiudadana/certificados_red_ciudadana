import { Template, TemplateField } from '../types';
import { nanoid } from 'nanoid';

/**
 * Helper functions for creating certificate templates programmatically
 */

// Common field configurations
export const commonFields = {
  recipientName: (x = 50, y = 40): TemplateField => ({
    id: nanoid(),
    name: 'recipient',
    type: 'text',
    x,
    y,
    fontSize: 28,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#1a365d',
    defaultValue: 'Recipient Name'
  }),

  courseName: (x = 50, y = 60): TemplateField => ({
    id: nanoid(),
    name: 'course',
    type: 'text',
    x,
    y,
    fontSize: 20,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#2d3748',
    defaultValue: 'Course Name'
  }),

  institution: (x = 50, y = 70): TemplateField => ({
    id: nanoid(),
    name: 'institution',
    type: 'text',
    x,
    y,
    fontSize: 18,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#4a5568',
    defaultValue: 'Red Ciudadana'
  }),

  issueDate: (x = 30, y = 85): TemplateField => ({
    id: nanoid(),
    name: 'date',
    type: 'date',
    x,
    y,
    fontSize: 16,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#6b7280'
  }),

  qrCode: (x = 85, y = 90): TemplateField => ({
    id: nanoid(),
    name: 'qrcode',
    type: 'qrcode',
    x,
    y
  }),

  signature: (x = 75, y = 75): TemplateField => ({
    id: nanoid(),
    name: 'signature',
    type: 'text',
    x,
    y,
    fontSize: 14,
    fontFamily: 'cursive',
    color: '#374151',
    defaultValue: 'Director Signature'
  }),

  achievement: (x = 50, y = 58): TemplateField => ({
    id: nanoid(),
    name: 'achievement',
    type: 'text',
    x,
    y,
    fontSize: 22,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    color: '#047857',
    defaultValue: 'Outstanding Achievement'
  })
};

/**
 * Create a template with common field layout
 */
export const createTemplate = (
  id: string,
  name: string,
  imageUrl: string,
  customFields?: TemplateField[]
): Template => {
  const defaultFields = [
    commonFields.recipientName(),
    commonFields.courseName(),
    commonFields.issueDate(),
    commonFields.qrCode()
  ];

  return {
    id,
    name,
    imageUrl,
    fields: customFields || defaultFields
  };
};

/**
 * Predefined template configurations
 */
export const templateConfigs = {
  professional: (imageUrl: string): Template => createTemplate(
    nanoid(),
    'Professional Certificate',
    imageUrl,
    [
      commonFields.recipientName(50, 40),
      commonFields.courseName(50, 60),
      commonFields.institution(50, 70),
      commonFields.issueDate(30, 85),
      commonFields.qrCode(85, 90)
    ]
  ),

  completion: (imageUrl: string): Template => createTemplate(
    nanoid(),
    'Course Completion',
    imageUrl,
    [
      commonFields.recipientName(50, 35),
      commonFields.courseName(50, 55),
      commonFields.institution(50, 70),
      commonFields.issueDate(25, 85),
      commonFields.signature(75, 85),
      commonFields.qrCode(85, 92)
    ]
  ),

  achievement: (imageUrl: string): Template => createTemplate(
    nanoid(),
    'Achievement Award',
    imageUrl,
    [
      commonFields.recipientName(50, 42),
      commonFields.achievement(50, 58),
      {
        id: nanoid(),
        name: 'description',
        type: 'text',
        x: 50,
        y: 72,
        fontSize: 16,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#059669',
        defaultValue: 'For exceptional performance and dedication'
      },
      commonFields.issueDate(50, 88),
      commonFields.qrCode(85, 92)
    ]
  ),

  diploma: (imageUrl: string): Template => createTemplate(
    nanoid(),
    'Diploma Certificate',
    imageUrl,
    [
      commonFields.recipientName(50, 38),
      {
        id: nanoid(),
        name: 'degree',
        type: 'text',
        x: 50,
        y: 52,
        fontSize: 24,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#7c2d12',
        defaultValue: 'Bachelor of Science'
      },
      commonFields.courseName(50, 65),
      commonFields.institution(50, 75),
      commonFields.issueDate(25, 88),
      commonFields.signature(75, 88),
      commonFields.qrCode(90, 95)
    ]
  )
};

/**
 * Quick template creation functions
 */
export const quickTemplates = {
  /**
   * Create a professional certificate template
   */
  createProfessional: (imageUrl: string, customName?: string) => {
    const template = templateConfigs.professional(imageUrl);
    if (customName) template.name = customName;
    return template;
  },

  /**
   * Create a completion certificate template
   */
  createCompletion: (imageUrl: string, customName?: string) => {
    const template = templateConfigs.completion(imageUrl);
    if (customName) template.name = customName;
    return template;
  },

  /**
   * Create an achievement award template
   */
  createAchievement: (imageUrl: string, customName?: string) => {
    const template = templateConfigs.achievement(imageUrl);
    if (customName) template.name = customName;
    return template;
  },

  /**
   * Create a diploma template
   */
  createDiploma: (imageUrl: string, customName?: string) => {
    const template = templateConfigs.diploma(imageUrl);
    if (customName) template.name = customName;
    return template;
  }
};

/**
 * Batch template creation
 */
export const createMultipleTemplates = (
  templates: Array<{
    type: 'professional' | 'completion' | 'achievement' | 'diploma';
    imageUrl: string;
    name?: string;
  }>
): Template[] => {
  return templates.map(({ type, imageUrl, name }) => {
    switch (type) {
      case 'professional':
        return quickTemplates.createProfessional(imageUrl, name);
      case 'completion':
        return quickTemplates.createCompletion(imageUrl, name);
      case 'achievement':
        return quickTemplates.createAchievement(imageUrl, name);
      case 'diploma':
        return quickTemplates.createDiploma(imageUrl, name);
      default:
        return templateConfigs.professional(imageUrl);
    }
  });
};