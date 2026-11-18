import { mount } from "./atlas.mjs";
mount(
  document,
  {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  },
  () => new Date(),
);
