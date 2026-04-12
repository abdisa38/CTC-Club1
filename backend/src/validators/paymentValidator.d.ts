import { z } from 'zod';
export declare const verifyPremiumPaymentSchema: z.ZodObject<{
    params: z.ZodObject<{
        txRef: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const initializeCoursePaymentSchema: z.ZodObject<{
    params: z.ZodObject<{
        courseId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const verifyCoursePaymentSchema: z.ZodObject<{
    params: z.ZodObject<{
        courseId: z.ZodString;
        txRef: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
//# sourceMappingURL=paymentValidator.d.ts.map