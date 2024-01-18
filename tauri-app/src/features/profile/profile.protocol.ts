export const profileProtocol = {
  protocol: "https://netonomy.io/Profile",
  types: {
    profile: {
      schema: "https://netonomy.io/Profile",
      dataFormats: ["application/json"],
    },
  },
  structure: {
    profile: {
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
