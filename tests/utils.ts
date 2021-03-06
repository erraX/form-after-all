export const isReactive = (vueOb: any, key: string | number): boolean => {
  const descriptors = Object.getOwnPropertyDescriptor(vueOb, key);
  return !descriptors ? false : !!descriptors.get && !!descriptors.set;
};

export const flushPromises = () => new Promise(r => setTimeout(r, 0));
