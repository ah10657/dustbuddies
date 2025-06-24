// lib/getUserId.js
import { auth } from './firebase';

const fallbackUserId = 'VuoNhIFyleph42rgqis5'; // ← your dev user
export function getUserId() {
  return auth.currentUser?.uid || fallbackUserId;
}
