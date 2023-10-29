export interface Backend
{
    compile (llvmIr: string, fileName: string, temporaryDirectoryPath: string): string;
    link (inputFilePath: string, runtimeLibraryPath: string, outputFilePath: string): void;
}
