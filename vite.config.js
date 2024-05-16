import path from "node:path";
import { defineConfig } from "vitest/config";
export default defineConfig({
	test: {
		globals: true,
		resolve: {
			alias: {
				"/@/": path.resolve(__dirname, "./src"),
				"/@types/": path.resolve(__dirname, "./types"),
			},
		},
	},
	files: ["./tests/*.test.ts"], // Adjust the pattern to match your test files
	extensions: ["ts"],
	require: ["ts-node/register"], // Use ts-node to execute TypeScript files directly
});

// export default defineConfig({
// 	test: {
// 		globals: true,
// 		environment: "node",
// 		transformMode: {
// 			web: [/\.[jt]sx?$/],
// 		},
// 		transform: {
// 			"^.+\\.[jt]sx?$": "ts-jest",
// 		},
// 		// resolver: "@vitest/resolver",
// 		// alias: {
// 		// 	"~": resolve(__dirname, "src"),
// 		// },
// 	},
// });
