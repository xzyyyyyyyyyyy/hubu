import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// 通用验证中间件
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        message: '输入数据验证失败',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
      return;
    }
    
    next();
  };
};

// 用户注册验证规则
export const userRegistrationSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(2)
    .max(20)
    .required()
    .messages({
      'string.alphanum': '用户名只能包含字母和数字',
      'string.min': '用户名至少2个字符',
      'string.max': '用户名最多20个字符',
      'any.required': '用户名是必填项'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项'
    }),
  
  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': '密码至少6个字符',
      'string.max': '密码最多50个字符',
      'any.required': '密码是必填项'
    }),
  
  studentId: Joi.string()
    .pattern(/^[0-9]{10,12}$/)
    .required()
    .messages({
      'string.pattern.base': '学号格式不正确',
      'any.required': '学号是必填项'
    }),
  
  realName: Joi.string()
    .min(2)
    .max(20)
    .required()
    .messages({
      'string.min': '姓名至少2个字符',
      'string.max': '姓名最多20个字符',
      'any.required': '姓名是必填项'
    }),
  
  major: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '专业名称最多50个字符',
      'any.required': '专业是必填项'
    }),
  
  className: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': '班级名称最多50个字符',
      'any.required': '班级是必填项'
    }),
  
  qqNumber: Joi.string()
    .pattern(/^[0-9]{5,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'QQ号格式不正确',
      'any.required': 'QQ号是必填项'
    }),
  
  phone: Joi.string()
    .pattern(/^1[3-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': '手机号格式不正确',
      'any.required': '手机号是必填项'
    })
});

// 用户登录验证规则
export const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '请输入有效的邮箱地址',
      'any.required': '邮箱是必填项'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': '密码是必填项'
    })
});

// 发帖验证规则
export const postCreateSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.max': '标题最多100个字符',
      'any.required': '标题是必填项'
    }),
  
  content: Joi.string()
    .trim()
    .max(10000)
    .required()
    .messages({
      'string.max': '内容最多10000个字符',
      'any.required': '内容是必填项'
    }),
  
  category: Joi.string()
    .valid('general', 'academic', 'life', 'parttime', 'lostfound', 'market', 'dining', 'entertainment', 'notice', 'question', 'help')
    .required()
    .messages({
      'any.only': '分类不正确',
      'any.required': '分类是必填项'
    }),
  
  tags: Joi.array()
    .items(Joi.string().trim().max(20))
    .max(5)
    .default([])
    .messages({
      'array.max': '标签最多5个',
      'string.max': '单个标签最多20个字符'
    }),
  
  type: Joi.string()
    .valid('post', 'question', 'announcement', 'activity')
    .default('post'),
  
  isAnonymous: Joi.boolean()
    .default(false),
  
  images: Joi.array()
    .items(Joi.string())
    .max(9)
    .default([])
    .messages({
      'array.max': '最多上传9张图片'
    })
});

// 评论验证规则
export const commentCreateSchema = Joi.object({
  content: Joi.string()
    .trim()
    .max(1000)
    .required()
    .messages({
      'string.max': '评论内容最多1000个字符',
      'any.required': '评论内容是必填项'
    }),
  
  parent: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      'string.pattern.base': '父评论ID格式不正确'
    }),
  
  isAnonymous: Joi.boolean()
    .default(false)
});