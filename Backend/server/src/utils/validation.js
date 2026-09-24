const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENT_BLOCK_TYPES = new Set([
  'paragraph', 'h1', 'h2', 'h3', 'heading', 'bullet', 'numbered', 'todo',
  'quote', 'code', 'divider', 'table', 'board',
]);
const BLOCK_STYLE_FIELDS = new Set(['fontFamily', 'fontSize', 'color', 'bold', 'italic', 'underline']);
const FONT_FAMILIES = new Set(['Inter', 'Georgia', 'Arial', 'monospace']);
const FONT_SIZES = new Set(['12px', '14px', '16px', '18px', '24px', '32px']);

export const normalizeEmail = (email) => (typeof email === 'string' ? email.trim().toLowerCase() : '');

export const validateAuthInput = ({ name, email, password }, { requireName = false } = {}) => {
  const errors = {};
  const normalizedEmail = normalizeEmail(email);

  if (requireName && (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80)) {
    errors.name = 'Name must be between 2 and 80 characters';
  }
  if (!normalizedEmail || normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    errors.email = 'Please provide a valid email address';
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
    errors.password = 'Password must be between 6 and 128 characters';
  }

  return { errors, normalizedEmail };
};

const validateBlock = (block, index) => {
  if (!block || typeof block !== 'object' || Array.isArray(block)) return `content[${index}] must be an object`;
  if (typeof block.id !== 'string' || block.id.length < 1 || block.id.length > 100) return `content[${index}].id is invalid`;
  if (!DOCUMENT_BLOCK_TYPES.has(block.type)) return `content[${index}].type is invalid`;
  if (block.text !== undefined && (typeof block.text !== 'string' || block.text.length > 100000)) return `content[${index}].text is invalid`;
  if (block.style !== undefined) {
    const style = block.style;
    if (!style || typeof style !== 'object' || Object.keys(style).some((field) => !BLOCK_STYLE_FIELDS.has(field))) return `content[${index}].style is invalid`;
    if (style.fontFamily !== undefined && !FONT_FAMILIES.has(style.fontFamily)) return `content[${index}].style.fontFamily is invalid`;
    if (style.fontSize !== undefined && !FONT_SIZES.has(style.fontSize)) return `content[${index}].style.fontSize is invalid`;
    if (style.color !== undefined && !/^#[0-9a-f]{6}$/i.test(style.color)) return `content[${index}].style.color is invalid`;
    if (['bold', 'italic', 'underline'].some((field) => style[field] !== undefined && typeof style[field] !== 'boolean')) return `content[${index}].style value is invalid`;
  }
  return null;
};

export const validateDocumentInput = (payload = {}, { partial = false } = {}) => {
  const errors = {};
  const allowedFields = new Set(['title', 'icon', 'coverImage', 'content']);

  Object.keys(payload).forEach((field) => {
    if (!allowedFields.has(field)) errors[field] = 'This field is not allowed';
  });
  if (!partial || payload.title !== undefined) {
    if (typeof payload.title !== 'string' || payload.title.trim().length < 1 || payload.title.trim().length > 200) errors.title = 'Title must be between 1 and 200 characters';
  }
  if (payload.icon !== undefined && (typeof payload.icon !== 'string' || payload.icon.length > 20)) errors.icon = 'Icon must be a short string';
  if (payload.coverImage !== undefined && (typeof payload.coverImage !== 'string' || payload.coverImage.length > 500)) errors.coverImage = 'Cover image value is too long';
  if (payload.content !== undefined) {
    if (!Array.isArray(payload.content) || payload.content.length > 500) errors.content = 'Content must be an array with at most 500 blocks';
    else {
      const blockError = payload.content.map(validateBlock).find(Boolean);
      if (blockError) errors.content = blockError;
    }
  } else if (!partial) errors.content = 'Content must be an array';

  return errors;
};