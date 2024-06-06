import { HomePage } from "@/frontend/pages/home";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("HomePage", () => {
  test("should be able to render a heading", () => {
    render(<HomePage />);

    expect(screen.getByText("ForceMap")).toBeDefined();
  });
});
