// Script to test Forgot Password flow using Node.js native fetch
// Run this with: npx ts-node test-forgot-password.ts

const API_URL = "http://localhost:3000/api/auth";

async function makeRequest(endpoint: string, payload: any) {
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    
    const data: any = await response.json();
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
        console.log("✅ Đăng ký thành công!");

        // 2. Yêu cầu quên mật khẩu
        console.log(`\n2. Gửi yêu cầu quên mật khẩu cho: ${email}`);
        const forgotRes = await makeRequest("forgot-password", { email });
        const otp = forgotRes.data.otp;
        console.log(`🔑 Mã OTP khôi phục mật khẩu nhận được: ${otp}`);

        // 3. Thử nhập sai OTP để kiểm tra đếm số lần nhập sai
        console.log("\n3. Thử nhập sai OTP lần 1...");
        try {
            await makeRequest("reset-password", {
                email,
                otp: "000000", // Sai OTP
                newPassword: "newpassword456",
                confirmPassword: "newpassword456"
            });
        } catch (error: any) {
            console.log(`❌ Nhập sai mong đợi: ${error.message}`);
        }

        // 4. Nhập đúng OTP để kiểm tra đặt lại mật khẩu thành công
        console.log("\n4. Thực hiện đặt lại mật khẩu mới với OTP đúng...");
        const resetRes = await makeRequest("reset-password", {
            email,
            otp,
            newPassword: "newpassword456",
            confirmPassword: "newpassword456"
        });
        console.log("✅ Đặt lại mật khẩu thành công!", resetRes.message);

        // 5. Thử đăng nhập lại bằng mật khẩu mới
        console.log("\n5. Đăng nhập lại bằng mật khẩu mới...");
        const loginRes = await makeRequest("login", {
            email,
            password: "newpassword456"
        });
        console.log("✅ Đăng nhập thành công!", loginRes.data.user.email);

        // 6. Test nhập sai quá 4 lần (tạo mới tài khoản và yêu cầu OTP mới)
        console.log("\n--- TEST VÔ HIỆU HÓA OTP KHI NHẬP SAI QUÁ 4 LẦN ---");
        const email2 = `test_limit_${Date.now()}@gmail.com`;
        await makeRequest("register", {
            email: email2,
            password: "password123",
            confirmPassword: "password123",
            fullName: "Test User Limit"
        });
        const forgotRes2 = await makeRequest("forgot-password", { email: email2 });
        const otp2 = forgotRes2.data.otp;
        console.log(`🔑 Mã OTP mới của ${email2} là: ${otp2}`);

        for (let i = 1; i <= 4; i++) {
            console.log(`Thử nhập sai lần ${i}...`);
            try {
                await makeRequest("reset-password", {
                    email: email2,
                    otp: "999999", // Sai OTP
                    newPassword: "newpassword456"
                });
            } catch (error: any) {
                console.log(`❌ Kết quả: ${error.message}`);
            }
        }

        console.log("\nThử nhập OTP ĐÚNG sau khi đã bị vô hiệu hóa...");
        try {
            await makeRequest("reset-password", {
                email: email2,
                otp: otp2, // OTP đúng nhưng đã bị khóa
                newPassword: "newpassword456"
            });
        } catch (error: any) {
            console.log(`❌ Kết quả khóa mong đợi: ${error.message}`);
        }

    } catch (error: any) {
        console.error("\n❌ Lỗi kiểm tra luồng quên mật khẩu:", error.message);
    }
}

runTests();
