/**
 * The `clientId`s of orders taken on this device since the page loaded. The live stream sends them back like anyone
 * else's; this device does not chime for them, since the person here just took them.
 */
const ownOrders = new Set<string>();

export default ownOrders;
