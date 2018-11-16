// Generate random hash to bucket user into a random variation via cookie
const getRandomHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

module.exports = getRandomHash;