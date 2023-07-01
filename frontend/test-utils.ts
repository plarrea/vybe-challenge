/* eslint-disable import/export */
import { render } from "@testing-library/react";

const customRender = (ui: any, options = {}) => {
  return render(ui, {
    wrapper: ({ children }) => children,
    ...options,
  });
};

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
export { customRender as render };