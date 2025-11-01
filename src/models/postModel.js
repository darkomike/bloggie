// Post model for Firestore
export class PostModel {
	constructor({
		id = '',
		title = '',
		slug = '',
		content = '',
		category = '',
		author = null,
		createdAt = null,
		updatedAt = null,
		tags = [],
		coverImage = '',
		status = 'published',
		readingTime = 0,
		published = true,
		excerpt = '',
		// Removed views, likes, comments, shares fields (handled by separate collections)
	} = {}) {
		this.id = id;
		this.title = title;
		this.slug = slug;
		this.content = content;
		this.category = category;
		this.author = author; // { uid, name, avatar, username, email }
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.tags = tags;
		this.coverImage = coverImage;
		this.status = status;
		this.readingTime = readingTime;
		this.published = published;
		this.excerpt = excerpt;
		// Removed views, likes, comments, shares assignments
	}	static fromFirestore(doc) {
		const data = doc.data ? doc.data() : doc;
			return new PostModel({
				id: doc.id || data.id || '',
				title: data.title || '',
				slug: data.slug || '',
				content: data.content || '',
				category: data.category || '',
				author: data.author || null,
				createdAt: data.createdAt || null,
				updatedAt: data.updatedAt || null,
				tags: data.tags || [],
				coverImage: data.coverImage || '',
				status: data.status || 'published',
				readingTime: data.readingTime || 0,
				published: data.published !== undefined ? data.published : true,
				excerpt: data.excerpt || '',
				// Removed views, likes, comments, shares from deserialization
			});
	}

	toFirestore() {
			return {
				id: this.id,
				title: this.title,
				slug: this.slug,
				content: this.content,
				category: this.category,
				author: this.author,
				createdAt: this.createdAt,
				updatedAt: this.updatedAt,
				tags: this.tags,
				coverImage: this.coverImage,
				status: this.status,
				readingTime: this.readingTime,
				published: this.published,
				excerpt: this.excerpt,
				// Removed views, likes, comments, shares from serialization
			};
	}

	copyWith(fields = {}) {
			return new PostModel({
				id: fields.id !== undefined ? fields.id : this.id,
				title: fields.title !== undefined ? fields.title : this.title,
				slug: fields.slug !== undefined ? fields.slug : this.slug,
				content: fields.content !== undefined ? fields.content : this.content,
				category: fields.category !== undefined ? fields.category : this.category,
				author: fields.author !== undefined ? fields.author : this.author,
				createdAt: fields.createdAt !== undefined ? fields.createdAt : this.createdAt,
				updatedAt: fields.updatedAt !== undefined ? fields.updatedAt : this.updatedAt,
				tags: fields.tags !== undefined ? fields.tags : this.tags,
				coverImage: fields.coverImage !== undefined ? fields.coverImage : this.coverImage,
				status: fields.status !== undefined ? fields.status : this.status,
				readingTime: fields.readingTime !== undefined ? fields.readingTime : this.readingTime,
				published: fields.published !== undefined ? fields.published : this.published,
				excerpt: fields.excerpt !== undefined ? fields.excerpt : this.excerpt,
				// Removed views, likes, comments, shares from copyWith
			});
	}
}

export default PostModel;
