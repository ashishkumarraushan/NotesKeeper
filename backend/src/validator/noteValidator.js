const { body, validationResult } = require("express-validator");

// Validation Rules
exports.validateNote = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("content")
    .notEmpty()
    .withMessage("Content is required"),
];

// Handle Validation Errors
exports.handleValidationErrors = (
  req,
  res,
  next
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  next();
};