import TestFiles from "../../tests/createTestFiles";

/*
creates 6 subdirectories and 12 files.

Directories:
/root/
/root//tier2/
/root/tier2/tier3/
/root/duplicates/
/root/empty/
/root/empty/secondEmpty/

Files:
root/tier1.log
root/tier1.png
root/tier1.zip
root/tier2/tier2.log
root/tier2/tier2.png
root/tier2/tier2.zip
root/tier2/tier3/tier3.log
root/tier2/tier3/tier3.png
root/tier2/tier3/tier3.zip
root/duplicates/logFile.log
root/duplicates/portableGraphic.png
root/duplicates/windowsAudio.wav

*/

export const generateTestFiles = async (root: string, dstDir: string) => {
	const tests = new TestFiles(dstDir);
	await tests.clear();
	tests.changeRoot(root);
	await tests.clear();

	await tests.create("./tier1.log", 1024, "0");
	await tests.create("./tier1.png", 2048, "0");
	await tests.create("./tier1.zip", 3072, "0");

	await tests.create("./tier2/tier2.log", 1024, "1");
	await tests.create("./tier2/tier2.png", 2048, "1");
	await tests.create("./tier2/tier2.zip", 3072, "1");

	await tests.create("./tier2/tier3/tier3.log", 1024, "1");
	await tests.create("./tier2/tier3/tier3.png", 2048, "1");
	await tests.create("./tier2/tier3/tier3.zip", 3072, "1");

	await tests.create("./duplicate/logFile.log", 1024, "0");
	await tests.create("./duplicate/portableGraphic.png", 2048, "0");
	await tests.create("./duplicate/windowsAudio.wav", 3072, "0");
	await tests.createDir("./empty");
	await tests.createDir("./empty/secondEmpty");
};
