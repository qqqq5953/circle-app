async function updateDb(ref, childName, content) {
  ref.child(childName).update(content)
}

module.exports = updateDb
