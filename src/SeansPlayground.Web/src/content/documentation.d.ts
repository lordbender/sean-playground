declare module "virtual:documentation" {
  export type DocumentationDocument = {
    id: string;
    title: string;
    sourcePath: string;
    content: string;
  };

  export const documents: DocumentationDocument[];
}
