migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3rbjec6ovopch1m")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "mqlv2na3",
    "name": "timelimit",
    "type": "date",
    "required": true,
    "unique": false,
    "options": {
      "min": "",
      "max": ""
    }
  }))

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

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("3rbjec6ovopch1m")

  // remove
  collection.schema.removeField("mqlv2na3")

  // remove
  collection.schema.removeField("g10bb2cy")

  return dao.saveCollection(collection)
})
