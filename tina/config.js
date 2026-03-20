import { defineConfig } from "tinacms";

// Your hosting provider will pass these as environment variables
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: "935763c0-72f4-4aa9-9b54-fd54714412cc", // Get this from tina.io
  token: "6923928050f67581cc7a356c30b40aa470fb4f5b", // Get this from tina.io

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "assets",
      publicFolder: "public",
    },
  },
  schema: {
    collections: [
      {
        name: "edicao",
        label: "Edições",
        path: "src/edicoes",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Título",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Corpo do Texto",
            isBody: true,
          },
        ],
      },
    ],
  },
});
