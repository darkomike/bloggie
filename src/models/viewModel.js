export class View {
  constructor({ id, postId, userId, viewedAt, createdAt, isGuest }) {
    this.id = id || null;
    this.postId = postId || null;
    this.userId = userId || null;
    this.viewedAt = viewedAt || new Date().toISOString();
    this.createdAt = createdAt || new Date().toISOString();
    this.isGuest = typeof isGuest === 'boolean' ? isGuest : false;
  }

  static fromFirestore(doc) {
    const data = doc.data();
    return new View({
      id: doc.id,
      postId: data.postId,
      userId: data.userId,
      viewedAt: data.viewedAt?.toDate ? data.viewedAt.toDate().toISOString() : data.viewedAt,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
      isGuest: typeof data.isGuest === 'boolean' ? data.isGuest : false,
    });
  }

  toFirestore() {
    return {
      postId: this.postId,
      userId: this.userId,
      viewedAt: this.viewedAt ? new Date(this.viewedAt) : new Date(),
      createdAt: this.createdAt ? new Date(this.createdAt) : new Date(),
      isGuest: this.isGuest,
    };
  }

  copyWith({ id, postId, userId, viewedAt, createdAt, isGuest }) {
    return new View({
      id: id === undefined ? this.id : id,
      postId: postId === undefined ? this.postId : postId,
      userId: userId === undefined ? this.userId : userId,
      viewedAt: viewedAt === undefined ? this.viewedAt : viewedAt,
      createdAt: createdAt === undefined ? this.createdAt : createdAt,
      isGuest: isGuest === undefined ? this.isGuest : isGuest,
    });
  }
}