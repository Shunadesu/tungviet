export const cn = (...args) => {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .filter((x) => typeof x === 'string' || typeof x === 'number')
    .join(' ')
    .trim();
};