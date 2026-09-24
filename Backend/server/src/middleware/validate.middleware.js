import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      fields: errors.array().reduce((result, item) => {
        if (!result[item.path]) result[item.path] = item.msg;
        return result;
      }, {}),
    });
  }
  return next();
};

export default validateRequest;