migrate((db) => {
  const collection = new Collection({
    "id": "3rbjec6ovopch1m",
    "created": "2023-03-04 17:15:05.333Z",
    "updated": "2023-03-04 17:15:05.333Z",
    "name": "bets",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "cvhxrqm6",
        "name": "question",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("3rbjec6ovopch1m");

  return dao.deleteCollection(collection);
})
