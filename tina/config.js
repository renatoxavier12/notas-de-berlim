import { defineConfig } from "tinacms";

// Your hosting provider will pass these as environment variables
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: null, // Get this from tina.io
  token: null, // Get this from tina.io

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
