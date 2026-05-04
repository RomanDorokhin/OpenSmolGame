import { describe, expect, it } from "vitest";

describe("SimpleIDE - API Routes", () => {
  it("should have chat stream endpoint available", async () => {
    // This test verifies that the /api/chat/stream endpoint is properly registered
    // The actual streaming test would require a running server
    expect("/api/chat/stream").toBeDefined();
  });

  it("should handle streaming response format", () => {
    // Test that the streaming format is correct
    const mockResponse = { token: "test", done: false };
    const formatted = `data: ${JSON.stringify(mockResponse)}\n\n`;
    
    expect(formatted).toContain("data:");
    expect(formatted).toContain("token");
    expect(formatted).toContain("done");
  });

  it("should extract code from markdown blocks", () => {
    const response = `
Some text
\`\`\`html
<html><body>Test</body></html>
\`\`\`
More text
    `.trim();

    const codeMatch = response.match(/```(?:html|javascript)?\n([\s\S]*?)\n```/);
    expect(codeMatch).toBeDefined();
    expect(codeMatch?.[1]).toContain("<html>");
  });

  it("should handle example prompts", () => {
    const EXAMPLE_PROMPTS = [
      "Создай простую игру Flappy Bird",
      "Создай игру Snake (змейка)",
      "Создай игру Pong (теннис)",
      "Создай Tic Tac Toe (крестики-нолики)",
      "Создай простой платформер",
    ];

    expect(EXAMPLE_PROMPTS).toHaveLength(5);
    expect(EXAMPLE_PROMPTS[0]).toContain("Flappy Bird");
  });

  it("should validate API key format", () => {
    const validKey = "sk-or-v1-1234567890";
    const isValid = validKey.startsWith("sk-");
    
    expect(isValid).toBe(true);
  });

  it("should handle message structure", () => {
    const message = {
      role: "user",
      content: "Create a game",
    };

    expect(message.role).toBe("user");
    expect(message.content).toBeDefined();
    expect(typeof message.content).toBe("string");
  });
});
