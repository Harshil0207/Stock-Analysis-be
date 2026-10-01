export const addMinutesToCurrentDate = (minutes) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

export const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [name, domain] = email.split('@');
  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }
  return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
};

export const isExpired = (date) => {
  return new Date(date).getTime() < Date.now();
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

