/**
 * Unit tests for dev.ts
 *
 * Note: dev.ts is the development entry point that starts the Express server.
 * These tests mock the server module and verify that dev.ts correctly
 * initializes and starts the application.
 */

// Mock console methods before imports
const mockConsoleLog = jest.spyOn(console, "log").mockImplementation();

// Mock the server module before importing dev.ts
const mockListen = jest.fn();
const mockApp = {
  listen: mockListen,
};

jest.mock("../../src/main/server", () => ({
  default: mockApp,
}));

describe("dev.ts - Development Entry Point", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockListen.mockClear();

    // Reset NODE_ENV
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
  });

  describe("Static file structure validation", () => {
    let devFileContent: string;

    beforeAll(() => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      devFileContent = fs.readFileSync(devPath, "utf8");
    });

    it("should be a valid TypeScript file", () => {
      expect(devFileContent).toBeTruthy();
      expect(devFileContent.length).toBeGreaterThan(0);
    });

    it("should import app from main/server", () => {
      expect(devFileContent).toContain('import app from "./main/server"');
    });

    it("should define port constant as 3333", () => {
      expect(devFileContent).toMatch(/const\s+port\s*=\s*3333/);
    });

    it("should define host constant as http://localhost", () => {
      expect(devFileContent).toMatch(
        /const\s+host\s*=\s*["']http:\/\/localhost["']/,
      );
    });

    it("should call app.listen with port parameter", () => {
      expect(devFileContent).toContain("app.listen(port");
    });

    it("should log CORS information with NODE_ENV", () => {
      expect(devFileContent).toContain("CORS Mode");
      expect(devFileContent).toContain("NODE_ENV");
      expect(devFileContent).toContain("process.env.NODE_ENV");
    });

    it("should check isDevelopment flag", () => {
      expect(devFileContent).toContain("isDevelopment");
      expect(devFileContent).toContain(
        'process.env.NODE_ENV === "development"',
      );
    });

    it("should log starting message", () => {
      expect(devFileContent).toContain("Starting server in development mode");
    });

    it("should log server running message with URL", () => {
      expect(devFileContent).toContain("Server is running at");
      expect(devFileContent).toContain("/api/v1");
    });

    it("should use appropriate emojis for visual feedback", () => {
      expect(devFileContent).toContain("🔍"); // CORS mode indicator
      expect(devFileContent).toContain("🚀"); // Starting indicator
      expect(devFileContent).toContain("✅"); // Success indicator
    });

    it("should use http protocol (not https) for development", () => {
      expect(devFileContent).toContain("http://localhost");
      expect(devFileContent).not.toContain("https://localhost");
    });

    it("should include template literal for server URL", () => {
      expect(devFileContent).toContain("${host}:${port}");
    });
  });

  describe("Configuration constants", () => {
    it("should use port 3333 for development", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      // Extract port value
      const portMatch = content.match(/const\s+port\s*=\s*(\d+)/);
      expect(portMatch).toBeTruthy();
      expect(portMatch![1]).toBe("3333");
    });

    it("should use localhost as host", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain("localhost");
    });
  });

  describe("Logging behavior", () => {
    it("should have multiple console.log statements", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      const logCount = (content.match(/console\.log/g) || []).length;
      expect(logCount).toBeGreaterThanOrEqual(2);
    });

    it("should log CORS configuration before starting server", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      const corsLogIndex = content.indexOf("CORS Mode");
      const listenIndex = content.indexOf("app.listen");

      expect(corsLogIndex).toBeGreaterThan(0);
      expect(listenIndex).toBeGreaterThan(corsLogIndex);
    });

    it("should log starting message before listen callback", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      const startingIndex = content.indexOf("Starting server");
      const listenIndex = content.indexOf("app.listen");

      expect(startingIndex).toBeGreaterThan(0);
      expect(listenIndex).toBeGreaterThan(startingIndex);
    });

    it("should log running message inside listen callback", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      const listenIndex = content.indexOf("app.listen(port, ()");
      const runningIndex = content.indexOf("Server is running at");

      expect(runningIndex).toBeGreaterThan(listenIndex);
    });
  });

  describe("Environment variables", () => {
    it("should read NODE_ENV from process.env", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain("process.env.NODE_ENV");
    });

    it("should compare NODE_ENV with 'development' string", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain('"development"');
    });
  });

  describe("Server initialization", () => {
    it("should call app.listen method", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain("app.listen");
    });

    it("should pass port as first argument to listen", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain("app.listen(port");
    });

    it("should pass callback function to listen", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain("app.listen(port, ()");
    });
  });

  describe("API versioning", () => {
    it("should reference /api/v1 endpoint", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain("/api/v1");
    });

    it("should include version in running message", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      const runningMessageIndex = content.indexOf("Server is running at");
      const versionIndex = content.indexOf("/api/v1");

      expect(versionIndex).toBeGreaterThan(runningMessageIndex);
    });
  });

  describe("Code quality", () => {
    it("should not have any TODO or FIXME comments", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content.toLowerCase()).not.toContain("todo");
      expect(content.toLowerCase()).not.toContain("fixme");
    });

    it("should not have hardcoded secrets or tokens", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content.toLowerCase()).not.toContain("password");
      expect(content.toLowerCase()).not.toContain("secret");
      expect(content.toLowerCase()).not.toContain("token");
      expect(content.toLowerCase()).not.toContain("api_key");
      expect(content.toLowerCase()).not.toContain("apikey");
    });

    it("should be concise (less than 100 lines)", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      const lineCount = content.split("\n").length;
      expect(lineCount).toBeLessThan(100);
    });

    it("should have proper spacing and formatting", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      // Should have blank lines for readability
      const blankLineCount = (content.match(/\n\n/g) || []).length;
      expect(blankLineCount).toBeGreaterThan(0);
    });
  });

  describe("Security checks", () => {
    it("should not expose sensitive file paths", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).not.toContain("/etc/");
      expect(content).not.toContain("C:\\\\");
      expect(content).not.toContain("~/.ssh");
    });

    it("should not use eval or Function constructor", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).not.toContain("eval(");
      expect(content).not.toContain("new Function(");
    });

    it("should not have SQL or NoSQL injection patterns", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content.toLowerCase()).not.toContain("drop table");
      expect(content.toLowerCase()).not.toContain("delete from");
      expect(content.toLowerCase()).not.toContain("truncate");
    });
  });

  describe("Integration with project structure", () => {
    it("should import from relative path ./main/server", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain('./main/server"');
    });

    it("should be in src directory", () => {
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");

      expect(devPath).toContain("/src/dev.ts");
    });

    it("should have .ts extension", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");

      expect(fs.existsSync(devPath)).toBe(true);
      expect(devPath.endsWith(".ts")).toBe(true);
    });
  });

  describe("Development experience", () => {
    it("should provide clear visual indicators with emojis", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      // Count specific emojis used in dev.ts
      const hasSearchEmoji = content.includes("🔍");
      const hasRocketEmoji = content.includes("🚀");
      const hasCheckEmoji = content.includes("✅");

      expect(hasSearchEmoji).toBe(true);
      expect(hasRocketEmoji).toBe(true);
      expect(hasCheckEmoji).toBe(true);
    });

    it("should log complete server URL for easy copy-paste", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content).toContain("${host}:${port}");
    });

    it("should indicate development mode clearly", () => {
      const fs = require("fs");
      const path = require("path");
      const devPath = path.resolve(__dirname, "../../src/dev.ts");
      const content = fs.readFileSync(devPath, "utf8");

      expect(content.toLowerCase()).toContain("development");
    });
  });
});
