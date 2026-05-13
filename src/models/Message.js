export class Message {
  constructor(id, username, content, timestamp = new Date(), room = 'general') {
    this.id = id;
    this.username = username;
    this.content = content;
    this.timestamp = timestamp;
    this.room = room;
  }

  toJSON() {
    return {
      id: this.id,
      username: this.username,
      content: this.content,
      timestamp: this.timestamp.toISOString(),
      room: this.room
    };
  }

  static fromJSON(data) {
    return new Message(
      data.id,
      data.username,
      data.content,
      new Date(data.timestamp),
      data.room
    );
  }
}