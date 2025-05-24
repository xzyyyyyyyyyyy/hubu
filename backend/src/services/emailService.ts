import nodemailer from 'nodemailer';

// 创建邮件传输器
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 邮件模板
const emailTemplates = {
  verification: (username: string, code: string) => ({
    subject: '湖大校园平台 - 邮箱验证',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">湖大校园平台</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">你好，${username}！</h2>
          <p style="color: #666; line-height: 1.6;">
            感谢您注册湖大校园平台。请使用以下验证码完成邮箱验证：
          </p>
          <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">
              ${code}
            </span>
          </div>
          <p style="color: #666; font-size: 14px;">
            验证码有效期为15分钟，请尽快使用。如果这不是您的操作，请忽略此邮件。
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #e9ecef; color: #6c757d; font-size: 12px;">
          <p>© 2024 湖大校园平台. 保留所有权利.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (username: string, resetToken: string) => ({
    subject: '湖大校园平台 - 密码重置',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">湖大校园平台</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">你好，${username}！</h2>
          <p style="color: #666; line-height: 1.6;">
            您请求重置密码。点击下面的按钮来重置您的密码：
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              重置密码
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            链接有效期为30分钟。如果按钮无法点击，请复制以下链接到浏览器：<br>
            <span style="word-break: break-all;">${process.env.FRONTEND_URL}/reset-password?token=${resetToken}</span>
          </p>
          <p style="color: #666; font-size: 14px;">
            如果这不是您的操作，请忽略此邮件，您的密码不会被更改。
          </p>
        </div>
        <div style="padding: 20px; text-align: center; background: #e9ecef; color: #6c757d; font-size: 12px;">
          <p>© 2024 湖大校园平台. 保留所有权利.</p>
        </div>
      </div>
    `
  }),

  notification: (username: string, title: string, content: string) => ({
    subject: `湖大校园平台 - ${title}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">湖大校园平台</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">你好，${username}！</h2>
          <h3 style="color: #667eea;">${title}</h3>
          <div style="color: #666; line-height: 1.6;">
            ${content}
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              查看详情
            </a>
          </div>
        </div>
        <div style="padding: 20px; text-align: center; background: #e9ecef; color: #6c757d; font-size: 12px;">
          <p>© 2024 湖大校园平台. 保留所有权利.</p>
        </div>
      </div>
    `
  })
};

// 发送验证邮件
export const sendVerificationEmail = async (
  email: string, 
  username: string, 
  code: string
): Promise<void> => {
  const template = emailTemplates.verification(username, code);
  
  await transporter.sendMail({
    from: `"湖大校园平台" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html
  });
};

// 发送密码重置邮件
export const sendPasswordResetEmail = async (
  email: string, 
  username: string, 
  resetToken: string
): Promise<void> => {
  const template = emailTemplates.passwordReset(username, resetToken);
  
  await transporter.sendMail({
    from: `"湖大校园平台" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html
  });
};

// 发送通知邮件
export const sendNotificationEmail = async (
  email: string, 
  username: string, 
  title: string, 
  content: string
): Promise<void> => {
  const template = emailTemplates.notification(username, title, content);
  
  await transporter.sendMail({
    from: `"湖大校园平台" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: template.subject,
    html: template.html
  });
};