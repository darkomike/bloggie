export class Share {
  constructor({ id, postId, user, platform, sharedAt, createdAt, isGuest }) {
    this.id = id || null;
    this.postId = postId || null;
    this.user = user || { id: null, name: 'Anonymous', email: null };
    this.platform = platform || 'unknown';
    this.sharedAt = sharedAt || new Date().toISOString();
    this.createdAt = createdAt || new Date().toISOString();
    this.isGuest = typeof isGuest === 'boolean' ? isGuest : false;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new Share({
      id: doc.id,
      postId: data.postId,
      user: data.user,
      platform: data.platform,
      sharedAt: data.sharedAt?.toDate ? data.sharedAt.toDate().toISOString() : data.sharedAt,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      isGuest: typeof data.isGuest === 'boolean' ? data.isGuest : false,
    });
  }

  toFirestore() {
    return {
      postId: this.postId,
      user: this.user,
      platform: this.platform,
      sharedAt: this.sharedAt ? new Date(this.sharedAt) : new Date(),
      createdAt: this.createdAt ? new Date(this.createdAt) : new Date(),
      isGuest: this.isGuest,
    };
  }

  copyWith({ id, postId, user, platform, sharedAt, createdAt, isGuest }) {
    return new Share({
      id: id === undefined ? this.id : id,
      postId: postId === undefined ? this.postId : postId,
      user: user === undefined ? this.user : user,
      platform: platform === undefined ? this.platform : platform,
      sharedAt: sharedAt === undefined ? this.sharedAt : sharedAt,
      createdAt: createdAt === undefined ? this.createdAt : createdAt,
      isGuest: isGuest === undefined ? this.isGuest : isGuest,
    });
  }
}
