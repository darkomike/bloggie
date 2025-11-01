class ContactModel {
  constructor({ id = '', name = '', email = '', message = '', createdAt = null }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.message = message;
    this.createdAt = createdAt;
  }

  static fromFirestore(doc) {
    const data = doc.data ? doc.data() : doc;
    return new ContactModel({
      id: doc.id || data.id || '',
      name: data.name || '',
      email: data.email || '',
      message: data.message || '',
      createdAt: data.createdAt || null,
    });
  }

  toFirestore() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      message: this.message,
      createdAt: this.createdAt,
    };
  }

  copyWith(fields) {
    return new ContactModel({
      id: fields.id !== undefined ? fields.id : this.id,
      name: fields.name !== undefined ? fields.name : this.name,
      email: fields.email !== undefined ? fields.email : this.email,
      message: fields.message !== undefined ? fields.message : this.message,
      createdAt: fields.createdAt !== undefined ? fields.createdAt : this.createdAt,
    });
  }
}

export default ContactModel;
