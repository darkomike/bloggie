import { Timestamp } from 'firebase/firestore';

// Utility for serializing/deserializing time to/from Firebase
export class TimeUtil {
  // Converts Firestore Timestamp, JS Date, or string to JS Date
  static parseFirebaseTime(val) {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (typeof val === 'string') {
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    // Firestore Timestamp
    if (val.toDate) {
      try {
        return val.toDate();
      } catch {
        return null;
      }
    }
    return null;
  }
  // Converts JS Date, string, or Firestore Timestamp to ISO string
  static toISOString(val) {
    if (!val) return null;
    if (typeof val === 'string') {
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
    // Firestore Timestamp
    if (val.toDate) {
      try {
        return val.toDate().toISOString();
      } catch {
        return null;
      }
    }
    return null;
  }

  // Converts ISO string, JS Date, or Firestore Timestamp to Firestore Timestamp
  static toFirebaseTimestamp(val) {
    if (!val) return Timestamp.now();
    if (val instanceof Timestamp) return val;
    if (typeof val === 'string' || val instanceof Date) {
      const d = new Date(val);
      return Number.isNaN(d.getTime()) ? Timestamp.now() : Timestamp.fromDate(d);
    }
    if (val.toDate) {
      try {
        return Timestamp.fromDate(val.toDate());
      } catch {
        return Timestamp.now();
      }
    }
    return Timestamp.now();
  }

  // Utility function to format date
   static formatDate(date, format = 'MMM d, yyyy') {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  static formatCommentDate(date) {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  static formatRelativeTime(date) {
    const now = new Date();
    const inputDate = new Date(date);
    const diffMs = now - inputDate;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
    return inputDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  // Utility function to calculate reading time for blog posts
  static calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
}
}
