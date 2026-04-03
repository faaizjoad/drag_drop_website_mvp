import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddPageButton } from "@/components/dashboard/add-page-button";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

// Mock the createPage server action
vi.mock("@/lib/actions/pages", () => ({
  createPage: vi.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  // Return empty user templates by default
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AddPageButton", () => {
  it("renders the Add Page button", () => {
    render(<AddPageButton siteId="site-1" />);
    expect(screen.getByRole("button", { name: /add page/i })).toBeInTheDocument();
  });

  it("opens the template picker on click", async () => {
    const user = userEvent.setup();
    render(<AddPageButton siteId="site-1" />);

    await user.click(screen.getByRole("button", { name: /add page/i }));

    expect(screen.getByText("Choose a template")).toBeInTheDocument();
  });

  it("transitions to details step when a template is selected", async () => {
    const user = userEvent.setup();
    render(<AddPageButton siteId="site-1" />);

    // Open template picker
    await user.click(screen.getByRole("button", { name: /add page/i }));
    expect(screen.getByText("Choose a template")).toBeInTheDocument();

    // Click the first built-in template ("Blank page")
    await user.click(screen.getByText("Blank page"));

    // Template picker should be gone; details modal should appear
    await waitFor(() => {
      expect(screen.queryByText("Choose a template")).not.toBeInTheDocument();
      expect(screen.getByText("Page details")).toBeInTheDocument();
    });
  });

  it("shows page title and path inputs in the details step", async () => {
    const user = userEvent.setup();
    render(<AddPageButton siteId="site-1" />);

    await user.click(screen.getByRole("button", { name: /add page/i }));
    await user.click(screen.getByText("Blank page"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("About Us")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("/about")).toBeInTheDocument();
    });
  });

  it("Back button returns to the template picker", async () => {
    const user = userEvent.setup();
    render(<AddPageButton siteId="site-1" />);

    await user.click(screen.getByRole("button", { name: /add page/i }));
    await user.click(screen.getByText("Blank page"));

    await waitFor(() => {
      expect(screen.getByText("Page details")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /← back/i }));

    await waitFor(() => {
      expect(screen.getByText("Choose a template")).toBeInTheDocument();
    });
  });

  it("closes everything when Cancel is clicked from details step", async () => {
    const user = userEvent.setup();
    render(<AddPageButton siteId="site-1" />);

    await user.click(screen.getByRole("button", { name: /add page/i }));
    await user.click(screen.getByText("Blank page"));

    await waitFor(() => {
      expect(screen.getByText("Page details")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByText("Page details")).not.toBeInTheDocument();
    expect(screen.queryByText("Choose a template")).not.toBeInTheDocument();
  });

  it("submits with correct data when form is filled", async () => {
    const { createPage } = await import("@/lib/actions/pages");
    const user = userEvent.setup();
    render(<AddPageButton siteId="site-1" />);

    await user.click(screen.getByRole("button", { name: /add page/i }));
    await user.click(screen.getByText("Landing page"));

    await waitFor(() => {
      expect(screen.getByText("Page details")).toBeInTheDocument();
    });

    await user.clear(screen.getByPlaceholderText("About Us"));
    await user.type(screen.getByPlaceholderText("About Us"), "My Page");

    // Path starts as "/"; type the suffix so onChange sees "/my-page"
    await user.type(screen.getByPlaceholderText("/about"), "my-page");

    await user.click(screen.getByRole("button", { name: /create page/i }));

    await waitFor(() => {
      expect(createPage).toHaveBeenCalledWith(
        "site-1",
        "My Page",
        "/my-page",
        expect.any(Object) // the selected template's puckData
      );
    });
  });

  it("disables Create button when title is empty", async () => {
    const user = userEvent.setup();
    render(<AddPageButton siteId="site-1" />);

    await user.click(screen.getByRole("button", { name: /add page/i }));
    await user.click(screen.getByText("Blank page"));

    await waitFor(() => {
      const createBtn = screen.getByRole("button", { name: /create page/i });
      expect(createBtn).toBeDisabled();
    });
  });
});
