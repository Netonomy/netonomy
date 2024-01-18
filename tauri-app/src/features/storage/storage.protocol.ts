export const storageProtocol = {
  protocol: "https://netonomy.io/storage",
  types: {
    document: {
      schema: "http://netonomy.io/storage/document",
      dataFormats: ["application/json"],
    },
  },
  structure: {
    document: {
      $actions: [
        {
          who: "anyone",
          can: "read",
        },
        {
          who: "anyone",
          can: "write",
        },
      ],
    },
  },
  published: true,
};
