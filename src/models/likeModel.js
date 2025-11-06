import { TimeUtil } from '@/utils/timeUtils';


export class Like {
  constructor({ id, postId, user, likedAt, createdAt, isGuest }) {
    this.id = id || null;
    this.postId = postId || null;
    this.user = user || { id: null, name: 'Anonymous', email: null, username: null };
    this.likedAt = likedAt || new Date().toISOString();
    this.createdAt = createdAt || new Date().toISOString();
    this.isGuest = typeof isGuest === 'boolean' ? isGuest : false;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Like({
      id: doc.id,
      postId: data.postId,
      user: data.user,
      likedAt: data.likedAt?.toDate ? data.likedAt.toDate().toISOString() : data.likedAt,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      isGuest: typeof data.isGuest === 'boolean' ? data.isGuest : false,
    });
  }

  toFirestore() {
    return {
      postId: this.postId,
      user: this.user,
      likedAt: this.likedAt ? new Date(this.likedAt) : new Date(),
      createdAt: this.createdAt ? new Date(this.createdAt) : new Date(),
      isGuest: this.isGuest,
    };
  }

  copyWith({ id, postId, user, likedAt, createdAt, isGuest }) {
    return new Like({
      id: id === undefined ? this.id : id,
      postId: postId === undefined ? this.postId : postId,
      user: user === undefined ? this.user : user,
      likedAt: likedAt === undefined ? this.likedAt : likedAt,
      createdAt: createdAt === undefined ? this.createdAt : createdAt,
      isGuest: isGuest === undefined ? this.isGuest : isGuest,
    });
  }
}
