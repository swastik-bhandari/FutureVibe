import z from "zod";

export const registerUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must be at most 50 characters long"),
    email: z.string().email({ message: "Invalid email address" }), // Modified slightly to ensure string() is called
    password: z
        .string()
        .min(8, "Password must be atleast 8 digits")
        .max(50, "Password is too long")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,15}$/, "Password must include uppercase, lowercase, number, and special character"),
});

export const loginUserSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, "Password must be atleast 8 digits").max(50, "Password is too long"),
});
