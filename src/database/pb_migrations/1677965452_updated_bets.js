migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3rbjec6ovopch1m")

  // remove
  collection.schema.removeField("g10bb2cy")

  // add
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
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3rbjec6ovopch1m")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "g10bb2cy",
    "name": "field",
    "type": "editor",
    "required": false,
    "unique": false,
    "options": {}
  }))

  // remove
  collection.schema.removeField("ut3idxcj")

  return dao.saveCollection(collection)
})
