migrate((db) => {
  const collection = new Collection({
    "id": "5728gsvffntrvuy",
    "created": "2023-03-03 23:22:52.031Z",
    "updated": "2023-03-03 23:22:52.031Z",
    "name": "users",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "ruldoa0a",
        "name": "username",
        "type": "text",
        "required": true,
        "unique": true,
        "options": {
          "min": null,
          "max": 25,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "omh6mkbc",
        "name": "password",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "87ih4oiq",
        "name": "points",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null
        }
      },
      {
        "system": false,
        "id": "y5yilh1g",
        "name": "bet",
        "type": "json",
        "required": false,
        "unique": false,
        "options": {}
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
  const collection = dao.findCollectionByNameOrId("5728gsvffntrvuy");

  return dao.deleteCollection(collection);
})
