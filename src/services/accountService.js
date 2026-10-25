// Per-user orders, addresses and rewards, kept in localStorage (demo only: there is no order backend).
import { storage, userKey } from '../utils/storage.js';
import { ACHIEVEMENTS } from '../data/achievements.js';

const today = () => new Date().toISOString().split('T')[0];
const arr = (v) => (Array.isArray(v) ? v : []);

// ---- Orders ----
export const getOrders = (userId) => arr(storage.get(userKey(userId, 'orders'), []));
const saveOrders = (userId, orders) => storage.set(userKey(userId, 'orders'), orders);

export const createOrderId = () => `NT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

export function addOrder(userId, order) {
  saveOrders(userId, [order, ...getOrders(userId)]);
  const points = Math.round(order.total * 0.1);
  addRewardPoints(userId, points, `Purchase Cashback #${order.id}`);
  const unlocked = evaluateAchievements(userId);
  return { points, unlocked };
}

export function updateOrder(userId, orderId, patch) {
  const orders = getOrders(userId).map((o) => (o.id === orderId ? { ...o, ...patch } : o));
  saveOrders(userId, orders);
  return orders;
}

// ---- Addresses ----
export const getAddresses = (userId) => arr(storage.get(userKey(userId, 'addresses'), []));
export const saveAddresses = (userId, list) => storage.set(userKey(userId, 'addresses'), list);

// ---- Rewards ----
const defaultRewards = () => ({
  points: 100,
  unlockedAchievements: [],
  history: [{ action: 'Created Account', points: 100, date: today() }],
});

export function getRewards(userId) {
  const r = storage.get(userKey(userId, 'rewards'), null);
  if (!r || typeof r.points !== 'number') return defaultRewards();
  return { points: r.points, unlockedAchievements: arr(r.unlockedAchievements), history: arr(r.history) };
}
const saveRewards = (userId, r) => storage.set(userKey(userId, 'rewards'), r);

export function addRewardPoints(userId, points, action) {
  if (!(points > 0)) return;
  const r = getRewards(userId);
  saveRewards(userId, { ...r, points: r.points + points, history: [{ action, points, date: today() }, ...r.history] });
}

/** Idempotently unlock achievements. Returns the list of newly unlocked ones. */
export function evaluateAchievements(userId, { wishlistCount = 0, explored = false } = {}) {
  const r = getRewards(userId);
  const unlocked = new Set(r.unlockedAchievements);
  const orders = getOrders(userId);
  const newly = [];
  const unlock = (id) => {
    if (unlocked.has(id)) return;
    const a = ACHIEVEMENTS.find((x) => x.id === id);
    if (!a) return;
    unlocked.add(id);
    newly.push(a);
  };
  const items = orders.reduce((n, o) => n + arr(o.items).reduce((s, i) => s + (i.quantity || 0), 0), 0);
  const spend = orders.reduce((s, o) => s + (o.total || 0), 0);
  if (wishlistCount > 0) unlock('first_wishlist');
  if (explored) unlock('explorer');
  if (orders.length >= 1) unlock('first_purchase');
  if (orders.length >= 2) unlock('repeat_customer');
  if (items >= 3) unlock('three_products');
  if (spend >= 5000) unlock('spend_5000');
  if (spend >= 10000) unlock('spend_10000');
  if (orders.some((o) => arr(o.items).some((i) => (i.discount || 0) >= 20))) unlock('deal_hunter');
  if (!newly.length) return [];
  const bonus = newly.reduce((s, a) => s + a.points, 0);
  saveRewards(userId, {
    points: r.points + bonus,
    unlockedAchievements: [...unlocked],
    history: [...newly.map((a) => ({ action: `Unlocked Achievement: ${a.name}`, points: a.points, date: today() })), ...r.history],
  });
  return newly;
}
