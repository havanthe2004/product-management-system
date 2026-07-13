"use strict";
// Script to test Forgot Password flow using Node.js native fetch
// Run this with: npx ts-node test-forgot-password.ts
Object.defineProperty(exports, "__esModule", { value: true });
const API_URL = "http://localhost:3000/api/auth";
async function makeRequest(endpoint, payload) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || JSON.stringify(data));
    }
    return data;
}
async function runTests() {
    try {
        console.log("🚀 Bắt đầu kiểm tra luồng Quên mật khẩu...");
        // 1. Đăng ký tài khoản test
        const email = `test_${Date.now()}@gmail.com`;
        console.log(`\n1. Đăng ký tài khoản: ${email}`);
        const regRes = await makeRequest("register", {
            email,
            password: "password123",
            confirmPassword: "password123",
            fullName: "Test User"
        });
        console.log("✅ Đăng ký thành công!", regRes);
        // 2. Yêu cầu quên mật khẩu
        console.log(`\n2. Gửi yêu cầu quên mật khẩu cho: ${email}`);
        const forgotRes = await makeRequest("forgot-password", { email });
        console.log("✅ Gửi yêu cầu thành công!", forgotRes);
        const otp = forgotRes.data.otp;
        console.log(`🔑 Mã OTP khôi phục mật khẩu nhận được: ${otp}`);
        // 3. Đặt lại mật khẩu mới
        console.log("\n3. Thực hiện đặt lại mật khẩu mới (chỉ dùng OTP)...");
        const resetRes = await makeRequest("reset-password", {
            otp,
            newPassword: "newpassword456",
            confirmPassword: "newpassword456"
        });
        console.log("✅ Đặt lại mật khẩu thành công!", resetRes);
        // 4. Thử đăng nhập lại bằng mật khẩu mới
        console.log("\n4. Đăng nhập lại bằng mật khẩu mới...");
        const loginRes = await makeRequest("login", {
            email,
            password: "newpassword456"
        });
        console.log("✅ Đăng nhập thành công!", loginRes);
    }
    catch (error) {
        console.error("\n❌ Lỗi kiểm tra luồng quên mật khẩu:", error.message);
    }
}
runTests();
//# sourceMappingURL=test-forgot-password.js.map