/**
 * Follow Model
 * Represents a follow relationship between users
 */
export class Follow {
  constructor({
    id = '',
    followerId = '', // User who is following
    followingId = '', // User being followed
    createdAt = new Date(),
    followerName = '',
    followerPhotoURL = '',
    followingName = '',
    followingPhotoURL = '',
  } = {}) {
    this.id = id;
    this.followerId = followerId;
    this.followingId = followingId;
    this.createdAt = createdAt;
    this.followerName = followerName;
    this.followerPhotoURL = followerPhotoURL;
    this.followingName = followingName;
    this.followingPhotoURL = followingPhotoURL;
  }

  /**
   * Convert Follow instance to Firestore document
   */
  toFirestore() {
    return {
      followerId: this.followerId,
      followingId: this.followingId,
      createdAt: this.createdAt,
      followerName: this.followerName,
      followerPhotoURL: this.followerPhotoURL,
      followingName: this.followingName,
      followingPhotoURL: this.followingPhotoURL,
    };
  }

  /**
   * Create Follow instance from Firestore data
   */
  static fromFirestore(data, docId) {
    return new Follow({
      id: docId,
      ...data,
      createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    });
  }

  /**
   * Create Follow instance with partial fields
   */
  static create(fields = {}) {
    return new Follow(fields);
  }

  /**
   * Update Follow instance with new fields
   */
  update(fields = {}) {
    return new Follow({
      ...this,
      ...fields,
      createdAt: fields.createdAt !== undefined ? fields.createdAt : this.createdAt,
    });
  }
}
