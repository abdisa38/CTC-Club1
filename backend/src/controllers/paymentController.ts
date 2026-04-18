import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import PaymentTransaction, { PaymentStatus } from '../models/paymentTransactionModel';
import User from '../models/userModel';
import Course from '../models/courseModel';
import { AuthRequest } from '../middleware/authMiddleware';
import { sendSuccess } from '../utils/apiResponse';

const CHAPA_API_BASE_URL = process.env.CHAPA_API_BASE_URL || 'https://api.chapa.co';
const PREMIUM_CURRENCY = 'ETB';
const PREMIUM_AMOUNT_ETB = (() => {
  const value = Number(process.env.PREMIUM_PRICE_ETB || 200);
  if (!Number.isFinite(value) || value <= 0) {
    return 200;
  }

  return Number(value.toFixed(2));
})();

const getServerUrl = () => process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const asRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
};

const normalizeStatus = (value: unknown) => String(value || '').trim().toLowerCase();
const normalizeUpperText = (value: unknown) => String(value || '').trim().toUpperCase();

const parseOptionalNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(String(value ?? '').trim());
  return Number.isFinite(parsed) ? parsed : null;
};

const parseOptionalDate = (value: unknown): Date | undefined => {
  const raw = String(value ?? '').trim();
  if (!raw) {
    return undefined;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
};

const formatProviderMessage = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    const parts = value
      .map((item) => formatProviderMessage(item))
      .filter(Boolean);

    return parts.join(', ');
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, entryValue]) => {
        const formatted = formatProviderMessage(entryValue);
        return formatted ? `${key}: ${formatted}` : '';
      })
      .filter(Boolean);

    return entries.join('; ');
  }

  return '';
};

