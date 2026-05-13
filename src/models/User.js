export class User {
  constructor(id, username, socket, room = 'general') {
    this.id = id;
    this.username = username;
    this.socket = socket;
    this.room = room;
    this.joinedAt = new Date();
    this.isActive = true;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      room: this.room,
      joinedAt: this.joinedAt.toISOString(),
      isActive: this.isActive
    };
  }
}