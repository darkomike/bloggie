class NewsletterModel {
  constructor({ id = '', email = '', subscribedAt = null }) {
    this.id = id;
    this.email = email;
    this.subscribedAt = subscribedAt;
  }

  static fromFirestore(doc) {
    const data = doc.data ? doc.data() : doc;
    return new NewsletterModel({
      id: doc.id || data.id || '',
      email: data.email || '',
      subscribedAt: data.subscribedAt || null,
    });
  }

  toFirestore() {
    return {
      id: this.id,
      email: this.email,
      subscribedAt: this.subscribedAt,
    };
  }

  copyWith(fields) {
    return new NewsletterModel({
      id: fields.id !== undefined ? fields.id : this.id,
      email: fields.email !== undefined ? fields.email : this.email,
      subscribedAt: fields.subscribedAt !== undefined ? fields.subscribedAt : this.subscribedAt,
    });
  }
}

export default NewsletterModel;
