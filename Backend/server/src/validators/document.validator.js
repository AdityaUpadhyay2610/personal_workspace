import { body } from 'express-validator';

const allowedFields = new Set(['title', 'icon', 'coverImage', 'content']);
const blockTypes = new Set([
  'paragraph', 'h1', 'h2', 'h3', 'heading', 'bullet', 'numbered', 'todo',
  'quote', 'code', 'divider', 'table', 'board',
]);

const documentFields = body().custom((value) => {
  const unknownField = Object.keys(value || {}).find((field) => !allowedFields.has(field));
  if (unknownField) throw new Error(`${unknownField} is not an allowed document field`);
  return true;
});

const title = body('title')
  .optional({ nullable: true })
  .isString().withMessage('Title must be a string').bail()
  .trim()
  .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters');

const icon = body('icon')
  .optional({ nullable: true })
  .isString().withMessage('Icon must be a string').bail()
  .isLength({ max: 20 }).withMessage('Icon must be a short string');

const coverImage = body('coverImage')
  .optional({ nullable: true })
  .isString().withMessage('Cover image must be a string').bail()
  .isLength({ max: 500 }).withMessage('Cover image value is too long');

const content = body('content')
  .optional({ nullable: true })
  .isArray({ max: 500 }).withMessage('Content must be an array with at most 500 blocks').bail()
  .custom((blocks) => blocks.every((block) => (
    block && typeof block === 'object' && typeof block.id === 'string' && block.id.length <= 100
      && blockTypes.has(block.type)
      && (block.text === undefined || typeof block.text === 'string')
  ))).withMessage('Content contains an invalid block');

export const createDocumentValidator = [documentFields, title, icon, coverImage, content];
export const updateDocumentValidator = [documentFields, title, icon, coverImage, content];