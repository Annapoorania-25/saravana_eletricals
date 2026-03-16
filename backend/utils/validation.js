const validateEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateProduct = (product) => {
  const errors = [];
  if (!product.name) errors.push('Name is required');
  if (!product.price || product.price < 0) errors.push('Valid price is required');
  if (!product.category) errors.push('Category is required');
  if (product.stock === undefined || product.stock < 0) errors.push('Valid stock is required');
  return errors;
};

module.exports = { validateEmail, validatePassword, validateProduct };