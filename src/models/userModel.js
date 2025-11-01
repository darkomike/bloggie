// User model for Firestore
export class UserModel {
  constructor({
    uid = '',
    username = '', // New: unique username for public profile
    name = '',
    displayName = '',
    email = '',
    avatar = '',
    photoURL = '',
    bio = '',
    github = '',
    linkedin = '',
    twitter = '',
    website = '',
    createdAt = null,
    updatedAt = null,
    role = 'user', // user, admin, etc.
    status = 'active', // active, banned, etc.
  } = {}) {
    this.uid = uid;
    this.username = username;
    this.name = name;
    this.displayName = displayName;
    this.email = email;
    this.avatar = avatar;
    this.photoURL = photoURL;
    this.bio = bio;
    this.github = github;
    this.linkedin = linkedin;
    this.twitter = twitter;
    this.website = website;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.role = role;
    this.status = status;
  }

  static fromFirestore(doc) {
    const data = doc.data ? doc.data() : doc;
    return new UserModel({
      uid: doc.id || data.uid || '',
      username: data.username || '',
      name: data.name || '',
      displayName: data.displayName || '',
      email: data.email || '',
      avatar: data.avatar || '',
      photoURL: data.photoURL || '',
      bio: data.bio || '',
      github: data.github || '',
      linkedin: data.linkedin || '',
      twitter: data.twitter || '',
      website: data.website || '',
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null,
      role: data.role || 'user',
      status: data.status || 'active',
    });
  }

  toFirestore() {
    return {
      uid: this.uid,
      username: this.username,
      name: this.name,
      displayName: this.displayName,
      email: this.email,
      avatar: this.avatar,
      photoURL: this.photoURL,
      bio: this.bio,
      github: this.github,
      linkedin: this.linkedin,
      twitter: this.twitter,
      website: this.website,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      role: this.role,
      status: this.status,
    };
  }

  copyWith(fields = {}) {
    return new UserModel({
      uid: fields.uid !== undefined ? fields.uid : this.uid,
      username: fields.username !== undefined ? fields.username : this.username,
      name: fields.name !== undefined ? fields.name : this.name,
      displayName: fields.displayName !== undefined ? fields.displayName : this.displayName,
      email: fields.email !== undefined ? fields.email : this.email,
      avatar: fields.avatar !== undefined ? fields.avatar : this.avatar,
      photoURL: fields.photoURL !== undefined ? fields.photoURL : this.photoURL,
      bio: fields.bio !== undefined ? fields.bio : this.bio,
      github: fields.github !== undefined ? fields.github : this.github,
      linkedin: fields.linkedin !== undefined ? fields.linkedin : this.linkedin,
      twitter: fields.twitter !== undefined ? fields.twitter : this.twitter,
      website: fields.website !== undefined ? fields.website : this.website,
      createdAt: fields.createdAt !== undefined ? fields.createdAt : this.createdAt,
      updatedAt: fields.updatedAt !== undefined ? fields.updatedAt : this.updatedAt,
      role: fields.role !== undefined ? fields.role : this.role,
      status: fields.status !== undefined ? fields.status : this.status,
    });
  }
}

