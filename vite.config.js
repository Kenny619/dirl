
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths"; // enable tsconfig path in test files.

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
	},
	files: ["./tests/*.test.ts"], // Adjust the pattern to match your test files
	extensions: ["ts"],
	require: ["ts-node/register"], // Use ts-node to execute TypeScript files directly
});