const sanitizeChapaCustomizationText = (
  value: string,
  options?: {
    maxLength?: number;
    fallback?: string;
  }
) => {
  const maxLength = Number(options?.maxLength || 64);
  const fallback = String(options?.fallback || 'CTC Payment').trim() || 'CTC Payment';

  const normalized = String(value || '')
    .replace(/[^a-zA-Z0-9._\- ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const safeValue = normalized.slice(0, maxLength).trim();
  if (safeValue) {
    return safeValue;
  }

  return fallback.slice(0, maxLength).trim() || 'CTC Payment';
};

const splitName = (fullName: string) => {
  const parts = String(fullName || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Student';
  const lastName = parts.slice(1).join(' ') || 'Member';

  return { firstName, lastName };
};

const createPremiumTxRef = (userId: string) => {
  const safeUserSuffix = String(userId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || 'user';
  const timePart = Date.now().toString(36);
  const randomPart = crypto.randomBytes(3).toString('hex');

  // Chapa enforces a 50-char limit for tx_ref.
  return `ctcpr-${safeUserSuffix}-${timePart}-${randomPart}`.slice(0, 50);
};

const createCourseTxRef = (courseId: string, userId: string) => {
  const safeCourseSuffix = String(courseId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || 'course';
  const safeUserSuffix = String(userId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || 'user';
  const timePart = Date.now().toString(36);
  const randomPart = crypto.randomBytes(3).toString('hex');

  return `ctccr-${safeCourseSuffix}-${safeUserSuffix}-${timePart}-${randomPart}`.slice(0, 50);
};

const mapProviderStatusToPaymentStatus = (status: string): PaymentStatus => {
  const normalized = normalizeStatus(status);

  if (normalized === 'success' || normalized === 'successful') {
    return 'success';
  }

  if (normalized === 'pending') {
    return 'pending';
  }

  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'cancelled';
  }

  if (normalized === 'initialized') {
    return 'initialized';
  }

  return 'failed';
};

const requireChapaSecretKey = (res: Response) => {
  const key = String(process.env.CHAPA_SECRET_KEY || '').trim();
  if (!key) {
    res.status(500);
    throw new Error('Chapa is not configured. Add CHAPA_SECRET_KEY in backend environment variables.');
  }

  return key;
};

const buildPremiumReturnUrl = (txRef: string) => {
  const fallback = new URL('/app/premium-return', getClientUrl());
  const configured = String(process.env.CHAPA_RETURN_URL || '').trim();
  let targetUrl = fallback;

  if (configured) {
    try {
      targetUrl = new URL(configured);
    } catch {
      targetUrl = fallback;
    }
  }

  targetUrl.searchParams.set('tx_ref', txRef);
  return targetUrl.toString();
};

const buildCourseReturnUrl = (courseId: string, txRef: string) => {
  const defaultTarget = new URL(`/app/courses/${courseId}`, getClientUrl());
  const configured = String(process.env.CHAPA_COURSE_RETURN_URL || '').trim();
  let targetUrl = defaultTarget;

  if (configured) {
    try {
      const expanded = configured.includes('{courseId}')
        ? configured.replace('{courseId}', encodeURIComponent(courseId))
        : configured;
      targetUrl = new URL(expanded, getClientUrl());
    } catch {
      targetUrl = defaultTarget;
    }
  }

  targetUrl.searchParams.set('tx_ref', txRef);
  return targetUrl.toString();
};

const getChapaCallbackUrl = () => {
  const configured = String(process.env.CHAPA_CALLBACK_URL || '').trim();
  if (configured) {
    return configured;
  }

  return `${getServerUrl()}/api/payments/chapa/callback`;
};

type ChapaVerificationSnapshot = {
  apiStatus: string;
  transactionStatus: string;
  amount: number | null;
  currency: string;
  txRef: string;
  reference: string;
  chapaReference: string;
  paymentMethod: string;
  paidAt?: Date;
  
  raw: unknown;
};

const parseChapaVerificationSnapshot = (payload: unknown): ChapaVerificationSnapshot => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const paidAt = parseOptionalDate(data.created_at ?? data.paid_at ?? data.updated_at);

  return {
    apiStatus: normalizeStatus(root.status),
    transactionStatus: normalizeStatus(data.status),
    amount: parseOptionalNumber(data.amount),
    currency: normalizeUpperText(data.currency),
    txRef: String(data.tx_ref ?? data.trx_ref ?? '').trim(),
    reference: String(data.reference ?? data.ref_id ?? '').trim(),
    chapaReference: String(data.chapa_reference ?? '').trim(),
    paymentMethod: String(data.payment_method ?? data.method ?? '').trim(),
    ...(paidAt ? { paidAt } : {}),
    raw: payload,
  };
};

const verifyTransactionWithChapa = async (txRef: string, secretKey: string) => {
  const response = await fetch(`${CHAPA_API_BASE_URL}/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  });

  const payload = await response.json().catch(() => null);
  const payloadRecord = asRecord(payload);

  if (!response.ok) {
    const providerMessage = String(payloadRecord.message || `Chapa verification failed with status ${response.status}`);
    throw new Error(providerMessage);
  }

  return parseChapaVerificationSnapshot(payload);
};

const ensureCourseEnrollment = async (userId: string, courseId: string) => {
  await Course.findByIdAndUpdate(
    courseId,
    { $addToSet: { students: userId } },
    { new: false }
  );

  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { enrolledCourses: courseId } },
    { new: false }
  );
};

const finalizePaymentTransaction = async (
  txRef: string,
  secretKey: string,
  options?: {
    userId?: string;
    expectedType?: 'premium' | 'course';
    expectedCourseId?: string;
  }
) => {
  const filter: Record<string, unknown> = { txRef };
  if (options?.userId) {
    filter.user = options.userId;
  }
  if (options?.expectedType) {
    filter.transactionType = options.expectedType;
  }
  if (options?.expectedCourseId) {
    filter.course = options.expectedCourseId;
  }

  const transaction = await PaymentTransaction.findOne(filter);
  if (!transaction) {
    return {
      transaction: null,
      user: null,
      course: null,
      verified: false,
      reason: 'Transaction not found.',
    };
  }

  const snapshot = await verifyTransactionWithChapa(txRef, secretKey);

  transaction.rawVerifyResponse = snapshot.raw;
  transaction.verifiedAt = new Date();

  if (snapshot.reference) {
    transaction.paymentReference = snapshot.reference;
  }

  if (snapshot.chapaReference) {
    transaction.chapaReference = snapshot.chapaReference;
  }

  if (snapshot.paymentMethod) {
    transaction.paymentMethod = snapshot.paymentMethod;
  }

  if (snapshot.paidAt) {
    transaction.paidAt = snapshot.paidAt;
  }

  const amountMatches = snapshot.amount !== null && Math.abs(snapshot.amount - Number(transaction.amount)) < 0.01;
  const currencyMatches = snapshot.currency === normalizeUpperText(transaction.currency);
  const isVerifiedSuccess = (
    snapshot.apiStatus === 'success'
    && snapshot.transactionStatus === 'success'
    && amountMatches
    && currencyMatches
  );

  transaction.status = isVerifiedSuccess
    ? 'success'
    : mapProviderStatusToPaymentStatus(snapshot.transactionStatus || snapshot.apiStatus);

  await transaction.save();

  if (isVerifiedSuccess) {
    if (transaction.transactionType === 'premium') {
      const premiumUser = await User.findById(transaction.user);
      if (premiumUser && !premiumUser.isPremium) {
        premiumUser.isPremium = true;
        premiumUser.premiumActivatedAt = new Date();
        await premiumUser.save();
      }
    }

    if (transaction.transactionType === 'course' && transaction.course) {
      await ensureCourseEnrollment(String(transaction.user), String(transaction.course));
    }
  }

  const user = await User.findById(transaction.user).select('-password');
  let course = null;
  if (transaction.transactionType === 'course' && transaction.course) {
    course = await Course.findById(transaction.course).select('_id title price currency students instructor');
  }

  let reason = '';
  if (!isVerifiedSuccess) {
    if (snapshot.apiStatus !== 'success') {
      reason = 'Payment provider could not verify this transaction yet.';
    } else if (snapshot.transactionStatus !== 'success') {
      reason = `Payment status is ${snapshot.transactionStatus || 'unknown'}.`;
    } else if (!amountMatches) {
      reason = 'Paid amount does not match the expected premium price.';
    } else if (!currencyMatches) {
      reason = 'Paid currency does not match ETB.';
    } else {
      reason = 'Payment verification failed.';
    }
  }

  return {
    transaction,
    user,
    course,
    verified: isVerifiedSuccess,
    reason,
  };
};

const getHeaderValue = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return String(value[0] || '');
  }

  return String(value || '');
};

const secureCompare = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const isValidWebhookSignature = (req: Request, secret: string) => {
  const signatures = [
    getHeaderValue(req.headers['x-chapa-signature']).trim(),
    getHeaderValue(req.headers['chapa-signature']).trim(),
  ].filter(Boolean);

  if (signatures.length === 0) {
    return false;
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body || {}))
    .digest('hex');

  return signatures.some((signature) => secureCompare(signature, expected));
};

// @desc    Initialize 200 ETB premium payment and return checkout URL
// @route   POST /api/payments/premium/initialize
// @access  Private
export const initializePremiumPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?._id).select('name email isPremium');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.isPremium) {
    sendSuccess(res, {
      alreadyPremium: true,
      isPremium: true,
      amount: PREMIUM_AMOUNT_ETB,
      currency: PREMIUM_CURRENCY,
    }, { message: 'You already have premium access.' });
    return;
  }

  const secretKey = requireChapaSecretKey(res);
  const txRef = createPremiumTxRef(String(user._id));
  const { firstName, lastName } = splitName(user.name);
  const premiumTitle = sanitizeChapaCustomizationText('CTC Premium', {
    maxLength: 16,
    fallback: 'CTC Premium',
  });
  const premiumDescription = sanitizeChapaCustomizationText(`${PREMIUM_AMOUNT_ETB} ETB premium upgrade`, {
    maxLength: 64,
    fallback: 'Premium payment',
  });

  const initializePayload = {
    amount: PREMIUM_AMOUNT_ETB.toFixed(2),
    currency: PREMIUM_CURRENCY,
    email: user.email,
    first_name: firstName,
    last_name: lastName,
    tx_ref: txRef,
    callback_url: getChapaCallbackUrl(),
    return_url: buildPremiumReturnUrl(txRef),
    customization: {
      title: premiumTitle,
      description: premiumDescription,
    },
    meta: {
      userId: String(user._id),
      purpose: 'premium-upgrade',
    },
  };

  const response = await fetch(`${CHAPA_API_BASE_URL}/v1/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(initializePayload),
  });

  const payload = await response.json().catch(() => null);
  const payloadRecord = asRecord(payload);
  const payloadData = asRecord(payloadRecord.data);
  const checkoutUrl = String(payloadData.checkout_url || '').trim();

  if (!response.ok || normalizeStatus(payloadRecord.status) !== 'success' || !checkoutUrl) {
    const providerMessage = formatProviderMessage(payloadRecord.message) || 'Chapa failed to initialize payment.';
    const statusCode = response.status >= 400 && response.status < 500 ? 400 : 502;
    res.status(statusCode);
    throw new Error(providerMessage);
  }

  await PaymentTransaction.create({
    user: user._id,
    transactionType: 'premium',
    txRef,
    amount: PREMIUM_AMOUNT_ETB,
    currency: PREMIUM_CURRENCY,
    status: 'initialized',
    checkoutUrl,
    rawInitializeResponse: payload,
  });

  sendSuccess(res, {
    txRef,
    checkoutUrl,
    amount: PREMIUM_AMOUNT_ETB,
    currency: PREMIUM_CURRENCY,
  }, { message: 'Premium checkout initialized.' });
});

// @desc    Initialize a paid course checkout (free courses enroll directly)
// @route   POST /api/payments/courses/:courseId/initialize
// @access  Private
export const initializeCoursePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courseId = String(req.params.courseId || '').trim();
  if (!courseId) {
    res.status(400);
    throw new Error('Course ID is required');
  }

  const user = await User.findById(req.user?._id).select('name email role');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const course = await Course.findById(courseId).select('title price currency status students instructor');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isInstructorOwner = String(course.instructor) === String(user._id);
  const isAdmin = user.role === 'admin';
  const isAlreadyEnrolled = Array.isArray(course.students)
    && course.students.some((studentId: any) => String(studentId) === String(user._id));

  const coursePrice = Number(course.price || 0);
  if (!Number.isFinite(coursePrice) || coursePrice < 0) {
    res.status(400);
    throw new Error('Invalid course price.');
  }

  const hasSuccessfulCoursePayment = coursePrice > 0
    ? Boolean(
        await PaymentTransaction.findOne({
          user: user._id,
          transactionType: 'course',
          course: course._id,
          status: 'success',
        })
          .select('_id')
          .lean()
      )
    : false;

  if (isInstructorOwner || isAdmin || hasSuccessfulCoursePayment) {
    sendSuccess(res, {
      courseId: String(course._id),
      alreadyEnrolled: true,
      isEnrolled: true,
      amount: Number(course.price || 0),
      currency: 'ETB',
      requiresPayment: false,
    }, { message: 'Course access is already active for this user.' });
    return;
  }

  const courseCurrency = normalizeUpperText(course.currency || 'ETB') || 'ETB';
  if (courseCurrency !== 'ETB') {
    await Course.findByIdAndUpdate(course._id, { currency: 'ETB' });
  }

  if (coursePrice === 0) {
    if (!isAlreadyEnrolled) {
      await ensureCourseEnrollment(String(user._id), String(course._id));
    }

    sendSuccess(res, {
      courseId: String(course._id),
      alreadyEnrolled: false,
      isEnrolled: true,
      requiresPayment: false,
      amount: 0,
      currency: 'ETB',
    }, { message: 'Free course enrolled successfully.' });
    return;
  }

  const secretKey = requireChapaSecretKey(res);
  const txRef = createCourseTxRef(String(course._id), String(user._id));
  const { firstName, lastName } = splitName(user.name);
  const courseTitleForCheckout = sanitizeChapaCustomizationText(course.title, {
    maxLength: 16,
    fallback: 'CTC Course',
  });
  const courseDescriptionForCheckout = sanitizeChapaCustomizationText(`${coursePrice.toFixed(2)} ETB course payment`, {
    maxLength: 64,
    fallback: 'Course payment',
  });

  const initializePayload = {
    amount: coursePrice.toFixed(2),
    currency: 'ETB',
    email: user.email,
    first_name: firstName,
    last_name: lastName,
    tx_ref: txRef,
    callback_url: getChapaCallbackUrl(),
    return_url: buildCourseReturnUrl(String(course._id), txRef),
    customization: {
      title: courseTitleForCheckout,
      description: courseDescriptionForCheckout,
    },
    meta: {
      userId: String(user._id),
      courseId: String(course._id),
      purpose: 'course-purchase',
    },
  };

  const response = await fetch(`${CHAPA_API_BASE_URL}/v1/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(initializePayload),
  });

  const payload = await response.json().catch(() => null);
  const payloadRecord = asRecord(payload);
  const payloadData = asRecord(payloadRecord.data);
  const checkoutUrl = String(payloadData.checkout_url || '').trim();

  if (!response.ok || normalizeStatus(payloadRecord.status) !== 'success' || !checkoutUrl) {
    const providerMessage = formatProviderMessage(payloadRecord.message) || 'Chapa failed to initialize course payment.';
    const statusCode = response.status >= 400 && response.status < 500 ? 400 : 502;
    res.status(statusCode);
    throw new Error(providerMessage);
  }

  await PaymentTransaction.create({
    user: user._id,
    transactionType: 'course',
    course: course._id,
    txRef,
    amount: coursePrice,
    currency: 'ETB',
    status: 'initialized',
    checkoutUrl,
    rawInitializeResponse: payload,
  });

  sendSuccess(res, {
    courseId: String(course._id),
    txRef,
    checkoutUrl,
    amount: coursePrice,
    currency: 'ETB',
    requiresPayment: true,
    isEnrolled: false,
  }, { message: 'Course checkout initialized.' });
});

// @desc    Verify a premium payment and activate membership
// @route   GET /api/payments/premium/verify/:txRef
// @access  Private
export const verifyPremiumPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const txRef = String(req.params.txRef || '').trim();
  if (!txRef) {
    res.status(400);
    throw new Error('Transaction reference is required');
  }

  const secretKey = requireChapaSecretKey(res);
  const result = await finalizePaymentTransaction(txRef, secretKey, {
    userId: String(req.user?._id || ''),
    expectedType: 'premium',
  });

  if (!result.transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  const isPremium = Boolean(result.user?.isPremium);

  if (!result.verified) {
    sendSuccess(res, {
      txRef,
      status: result.transaction.status,
      paymentVerified: false,
      isPremium,
      reason: result.reason,
    }, { message: 'Payment is not completed yet.' });
    return;
  }

  sendSuccess(res, {
    txRef,
    status: result.transaction.status,
    paymentVerified: true,
    isPremium,
    premiumActivatedAt: result.user?.premiumActivatedAt,
  }, { message: 'Premium access activated successfully.' });
});

// @desc    Verify a paid course transaction and activate course enrollment
// @route   GET /api/payments/courses/:courseId/verify/:txRef
// @access  Private
export const verifyCoursePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
  const courseId = String(req.params.courseId || '').trim();
  const txRef = String(req.params.txRef || '').trim();

  if (!courseId) {
    res.status(400);
    throw new Error('Course ID is required');
  }

  if (!txRef) {
    res.status(400);
    throw new Error('Transaction reference is required');
  }

  const secretKey = requireChapaSecretKey(res);
  const result = await finalizePaymentTransaction(txRef, secretKey, {
    userId: String(req.user?._id || ''),
    expectedType: 'course',
    expectedCourseId: courseId,
  });

  if (!result.transaction) {
    res.status(404);
    throw new Error('Course payment transaction not found');
  }

  const isEnrolled = Boolean(result.course && Array.isArray(result.course.students)
    && result.course.students.some((studentId: any) => String(studentId) === String(req.user?._id || '')));

  if (!result.verified) {
    sendSuccess(res, {
      courseId,
      txRef,
      status: result.transaction.status,
      paymentVerified: false,
      isEnrolled,
      reason: result.reason,
    }, { message: 'Course payment is not completed yet.' });
    return;
  }

  sendSuccess(res, {
    courseId,
    txRef,
    status: result.transaction.status,
    paymentVerified: true,
    isEnrolled,
  }, { message: 'Course access activated successfully.' });
});

// @desc    Handle Chapa callback (best-effort transaction update)
// @route   GET /api/payments/chapa/callback
// @access  Public
export const chapaCallback = asyncHandler(async (req: Request, res: Response) => {
  const txRef = String(req.query.tx_ref || req.query.trx_ref || '').trim();
  const status = normalizeStatus(req.query.status);

  if (txRef) {
    await PaymentTransaction.findOneAndUpdate(
      { txRef },
      {
        status: mapProviderStatusToPaymentStatus(status),
        rawWebhookPayload: {
          callbackQuery: req.query,
          callbackBody: req.body,
        },
      },
      { new: true }
    );

    if (status === 'success') {
      const secretKey = String(process.env.CHAPA_SECRET_KEY || '').trim();
      if (secretKey) {
        try {
          await finalizePaymentTransaction(txRef, secretKey);
        } catch (error) {
          console.error('Failed to auto-verify callback transaction', error);
        }
      }
    }
  }

  res.status(200).json({ received: true });
});

// @desc    Handle Chapa webhook events
// @route   POST /api/payments/chapa/webhook
// @access  Public
export const chapaWebhook = asyncHandler(async (req: Request, res: Response) => {
  const webhookSecret = String(process.env.CHAPA_WEBHOOK_SECRET || '').trim();

  if (webhookSecret && !isValidWebhookSignature(req, webhookSecret)) {
    res.status(401);
    throw new Error('Invalid Chapa webhook signature');
  }

  const body = asRecord(req.body);
  const txRef = String(body.tx_ref ?? body.trx_ref ?? '').trim();
  const status = normalizeStatus(body.status);

  if (!txRef) {
    res.status(200).json({ received: true, ignored: true });
    return;
  }

  await PaymentTransaction.findOneAndUpdate(
    { txRef },
    {
      status: mapProviderStatusToPaymentStatus(status),
      rawWebhookPayload: req.body,
    },
    { new: true }
  );

  if (status === 'success') {
    const secretKey = String(process.env.CHAPA_SECRET_KEY || '').trim();
    if (secretKey) {
      try {
        await finalizePaymentTransaction(txRef, secretKey);
      } catch (error) {
        console.error('Failed to verify webhook transaction', error);
      }
    }
  }

  res.status(200).json({ received: true });
});
