migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5728gsvffntrvuy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "y5yilh1g",
    "name": "bets",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5728gsvffntrvuy")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "y5yilh1g",
    "name": "bet",
    "type": "json",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
})
