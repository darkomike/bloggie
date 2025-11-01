import { TimeUtil } from '@/utils/timeUtils';

// Comment model for serialization and deserialization
export class Comment {
  constructor({ id, postId, user, text, createdAt, updatedAt }) {
    this.id = id || null;
    this.postId = postId || null;
    this.user = user || { id: null, name: 'Anonymous', email: null };
    this.text = text || '';
    this.createdAt = TimeUtil.toISOString(createdAt) || new Date().toISOString();
    this.updatedAt = TimeUtil.toISOString(updatedAt) || new Date().toISOString();
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Comment({
      id: doc.id,
      postId: data.postId,
      user: data.user,
      text: data.text,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  toFirestore() {
    return {
      postId: this.postId,
      user: this.user,
      text: this.text,
      createdAt: TimeUtil.toFirebaseTimestamp(this.createdAt),
      updatedAt: TimeUtil.toFirebaseTimestamp(this.updatedAt),
    };
  }

  copyWith({ id, postId, user, text, createdAt, updatedAt }) {
    return new Comment({
      id: id === undefined ? this.id : id,
      postId: postId === undefined ? this.postId : postId,
      user: user === undefined ? this.user : user,
      text: text === undefined ? this.text : text,
      createdAt: createdAt === undefined ? this.createdAt : TimeUtil.toISOString(createdAt),
      updatedAt: updatedAt === undefined ? this.updatedAt : TimeUtil.toISOString(updatedAt),
    });
  }
}


