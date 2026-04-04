import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TemplatePicker } from "@/components/dashboard/template-picker";
import { BUILTIN_TEMPLATES } from "@/lib/templates/index";

// Mock fetch for user templates endpoint
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TemplatePicker", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <TemplatePicker open={false} onClose={vi.fn()} onSelect={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders built-in template cards when open", async () => {
    render(
      <TemplatePicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />
    );
    for (const tpl of BUILTIN_TEMPLATES) {
      expect(screen.getByText(tpl.name)).toBeInTheDocument();
    }
  });

  it("calls onSelect with the correct puckData when a built-in template is clicked", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TemplatePicker open={true} onClose={onClose} onSelect={onSelect} />
    );

    const firstTemplate = BUILTIN_TEMPLATES[0];
    await user.click(screen.getByText(firstTemplate.name));

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(firstTemplate.puckData);
  });

  it("does NOT call onClose when a built-in template is selected (regression: bug fix)", async () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TemplatePicker open={true} onClose={onClose} onSelect={onSelect} />
    );

    await user.click(screen.getByText(BUILTIN_TEMPLATES[1].name));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the X button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TemplatePicker open={true} onClose={onClose} onSelect={vi.fn()} />
    );

    await user.click(screen.getByRole("button", { name: "" }));
    // The X icon button — find by its surrounding context
    const closeBtn = document.querySelector('button svg')?.closest("button") as HTMLElement;
    await user.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when clicking the backdrop", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    const { container } = render(
      <TemplatePicker open={true} onClose={onClose} onSelect={vi.fn()} />
    );

    // The outermost backdrop div is the first child
    const backdrop = container.firstChild as HTMLElement;
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <TemplatePicker open={true} onClose={onClose} onSelect={vi.fn()} />
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });

  it("fetches user templates when opened", async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => [] });
    vi.stubGlobal("fetch", mockFetch);

    render(
      <TemplatePicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/templates");
    });
  });

  it("displays user saved templates when they exist", async () => {
    const userTemplates = [
      { id: "ut1", name: "My Custom Template", isPublic: false, createdAt: "2024-01-15T00:00:00Z" },
    ];
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => userTemplates })
    );

    render(
      <TemplatePicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText("My Custom Template")).toBeInTheDocument();
    });
    expect(screen.getByText("Your saved templates")).toBeInTheDocument();
  });

  it("does not show user templates section when list is empty", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));

    render(
      <TemplatePicker open={true} onClose={vi.fn()} onSelect={vi.fn()} />
    );

    await waitFor(() => {
      // Just ensure the fetch completed (loading is gone)
      expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
    });

    expect(screen.queryByText("Your saved templates")).not.toBeInTheDocument();
  });
});
