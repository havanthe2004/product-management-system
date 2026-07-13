import nodemailer from "nodemailer";

/**
 * Helper to send email alerts (e.g. OTP codes)
 */
export class EmailHelper {

    /**
     * Send a password reset OTP code
     */
    static async sendOTP(email: string, otp: string): Promise<void> {
        const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
        const smtpPort = Number(process.env.SMTP_PORT) || 587;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        // Print to console regardless for debugging/local testing
        console.log(`
┌────────────────────────────────────────────────────────┐
│                   EMAIL DISPATCH                       │
├────────────────────────────────────────────────────────┤
│ To: ${email.padEnd(50)} │
│ Subject: Khôi phục mật khẩu - Mã OTP của bạn          │
│                                                        │
│ Mã OTP khôi phục mật khẩu của bạn là:                  │
│                   👉 ${otp} 👈                         │
│                                                        │
│ Mã này sẽ hết hạn trong vòng 10 phút.                 │
│ Vui lòng không chia sẻ mã này với bất kỳ ai.           │
└────────────────────────────────────────────────────────┘
`);

        if (smtpUser && smtpPass) {
            try {
                const transporter = nodemailer.createTransport({
                    host: smtpHost,
                    port: smtpPort,
                    secure: smtpPort === 465, // true for 465, false for 587/25
                    auth: {
                        user: smtpUser,
                        pass: smtpPass,
                    },
                });

                await transporter.sendMail({
                    from: `"Hệ thống Quản lý" <${smtpUser}>`,
                    to: email,
                    subject: "Khôi phục mật khẩu - Mã OTP của bạn",
                    text: `Mã OTP khôi phục mật khẩu của bạn là: ${otp}. Mã này sẽ hết hạn sau 10 phút.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                            <h2 style="color: #4F46E5; text-align: center;">Khôi phục mật khẩu</h2>
                            <p>Xin chào,</p>
                            <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu của bạn. Dưới đây là mã OTP xác thực:</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <span style="font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 4px; border: 2px dashed #4F46E5; padding: 10px 20px; background-color: #f3f4f6;">${otp}</span>
                            </div>
                            <p style="color: #ef4444; font-size: 13px;">Lưu ý: Mã này chỉ có hiệu lực trong vòng 10 phút và không được chia sẻ với bất kỳ ai.</p>
                            <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                            <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                            <p style="font-size: 11px; color: #9ca3af; text-align: center;">Hệ thống Quản lý Sản phẩm & Mặt hàng</p>
                        </div>
                    `,
                });
                console.log(`✉️ Email đã được gửi thành công đến ${email}`);
            } catch (error: any) {
                console.error("❌ Lỗi khi gửi email SMTP thực tế:", error.message);
            }
        } else {
            console.log("⚠️ Cấu hình SMTP trống (SMTP_USER/SMTP_PASS chưa được đặt trong .env). Đã hiển thị OTP trên console.");
        }
    }

}
