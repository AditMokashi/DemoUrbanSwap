const validateRegistration = (req, res, next) => {
  const { email, password, full_name, location } = req.body;
  const errors = [];

  // Email validation
  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Name validation
  if (!full_name || full_name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters');
  }

  // Location validation
  if (!location || location.trim().length < 2) {
    errors.push('Location is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateListing = (req, res, next) => {
  const { title, description, category, location } = req.body;
  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Title is required and must be at least 3 characters');
  }

  if (!description || description.trim().length < 10) {
    errors.push('Description is required and must be at least 10 characters');
  }

  if (!category || !['Urban Goods', 'Skills Exchange', 'Community Hub'].includes(category)) {
    errors.push('Valid category is required');
  }

  if (!location || location.trim().length < 2) {
    errors.push('Location is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateListing
};