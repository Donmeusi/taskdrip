import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders the TaskDrip brand name", () => {
    render(<Home />);
    expect(screen.getByText("TaskDrip")).toBeDefined();
  });
});