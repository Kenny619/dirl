import TestFiles from "tests/createTestFiles";

export const generateTestFiles = async (src: string, dst: string) => {
	const tests = new TestFiles(src);
	await tests.clear();

	await tests.create("./test.log", 1024, "0");
	await tests.create("./test.png", 2048, "0");
	await tests.create("./test.rar", 3072, "0");

	await tests.create("./tier1.log", 1024, "0");
	await tests.create("./tier1.png", 2048, "0");
	await tests.create("./tier1.zip", 3072, "0");

	await tests.create("./tier2/tier2.log", 1024, "1");
	await tests.create("./tier2/tier2.png", 2048, "1");
	await tests.create("./tier2/tier2.zip", 3072, "1");

	await tests.create("./filterTest/logs.log", 1024, "1");
	await tests.create("./filterTest/image.png", 2048, "1");
	await tests.create("./filterTest/audio.wma", 2048, "1");
	await tests.create("./filterTest/zipped.zip", 3072, "1");

	await tests.create("./duplicate/logFile.log", 1024, "0");
	await tests.create("./duplicate/portableGraphic.png", 2048, "0");
	await tests.create("./duplicate/windowsAudio.wav", 3072, "0");

	await tests.createDir("./empty");
	await tests.createDir("./empty/secondEmpty");

	await tests.createDir("./validDir");
	await tests.createDir("./validDir/secondValidDir");
	await tests.create("./validDir/secondValidDir/validFile.txt", 1024, "0");
	await tests.createDir("./relativePathSrc");
	await tests.createDir("./relativePathDst");
	await tests.createDir("./absolutePathSrc");
	await tests.createDir("./absolutePathDst");

	//for IfNew
	tests.changeRoot(dst);
	await tests.clear();
	await tests.create("./test.log", 1024, "0");
	await tests.create("./test.png", 2048, "0");
	await tests.create("./test.rar", 3072, "0");

	await tests.create("./tier1.log", 1024, "0");
	await tests.create("./tier1.png", 2048, "0");
	await tests.create("./tier1.zip", 3072, "0");

	await tests.create("./tier2/tier2.log", 1024, "1");
	await tests.create("./tier2/tier2.png", 2048, "1");
	await tests.create("./tier2/tier2.zip", 3072, "1");

	await tests.create("./filterTest/logs.log", 1024, "1");
	await tests.create("./filterTest/image.png", 2048, "1");
	await tests.create("./filterTest/audio.wma", 2048, "1");
	await tests.create("./filterTest/zipped.zip", 3072, "1");

	await tests.create("./duplicate/logFile.log", 1024, "0");
	await tests.create("./duplicate/portableGraphic.png", 2048, "0");
	await tests.create("./duplicate/windowsAudio.wav", 3072, "0");

	await tests.createDir("./empty");
	await tests.createDir("./empty/secondEmpty");

	await tests.createDir("./validDir");
	await tests.createDir("./validDir/secondValidDir");
	await tests.create("./validDir/secondValidDir/validFile.txt", 1024, "0");
	await tests.createDir("./relativePathSrc");
	await tests.createDir("./relativePathDst");
	await tests.createDir("./absolutePathSrc");
	await tests.createDir("./absolutePathDst");
};
