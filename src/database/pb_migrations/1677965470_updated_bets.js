migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3rbjec6ovopch1m")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ut3idxcj",
    "name": "choices",
    "type": "select",
    "required": true,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "2",
        "3",
        "4"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3rbjec6ovopch1m")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "ut3idxcj",
    "name": "choices",
    "type": "select",
    "required": true,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "1",
        "2",
        "3",
        "4"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
