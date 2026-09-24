import { body } from 'express-validator';

const email = body('email')
  .exists({ checkFalsy: true }).withMessage('Email is required').bail()
  .isEmail().withMessage('Please provide a valid email address').bail()
  .normalizeEmail()
  .isLength({ max: 254 }).withMessage('Email cannot exceed 254 characters');

const password = body('password')
  .exists({ checkFalsy: true }).withMessage('Password is required').bail()
  .isString().withMessage('Password must be a string').bail()
  .isLength({ min: 6, max: 128 }).withMessage('Password must be between 6 and 128 characters');

export const registerValidator = [
  body('name')
    .exists({ checkFalsy: true }).withMessage('Name is required').bail()
    .isString().withMessage('Name must be a string').bail()
    .trim()
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  email,
  password,
];

export const loginValidator = [email, password];