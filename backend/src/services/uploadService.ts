import sharp from 'sharp';
import qiniu from 'qiniu';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY!;
const secretKey = process.env.QINIU_SECRET_KEY!;
const bucket = process.env.QINIU_BUCKET!;
const domain = process.env.QINIU_DOMAIN!;

const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2; // 华南机房

// 图片处理和上传到七牛云
export const uploadToQiniu = async (
  file: Express.Multer.File, 
  folder: string = 'general'
): Promise<string> => {
  try {
    // 生成唯一文件名
    const fileExt = path.extname(file.originalname);
    const fileName = `${folder}/${uuidv4()}${fileExt}`;

    // 处理图片（压缩、格式转换）
    let processedBuffer = file.buffer;
    
    if (file.mimetype.startsWith('image/')) {
      processedBuffer = await sharp(file.buffer)
        .resize(1920, 1080, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ quality: 85 })
        .toBuffer();
    }

    // 获取上传凭证
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: bucket,
      expires: 7200 // 2小时
    });
    const uploadToken = putPolicy.uploadToken(mac);

    // 创建上传对象
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    return new Promise((resolve, reject) => {
      formUploader.put(
        uploadToken,
        fileName,
        processedBuffer,
        putExtra,
        (err: any, body: any, info: any) => {
          if (err) {
            console.error('七牛云上传失败:', err);
            reject(err);
          } else if (info.statusCode === 200) {
            const fileUrl = `https://${domain}/${body.key}`;
            resolve(fileUrl);
          } else {
            console.error('七牛云上传失败:', info);
            reject(new Error('上传失败'));
          }
        }
      );
    });
  } catch (error) {
    console.error('文件处理失败:', error);
    throw new Error('文件处理失败');
  }
};

// 删除七牛云文件
export const deleteFromQiniu = async (fileUrl: string): Promise<void> => {
  try {
    const key = fileUrl.replace(`https://${domain}/`, '');
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    
    return new Promise((resolve, reject) => {
      bucketManager.delete(bucket, key, (err: any, respBody: any, respInfo: any) => {
        if (err) {
          console.error('七牛云删除失败:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  } catch (error) {
    console.error('删除文件失败:', error);
    throw error;
  }
};

// 批量上传文件
export const uploadMultipleToQiniu = async (
  files: Express.Multer.File[],
  folder: string = 'general'
): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadToQiniu(file, folder));
  return Promise.all(uploadPromises);
};

// 生成上传凭证（前端直传用）
export const generateUploadToken = (folder: string = 'general'): string => {
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: bucket,
    expires: 3600, // 1小时
    saveKey: `${folder}/$(etag)$(ext)`,
    fsizeLimit: 10 * 1024 * 1024, // 10MB限制
    mimeLimit: 'image/*'
  });
  
  return putPolicy.uploadToken(mac);
};