import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// 1. Create an interface representing a document in MongoDB.
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
  xp: number;
  level: number;
  badges: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  isActive: boolean;
  lastLogin?: Date;
  enrolledCourses: mongoose.Types.ObjectId[];
  createdCourses: mongoose.Types.ObjectId[];
  favoriteCourses: mongoose.Types.ObjectId[];
  matchPassword(enteredPassword: string): Promise<boolean>;
}

// 2. Create a Schema corresponding to the document interface.
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Security: don't return password by default
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
      index: true,
    },
    avatar: {
      type: String,
      default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    badges: [{
      type: Schema.Types.ObjectId,
      ref: 'Badge',
    }],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // For quicker filtering
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    enrolledCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    createdCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
    }],
    favoriteCourses: [{
      type: Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    }],
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Indexes
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ xp: -1 });

// Query Middleware to automatically filter out soft-deleted users
userSchema.pre(/^find/, function (this: any) {
  this.where({ isDeleted: { $ne: true } });
});

// Method to verify passwords on login
userSchema.methods.matchPassword = async function (enteredPassword: string) {   
  // Because password is select: false, we need to explicitly query it if it's not present
  if (!this.password) {
      const user = await mongoose.model('User').findById(this._id).select('+password');
      if(!user || !user.password) return false;
      return await bcrypt.compare(enteredPassword, user.password);
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash passwords before saving them
userSchema.pre('save', async function (this: any) {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  else {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password as string, salt);
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
