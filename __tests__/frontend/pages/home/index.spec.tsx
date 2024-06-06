import { HomePage } from "@/frontend/pages/home";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("HomePage", () => {
  test("should be able to render a header", () => {
    render(<HomePage />);

    expect(screen.getAllByText("ForceMap")).toBeDefined();
  });
  test("should be able to render a main", () => {
    render(<HomePage />);

    expect(screen.getAllByText("Em desenvolvimento...")).toBeDefined();
  });
  test("should be able to render a footer", () => {
    render(<HomePage />);

    expect(screen.getAllByText("A&T Desenvolvimento Web")).toBeDefined();
  });
});
