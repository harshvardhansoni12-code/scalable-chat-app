import { config } from '../config/config.js';

export function validateMessage(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }

  const trimmed = content.trim();
  
  if (trimmed.length === 0 || trimmed.length > config.MAX_MESSAGE_LENGTH) {
    return false;
  }

  // Basic content filtering (you can expand this)
  const forbiddenPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i
  ];

  return !forbiddenPatterns.some(pattern => pattern.test(content));
}

export function validateRoom(roomName) {
  if (!roomName || typeof roomName !== 'string') {
    return false;
  }

  const trimmed = roomName.trim();
  return trimmed.length >= 1 && 
         trimmed.length <= 50 && 
         /^[a-zA-Z0-9_-]+$/.test(trimmed);
}