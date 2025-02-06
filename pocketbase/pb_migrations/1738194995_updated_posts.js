/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1125843985");

    // update field
    collection.fields.addAt(
      1,
      new Field({
        autogeneratePattern: "",
        hidden: false,
        id: "text724990059",
        max: 0,
        min: 0,
        name: "title",
        pattern: "",
        presentable: false,
        primaryKey: false,
        required: true,
        system: false,
        type: "text",
      }),
    );

    // update field
    collection.fields.addAt(
      4,
      new Field({
        convertURLs: false,
        hidden: false,
        id: "editor4274335913",
        maxSize: 0,
        name: "content",
        presentable: false,
        required: true,
        system: false,
        type: "editor",
      }),
    );

    return app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("pbc_1125843985");

    // update field
    collection.fields.addAt(
      1,
      new Field({
        autogeneratePattern: "",
        hidden: false,
        id: "text724990059",
        max: 0,
        min: 0,
        name: "title",
        pattern: "",
        presentable: false,
        primaryKey: false,
        required: false,
        system: false,
        type: "text",
      }),
    );

    // update field
    collection.fields.addAt(
      5,
      new Field({
        convertURLs: false,
        hidden: false,
        id: "editor4274335913",
        maxSize: 0,
        name: "content",
        presentable: false,
        required: false,
        system: false,
        type: "editor",
      }),
    );

    return app.save(collection);
  },
);
