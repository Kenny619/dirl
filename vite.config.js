
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
	},
	files: ["./tests/*.test.ts"], // Adjust the pattern to match your test files
	extensions: ["ts"],
	require: ["ts-node/register"], // Use ts-node to execute TypeScript files directly
});